
const a = require('awaiting');
const helpers = require('./../helpers');
const config = require('./../../config');
const uuidv4 = require('uuid').v4;
const debug = require('debug')('mon:getAlreadySuggestedItems');
const util = require('util');

module.exports = async function getAlreadySuggestedItems(page, orBrowser) {

    /*
    {
        profile: 'https://monopoly-one.com/profile/1811013',
        profileId: '1811013',
        profileName: 'Armen',
        items: [
        {
            id: 17430559,
            name: 'Air Baltic',
            imageUrl: 'https://cdn2.kirick.me/libs/monopoly/fields/brands/5_airlines/air_baltic.svg'
        },
        {
            id: 17746136,
            name: 'HTC',
            imageUrl: 'https://cdn2.kirick.me/libs/monopoly/fields/brands/8_smartphones/htc.svg'
        }
        ]
    }
    */

    const itemsUsed = {};

    if (! page && orBrowser) {
        page = await helpers.newPage(orBrowser);
    }



    //
    // Go to trades page
    //
    if (config.consider_cards_from_sent_suggestions) {
        debug('Получаем список карточек и игроков, которые уже использованы в отправленных обменах');
    } else {
        debug('Получаем список игроков, которые уже использованы в отправленных обменах');
    }

    const results = [];

    const getOutboundHandler = async (response) => {
        if (response.request().resourceType() !== 'fetch') {
            return;
        }
        if (response.url() != 'https://monopoly-one.com/api/trades.getOutbound') {
            return;
        }

        const resp = await response.json();

        let profileId;
        try {
            profileId = resp.data.trades[0].user_id_to;
        } catch (e) {
            console.log('PROBLEM WITH response from trades.getOutbound');
            console.log('Error:', e.message);
            console.log(resp);
            return;
        }
        const profileUrl = 'https://monopoly-one.com/profile/' + resp.data.trades[0].user_id_to;
        const profileName = getUserDataById(resp, profileId).nick;

        const itemsForSellList = [];  
        for (let thingFrom of resp.data.trades[0].things_from) {
            itemsUsed[thingFrom.thing_id] = true;
            itemsForSellList.push({
                id: thingFrom.thing_id,
                name: thingFrom.title,
                imageUrl: thingFrom.image,
            });
        }

        results.push({
            profileUrl: profileUrl,
            profileId: profileId,
            profileName: profileName,
            items: itemsForSellList,
        });
    }

    page.on('response', getOutboundHandler);

    await page.goto('https://monopoly-one.com/trades/outgoing', {referer: 'https://monopoly-one.com/m1tv'});

    await page.waitForSelector('.processing-default.processing');
    await helpers.waitSelectorDisappears(page, '.processing-default.processing');
    await a.delay(300);

    //
    // Load more results until page finished
    //
    debug('Подгружаем все записи если есть кнопка подгрузки');
    await helpers.scrollPageToBottom(page);
    let loadSuccess = false;
    while (loadSuccess = await loadMoreResults(page)) {
        await helpers.scrollPageToBottom(page);
        await a.delay(helpers.rand(10, 130));
    }

    const alreadyUsed = [];

    debug(`Общее кол-во уже отправленных предметов: ${Object.keys(itemsUsed).length}`);
    
    page.off('response', getOutboundHandler);


    return results;
}



async function loadMoreResults(page) {
    const loadingBtn = await page.$('.VueLoadBlock-block')
    if (! loadingBtn) {
        // loading finished
        return false;
    }
    const displayCss = await loadingBtn.evaluate(async (el) => {
        return el.style.display;
    });
    if (displayCss == 'none') {
        // loading finished
        return false;
    }

    await page._cursor.click('.VueLoadBlock-block');
    await a.delay(300);
    let loadingInProgressEl = null;
    while (loadingInProgressEl = await page.$('.VueLoadBlock-block.processing-default.processing')) {
        // still loading, wait
        await a.delay(200);
    }
    // load completed
    return true;
}


function getUserDataById(resp, profileId) {
    const userData = resp.data.users_data.find((userData) => {
        return userData.user_id == profileId;
    });

    /*
    userData
        admin_rights: 0
        approved: 0
        avatar: "https://d1.dogecdn.wtf/744855998287577088/sRWo1Zk6ElcF.jpg"
        games: 0
        games_wins: 0
        gender: 1
        moderator: 0
        muted: 0
        nick: "Alina Tricolor"
        nicks_old: ["Alina"]
        online: 1
        penalties: {}
        social_vk: 610791934
        superadmin: 0
        user_id: 1976473
        vip: 0
        xp: 0
        xp_level: 1
    */
    return userData;
}
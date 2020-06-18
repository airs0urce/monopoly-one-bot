
const a = require('awaiting');
const helpers = require('./../helpers');
const config = require('./../../config');
const uuidv4 = require('uuid').v4;
const debug = require('debug')('mon:getAlreadySuggestedItems');

module.exports = async function getAlreadySuggestedItems(page, orBrowser) {

    /*
    {
        profile: 'https://monopoly-one.com/profile/1811013',
        profileId: '1811013',
        profileName: 'Armen',
        items: [
        {
            id: 'thing_17430559',
            name: 'Air Baltic',
            imagUrl: 'https://cdn2.kirick.me/libs/monopoly/fields/brands/5_airlines/air_baltic.svg'
        },
        {
            id: 'thing_17746136',
            name: 'HTC',
            imagUrl: 'https://cdn2.kirick.me/libs/monopoly/fields/brands/8_smartphones/htc.svg'
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
    debug('Получаем список наших карточек, которые уже использованы в отправленных обменах');
    await page.goto('https://monopoly-one.com/trades', {referer: 'https://monopoly-one.com/m1tv'});
    await page.waitForSelector('[href="/trades/outgoing"]');
    await a.delay(300);
    await page.click('[href="/trades/outgoing"]');
    await page.waitForSelector('.trades-main-list.processing');
    await helpers.waitSelectorDisappears(page, '.trades-main-list.processing');
    await a.delay(400);

    //
    // Load more results until page finished
    //
    debug('Подгружаем все записей если есть кнопка подгрузки');
    await helpers.scrollPageToBottom(page);
    let loadSuccess = false;
    while (loadSuccess = await loadMoreResults(page)) {
        await helpers.scrollPageToBottom(page);
        await a.delay(helpers.rand(100, 300));
    }

    const alreadyUsed = [];
    // 
    // Take all items already on trade
    //
    debug('Парсинг всех предметов отправленных на обмен');
    const results = [];
    const items = await page.$$('div.trades-main-list-one');
    const handledIds = [];
    for (let item of items) {
        const profileUrl = await (await item.$('.trades-main-list-one-user-info-main a')).evaluate((el) => {
            return el.href;
        });

        const profileName = await (await item.$('.trades-main-list-one-user-info-main a')).evaluate((el) => {
            return el.innerText;
        });

        const itemsForSell = await page.$$('.trades-main-list-one-content .trades-main-list-one-content-one._lost .trades-main-list-one-content-one-list > div');
        const itemsForSellList = [];
        for (let itemForSell of itemsForSell) {
            const name = await (await itemForSell.$('.thing-image')).evaluate(async (el) => {
                return el.getAttribute('kd-tooltip');
            });

            const backgroundImage = await (await itemForSell.$('.thing-image div')).evaluate(async (el) => {
                let backgroundImage = el.style.backgroundImage;
                backgroundImage = backgroundImage.replace('url("', '').replace('")', '');
                return backgroundImage;
            });

            const id = await itemForSell.evaluate(async (el) => {
                return el.id;
            });

            if (handledIds.includes(id)) {
                continue;
            }
            handledIds.push(id);

            itemsForSellList.push({
                id: id,
                name: name,
                imagUrl: backgroundImage,
            });

            alreadyUsed.push(`${name} (id: ${id})`);

            itemsUsed[id] = 1;
        }

        results.push({
            profileUrl: profileUrl,
            profileId: profileUrl.replace('https://monopoly-one.com/profile/', ''),
            profileName: profileName,
            items: itemsForSellList,
        })
    }

    debug(`Уже испоьзованные предметы (${alreadyUsed.length}): "${alreadyUsed.join('","')}"`);

    debug(`Общее кол-во уже отправленных предметов: ${Object.keys(itemsUsed).length}`);

    return results;
}



async function loadMoreResults(page) {
    const loadingBtn = await page.$('.loadBlock')
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

    await page._cursor.click('.loadBlock');
    await a.delay(300);
    let loadingInProgressEl = null;
    while (loadingInProgressEl = await page.$('.loadBlock[mnpl-status="loading"]')) {
        // still loading, wait
        await a.delay(500);
    }
    // load completed
    return true;
}
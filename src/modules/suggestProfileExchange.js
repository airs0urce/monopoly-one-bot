
const helpers = require('./../helpers');
const config = require('./../config');
const a = require('awaiting');
const globals = require('./../globals');
const d = require('debug');
const addOrRemoveFromMarket = require('./addOrRemoveFromMarket');



module.exports = async function suggestProfileExchange(browser, profileUrl) {
    const debug = d(`mon:suggestProfileExchange:${profileUrl}`);
    
    if (globals.hasItem('SUGGESTED_PROFILES', profileUrl)) {
        debug(`Пропускаем профайл, т.к. мы уже сделали предложение обмена пользователю: ${profileUrl}`);
        return;
    }
    // Add profile to list of already suggested profiles
    globals.addItem('SUGGESTED_PROFILES', profileUrl);

    if (globals.get('HANDLED_PROFILES', 0) >= 15) {
        // add or remove item on market to make sure we are not banned to see profiles
        await addOrRemoveFromMarket(null, browser);
        globals.set('HANDLED_PROFILES', 0);
    }
    globals.set('HANDLED_PROFILES', globals.get('HANDLED_PROFILES', 0) + 1);
    
    const page = await helpers.newPage(browser);
    
    await page.goto(profileUrl, {referer: 'https://monopoly-one.com/m1tv'});
    await helpers.waitSelectorDisappears(page, 'div.profile.processing');
    await a.delay(500);

    //
    // check amount of matches
    //
    const matchesAmount = await (await page.$('.profile-top-stat-list .profile-top-stat-list-one:nth-child(1) ._val')).evaluate(async (el) => {
        return parseInt(el.innerText, 10);
    });

    if (matchesAmount >= 200) {
        debug(`Пропускаем профайл, т.к. кол-во игр больше 200: ${profileUrl}`);
        return;
    }

    //
    // check if "Все" buttom available and click
    //
    const allBtnExists = !!(await page.$('.title.title-3 a'));
    if (allBtnExists) {
        await page._cursor.click('.title.title-3 a');
    } else {
        debug(`Пропускаем профайл, т.к. инвентарь пустой: ${profileUrl}`);
        return;
    }

    //
    // wait for loading
    //
    await helpers.waitSelectorDisappears(page, '.inventory-items.processing');
    await a.delay(200);

    //
    // check if user has needed cases
    //
    let neededCaseExists = false;
    for (let neededCase of config.needed_cases) {
        const neededCaseExists = !!(await page.$(`.inventory-items div[style*="${neededCase.image}"]`));
        if (neededCaseExists) {
            break;
        }
        
    }

    if (! neededCaseExists) {
        debug(`Пропускаем профайл, т.к. нет нужных кейсов: ${profileUrl}`);
        return;
    }

    //
    // Go to "Предложить обмен"
    //
    await a.delay(500);
    await page._cursor.click('[href*="/trades/new"]');

    await helpers.waitSelectorDisappears(page, 'div.trades.processing');
    await a.delay(500);


    //
    // get all my cards
    //

    // filter only cards
    await page._cursor.click('.trades-main-inventories-one:nth-child(1) ._filter [design-selecter-value="cards"]');
    await a.delay(300);
    let myItems = [];
    const myItemEls = await page.$('.trades-main-inventories-one:nth-child(1) .trades-main-inventories-one-list div.tradesThing[mnpl-filter=1]');
    for (let myItemEl of myItemEls) {        
        const name = await (await myItemEl.$('.thing-image')).evaluate(async (el) => {
            return el.getAttribute('kd-tooltip');
        });
        const backgroundImage = await (await myItemEl.$('.thing-image div')).evaluate(async (el) => {
            let backgroundImage = el.style.backgroundImage;
            backgroundImage = backgroundImage.replace('url("', '').replace('")', '');
            return backgroundImage;
        });
        const id = await myItemEl.evaluate(async (el) => {
            return el.id;
        });

        myItems.push({
            id: id,
            alreadyUsed: globals.hasItem('USED_ITEMS', id),
            name: name,
            imagUrl: backgroundImage,
            el: myItemEl
        });
    }

    debug(`myItems: ${JSON.stringify(myItems)}`);

    //
    // Remove already used cards
    //
    myItems = myItems.filter((item) => {
        return !item.alreadyUsed;
    });

    //
    // If we used all cards already - let's just finish script 
    //
    if (myItems.length == 0) {
        debug(`Завершаем скрипт, т.к. не осталось больше карточек для предложений пользователям. Карточки, которые уже находятся в предложениях обмена не считаются, потмоу что мы не можем их использовать`);
        process.exit();        
        return;       
        
    }
    debug(`myItems without already used: ${JSON.stringify(myItems)}`);

    //
    // Remove cards that user already have
    // 
    await page._cursor.click('.trades-main-inventories-persons .trades-main-inventories-persons-one:nth-child(2)');
    await a.delay(200);
    await page._cursor.click('.trades-main-inventories-one:nth-child(2) ._filter [design-selecter-value="cards"]');
    await a.delay(250);

    let hisItems = [];
    const hisItemEls = await page.$('.trades-main-inventories-one:nth-child(2) .trades-main-inventories-one-list div.tradesThing[mnpl-filter=1]');
    for (let hisItemEl of hisItemEls) {        
        const name = await (await hisItemEl.$('.thing-image')).evaluate(async (el) => {
            return el.getAttribute('kd-tooltip');
        });
        const backgroundImage = await (await hisItemEl.$('.thing-image div')).evaluate(async (el) => {
            let backgroundImage = el.style.backgroundImage;
            backgroundImage = backgroundImage.replace('url("', '').replace('")', '');
            return backgroundImage;
        });

        hisItems.push({
            name: name,
            imagUrl: backgroundImage,
            el: hisItemEl
        });
    }

    const hisImageUrls = hisItems.map((hisItem) => { return hisItem.imageUrl })
    myItems = myItems.filter((myItem) => {
        return (! hisImageUrls.includes(myItem.imagUrl))
    });  

    if (myItems.length == 0) {
        debug(`Пропускаем профайл. Нет карточек, которые можно предложить, у пользователя уже все есть: ${profileUrl}`);
        return;
    }


    //
    // Now "myItems" contains cards that we can suggest to user. So, let's do it
    //


    console.log('myItems:', myItems);

    // myItems.push({
    //         id: id,
    //         alreadyUsed: globals.hasItem('USED_ITEMS', id)
    //         name: name,
    //         imagUrl: backgroundImage,
    //         el: myItemEl
    //     });
    
}















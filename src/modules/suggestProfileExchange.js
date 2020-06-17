
const helpers = require('./../helpers');
const config = require('./../config');
const a = require('awaiting');
const globals = require('./../globals');
const d = require('debug');
const util = require('util');
const addOrRemoveFromMarket = require('./addOrRemoveFromMarket');



module.exports = async function suggestProfileExchange(browser, profileUrl) {
    const debug = d(`mon:suggestProfileExchange:${profileUrl}`);
    debug(`Начало обработки профайла: ${profileUrl}`);

    const alreadySuggestedProfile = getSuggestedProfileByUrl(profileUrl);
    if (alreadySuggestedProfile) {        
        debug(`${suggestedProfile.name}: Пропускаем профайл, т.к. мы уже сделали предложение обмена пользователю ${suggestedProfile.url}`);
        return;
    }


    const handledProfilesCount = globals.get('HANDLED_PROFILES', 0);
    const maxAccountsInRow = helpers.rand(12, 15);

    if (handledProfilesCount >= maxAccountsInRow) {
        // add or remove item on market to make sure we are not banned to see profiles
        debug(`${suggestedProfile.name}: ${handledProfilesCount} профайлов обработано, удаляем\добавляем вещь на маркет, чтобы избежать банов (рандомно от 12 до 15 аккаунтов)`);
        await addOrRemoveFromMarket(null, browser);
        globals.set('HANDLED_PROFILES', 0);
    }
    globals.set('HANDLED_PROFILES', globals.get('HANDLED_PROFILES', 0) + 1);
    
    const page = await helpers.newPage(browser);
    
    await page.goto(profileUrl, {referer: 'https://monopoly-one.com/m1tv'});
    await helpers.waitSelectorDisappears(page, 'div.profile.processing');
    await a.delay(500);


    // add profile to list of profiles where we already suggested exchange
    const profileName = await (await page.$('span._nick')).evaluate((el) => {
        return el.innerText;
    });
    globals.addItem('SUGGESTED_PROFILES', {url: profileUrl, name: profileName});


    //
    // check amount of matches
    //
    const matchesAmount = await (await page.$('.profile-top-stat-list .profile-top-stat-list-one:nth-child(1) ._val')).evaluate(async (el) => {
        return parseInt(el.innerText, 10);
    });

    if (matchesAmount >= config.profileMaxGames) {
        debug(`${profileName}: Пропускаем профайл, т.к. кол-во игр ${matchesAmount} (больше ${config.profileMaxGames})`);
        return;
    }

    //
    // check if "Все" buttom available and click
    //
    const allBtnExists = !!(await page.$('.title.title-3 a'));
    if (allBtnExists) {
        debug('Кнопка "Все" найдена, кликаем...')
        await page._cursor.click('.title.title-3 a');
    } else {
        debug(`${profileName}: Пропускаем профайл, т.к. инвентарь пустой`);
        return;
    }

    //
    // wait for loading
    //
    await page.waitForSelector('.inventory-items');
    await page.waitForSelector('.inventory-items.processing');
    await helpers.waitSelectorDisappears(page, '.inventory-items.processing');
    await a.delay(500);

    //
    // check if user has needed cases
    //
    let neededCaseExists = false;
    for (let neededCase of config.needed_cases) {        
        neededCaseExists = !!(await page.$(`.inventory-items div[style*="${neededCase.image}"]`));
        if (neededCaseExists) {
            debug(`${profileName}: Нашли нужные кейсы`);
            break;
        }
        
    }

    if (! neededCaseExists) {
        debug(`${profileName}: Пропускаем профайл, т.к. нет нужных кейсов`);
        return;
    }

    //
    // Go to "Предложить обмен"
    //
    await a.delay(400);
    debug(`${profileName}: Жмем "Предложить обмен"`);
    await page._cursor.click('[href*="/trades/new"]');
    setTimeout(async () => {
        
        const stillOnOldPage = !!(await page.$('[href*="/trades/new"]'))
        if (stillOnOldPage) {
            // try again
            await page.click('[href*="/trades/new"]');
        }
    }, 2000)

    debug(`${profileName}: Ждем загрузки страницы`);
    await page.waitForSelector('div.trades.processing');
    await helpers.waitSelectorDisappears(page, 'div.trades.processing');
    await a.delay(500);


    const notAvailableEl = await page.$('.trades-main-inventories-persons-one:nth-child(2) .trades-main-inventories-persons-one-info-count em');
    if (notAvailableEl) {
        const notAvailableForExchange = await notAvailableEl.evaluate((el) => {
            return el.innerText == 'недоступен';
        });
        if (notAvailableForExchange) {
            const errorMessage = await (await page.$('.emptylistmessage')).evaluate((el) => {
                return el.innerText;
            });
            
            debug(`${profileName}: Обмен невозможен. ${errorMessage}`);
            return;
        }
    }
    

    //
    // get all my cards
    //

    // filter only cards
    await a.delay(300);
    (await page.$('.trades-main-inventories-one:nth-child(1) ._filter [design-selecter-value="cards"]')).evaluate((el) => { el.click() })
    await a.delay(300);
    let myItems = [];
    const myItemEls = await page.$$('.trades-main-inventories-one:nth-child(1) .trades-main-inventories-one-list div.tradesThing[mnpl-filter="1"]');
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

    debug(`${profileName}: количество доступных карточек у нас: ${myItems.length}`);

    //
    // Remove already used cards
    //
    myItems = myItems.filter((item) => {
        return !item.alreadyUsed;
    });

    debug(`${profileName}: количество доступных карточек у нас без учета уже использованных для обмена: ${myItems.length}`);

    //
    // If we used all cards already - let's just finish script 
    //
    if (myItems.length == 0) {
        debug(`${profileName}: Завершаем обратобку пользователя, т.к. не осталось больше карточек для предложений пользователям.`);        
        // TODO: скрипт завершать тоже надо
        return;               
    }


    //
    // Remove cards that user already have
    // 
    await page._cursor.click('.trades-main-inventories-persons .trades-main-inventories-persons-one:nth-child(2)');
    await a.delay(200);

    // get another user all items
    let hisItems = [];
    let hisItemEls = await page.$$('.trades-main-inventories-one:nth-child(2) .trades-main-inventories-one-list div.tradesThing');
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

    debug(`${profileName}: у него всего ${hisItems.length} предметов`);


    // Remove from my cards those owned by another user
    const hisImageUrls = hisItems.map((hisItem) => { return hisItem.imageUrl })
    myItems = myItems.filter((myItem) => {
        return (! hisImageUrls.includes(myItem.imagUrl))
    });  

    debug(`${profileName}: исключили из нашего списка карточки, которые уже есть у пользователя. Осталось ${myItems.length}`);

    if (myItems.length == 0) {
        debug(`${profileName}: Пропускаем профайл. Нет карточек, которые можно предложить, у пользователя уже все есть`);
        return;
    }

    // Filter by "Cases and Sets"
    (await page.$('.trades-main-inventories-one:nth-child(2) ._filter [design-selecter-value="containers"]')).evaluate((el) => { el.click() })
    await a.delay(250);

    // get only cases and sets of another user
    hisItems = [];
    hisItemEls = await page.$$('.trades-main-inventories-one:nth-child(2) .trades-main-inventories-one-list div.tradesThing[mnpl-filter="1"]');
    const ignoredCases = [];
    for (let hisItemEl of hisItemEls) {        
        const name = await (await hisItemEl.$('.thing-image')).evaluate(async (el) => {
            return el.getAttribute('kd-tooltip');
        });
        const backgroundImage = await (await hisItemEl.$('.thing-image div')).evaluate(async (el) => {
            let backgroundImage = el.style.backgroundImage;
            backgroundImage = backgroundImage.replace('url("', '').replace('")', '');
            return backgroundImage;
        });

        const neededImages = config.needed_cases.map(el => el.image);

        if (! neededImages.includes(backgroundImage)) {
            ignoredCases.push(name);
            continue;
        }

        hisItems.push({
            name: name,
            imagUrl: backgroundImage,
            el: hisItemEl
        });
    }


    const casesNames = hisItems.map((el) => { return el.name });
    if (casesNames.length == 0) {
        debug(`${profileName}: У пользователя нет кейсов, которые нам нужны.`);
        if (ignoredCases.length > 0) {
            debug(`${profileName}: Кейсы, которые были исключены как неподходящие: "${ignoredCases.join('","')}"`);
        }
        return;
    } else {
        debug(`${profileName}:Список кейсов, которые нам нужны от юзера: "${casesNames.join('", "')}"`)
    }
    




    //
    // Now "myItems" contains only cards that we can suggest to user. So, let's do it
    //

    
    // Get all cases from another user that we need to get
    const maxCasesToAsk = myItems.length;





    //debug(`Мы попросим ${myItems.length}`)


    // 




    // console.log('myItems:', util.inspect(myItems, {depth: 5}));
    // myItems.push({
    //         id: id,
    //         alreadyUsed: globals.hasItem('USED_ITEMS', id)
    //         name: name,
    //         imagUrl: backgroundImage,
    //         el: myItemEl
    //     });
    
}


function getSuggestedProfileByUrl(profileUrl) {
    const suggestedProfiles = globals.get('SUGGESTED_PROFILES', []);
    const suggestedProfilesFilter = suggestedProfiles.filter(e => e.url === profileUrl);
    if (suggestedProfilesFilter.length > 0) {
        return suggestedProfilesFilter[0];
    } else {
        return null;
    }

}












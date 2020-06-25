
const helpers = require('./../helpers');
const config = require('./../../config');
const a = require('awaiting');
const globals = require('./../globals');
const d = require('debug');
const util = require('util');
const addOrRemoveFromMarket = require('./addOrRemoveFromMarket');
var player = require('play-sound')(opts = {});




module.exports = async function suggestProfileExchange(page, profileUrl, precheckCaptcha = false) {
    const debug = d(`mon:suggestProfileExchange:${profileUrl}`);
    debug(`Начало обработки профайла: ${profileUrl}`);

    const alreadySuggestedProfile = getSuggestedProfileByUrl(profileUrl);
    if (alreadySuggestedProfile) {        
        debug(`${alreadySuggestedProfile.name}: Пропускаем профайл, уже есть обмен с этим пользователем`);
        return;
    }
    
    await page.goto(profileUrl, {referer: 'https://monopoly-one.com/m1tv'});
    
    await page.waitForSelector('div.profile');

    
    if (precheckCaptcha) {
        let captchaResult = await helpers.waitForCaptcha(page);
        if (captchaResult.found && ! captchaResult.solved) {
            debug("CAPTCHA FAILED 2 - RETRYING");
            const res = await suggestProfileExchange(page, profileUrl, true);
            return res;
        }
    }

    await a.delay(500);


    await helpers.waitSelectorDisappears(page, 'div.profile.processing');

    const emptyListEl = await page.$('.emptylistmessage');
    if (emptyListEl) {
        const emptyListMsg = await emptyListEl.evaluate((el) => { return el.innerText; });
        if (emptyListMsg.includes('Этот пользователь добавил вас в чёрный список')) {
            debug(`${profileUrl}: Этот пользователь добавил вас в чёрный список`);
            return;
        }
    }
    

    // add profile to list of profiles where we already suggested exchange
    const profileName = await (await page.$('span._nick')).evaluate((el) => {
        return el.innerText;
    });

    //
    // check amount of matches
    //
    const matchesAmount = await (await page.$('.profile-top-stat-list .profile-top-stat-list-one:nth-child(1) ._val')).evaluate(async (el) => {
        return parseInt(el.innerText, 10);
    });

    if (matchesAmount >= config.profile_max_games) {
        debug(`${profileName}: Пропускаем профайл, т.к. кол-во игр ${matchesAmount} (больше ${config.profile_max_games})`);
        return;
    }

    // check if banned
    const counterExists = !!(await page.$('.title-counter'));
    const el11 = await page.$('.emptylistmessage')
    if (! counterExists) {
         if (el11) {
             const text1 = await el11.evaluate((el) => { return el.innerText });
             if (! text1.includes('инвентарь пуст')) {
                 return 'BANNED';
             }
         } else {
             return 'BANNED';
         }
    }
    

    //
    // check if "Все" buttom available and click
    //
    const allBtnExists = !!(await page.$('.title.title-3 a'));
    if (allBtnExists) {
        debug('Кнопка "Все" найдена, кликаем...')
        try {
            await page.click('.title.title-3 a');
        } catch(e) {
            debug('ERROR CLICKING VSE BUTTON. Message:' + e.message);
            
            await page.goto(profileUrl + '/inventory');
            await page.waitForSelector('.inventory-items .thing');
        }
    } else {
        debug(`${profileName}: Пропускаем профайл, т.к. инвентарь пустой`);
        return;
    }

    setTimeout(async () => {
        // sometimes button doesn't get pressed, here is durty fix
        try {
            const allBtn = await page.$('.title.title-3 a');
            if (allBtn) {
                await allBtn.click();
            }
        } catch (e) {}
    }, 4000);

    //
    // wait for loading
    //
    debug('debug 1');
    const results = await Promise.all([
        page.waitForSelector('.inventory-items .inventory-items-one').then(() => {
            debug('debug 3');
        }),
        helpers.waitForCaptcha(page).then((res1) => {
            debug('debug 4');
            return res1;
        })
    ]);

    debug('debug 5');
    if (results[1].found && ! results[1].solved) {
        debug('debug 6');
        debug("CAPTCHA FAILED 1 - RETRYING");
        const res = await suggestProfileExchange(page, profileUrl, true);
        return res;
    }

    debug('debug 7');
    
    await helpers.waitSelectorDisappears(page, '.inventory-items.processing');
    await a.delay(500);
    debug('debug 8');

    //
    // check if user has needed cases
    //
    let neededCaseExists = false;
    for (let neededCase of config.needed_cases) {        
        neededCaseExists = !!(await page.$(`.inventory-items div[style*="${neededCase.image}"]`));
        if (neededCaseExists) {
            debug(`${profileName}: Нашли нужные нам кейсы`);
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
        try {
            const stillOnOldPage = !!(await page.$('[href*="/trades/new"]'))
            if (stillOnOldPage) {
                // try again
                await page.click('[href*="/trades/new"]');
            }
        } catch (e) {}
    }, 2000)

    debug(`${profileName}: Ждем загрузки страницы`);

    await page.waitForSelector('div.trades');
    const captchaResult0 = await helpers.waitForCaptcha(page);
    debug('debug 1');
    if (captchaResult0.found && ! captchaResult0.solved) {
        debug("CAPTCHA FAILED 2 - RETRYING");
        const res = await suggestProfileExchange(page, profileUrl, true)
        return res;
    }

    
    debug('debug 2');
    await page.waitForSelector('div.trades');

    await a.single([
        helpers.waitSelectorDisappears(page, 'div.trades.processing'),
        page.$('.vueDesignDialog-title')
    ]);
    
    await a.delay(400);
    debug('debug 2.5');
    
    const dialog = await page.$('.vueDesignDialog-title');
    if (dialog) {
        const restricted = (dialog).evaluate((el) => { return el.innerText.includes('Вы не можете предложить обмен этому игроку') });
        if (restricted) {
            debug(`${profileName}: Вы не можете предложить обмен этому игроку. Он ограничивает круг игроков, которые могут присылать ему обмены.`);
            return;
        }
    }
    await a.delay(2000);
    
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
    await helpers.waitForCaptcha(page);

    await a.delay(400);
    (await page.$('.trades-main-inventories-one:nth-child(1) ._filter [design-selecter-value="cards"]')).evaluate(async (el) => { 
        el.click();
    });
    await a.delay(400);
    let myItems = [];
    let myItemEls = await page.$$('.trades-main-inventories-one:nth-child(1) .trades-main-inventories-one-list div.tradesThing[mnpl-filter="1"]');

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
            alreadyUsed: globals.hasItem('USED_ITEMS', id),
            id: id,
            name: name,
            imageUrl: backgroundImage,
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

    if (config.consider_cards_from_sent_suggestions) {
        debug(`${profileName}: количество доступных карточек у кроме уже использованных: ${myItems.length}`);
    }
    

    //
    // If we used all cards already - let's just finish script 
    //
    if (myItems.length == 0) {
        debug(`${profileName}: Завершаем обратобку, т.к. у нас не осталось больше карточек для предложений.`);        
        debug(`${profileName}: Завершаем скрипт, т.к. нет смысла продолжать смотреть профайлы, когда у нас нет карточек`);
        process.exit()
        return;               
    }


    //
    // Remove cards that user already have
    // 
    await page._cursor.click('.trades-main-inventories-persons .trades-main-inventories-persons-one:nth-child(2)');
    await a.delay(400);

    // get another user all items
    let hisItemsAll = [];
    let hisItemAllEls = await page.$$('.trades-main-inventories-one:nth-child(2) .trades-main-inventories-one-list div.tradesThing');
    for (let hisItemEl of hisItemAllEls) {        
        const name = await (await hisItemEl.$('.thing-image')).evaluate(async (el) => {
            return el.getAttribute('kd-tooltip');
        });
        const backgroundImage = await (await hisItemEl.$('.thing-image div')).evaluate(async (el) => {
            let backgroundImage = el.style.backgroundImage;
            backgroundImage = backgroundImage.replace('url("', '').replace('")', '');
            return backgroundImage;
        });

        hisItemsAll.push({
            name: name,
            imageUrl: backgroundImage,
            el: hisItemEl
        });
    }

    debug(`${profileName}: у него всего ${hisItemsAll.length} предметов`);

    // Filter by "Cases and Sets"
    await (await page.$('.trades-main-inventories-one:nth-child(2) ._filter [design-selecter-value="containers"]')).evaluate((el) => { el.click() })
    await a.delay(250);

    // get only cases and sets of another user
    let hisItems = [];
    let hisItemEls = await page.$$('.trades-main-inventories-one:nth-child(2) .trades-main-inventories-one-list div.tradesThing[mnpl-filter="1"]');

    // IMPORTANT: HIDE ALL .selecter-options as they make a problem whne we move cursor
    // elements can appear and user wil click them instead of cases
    await page.evaluate(() => {
        const selectors = document.querySelectorAll('.block .trades-main-inventories-one:nth-child(2) .selecter-options')
        selectors[0].style.display = 'none';
        selectors[1].style.display = 'none';
    });
    await a.delay(250);
    

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
            imageUrl: backgroundImage,
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
    }
    debug(`${profileName}: ${casesNames.length} кейсов, которые нам нужны от юзера: "${casesNames.join('", "')}"`)


    // Remove from my cards those owned by another user
    const hisImageUrls = hisItemsAll.map((hisItem) => { return hisItem.imageUrl })

    let myItemsSuggest = myItems.filter((myItem) => {
        return (! hisImageUrls.includes(myItem.imageUrl))
    });  

    debug(`${profileName}: У нас карточек не считая тех, что уже в обменах: ${myItems.length}`);
    debug(`${profileName}: У нас карточек не считая тех, что есть у пользователя: ${myItemsSuggest.length}`);

    const needTotalToSuggest = (hisItems.length + config.cards_suggest_over_need);
    if (myItemsSuggest.length < needTotalToSuggest) {
        if (myItemsSuggest.length < hisItems.length) {
            debug(`${profileName}: Не хватает карточек для предложения. Надо взять ${hisItems.length} кейсов у юзера. Предложим еще ${hisItems.length - myItemsSuggest.length} карточек, которые уже есть у юзера, а шо делать?`);
        } else {
            debug(`${profileName}: Не хватает карточек для предложения чтобы предложить на ${config.cards_suggest_over_need} больше. Надо взять ${hisItems.length} кейсов у юзера.`);
            debug(`Предложим еще ${needTotalToSuggest - myItemsSuggest.length} карточек, которые уже есть у юзера, а шо делать?`);
        }
        
        
        // TODO: обработать дополнительно        
        const alreadySuggestUrls = myItemsSuggest.map((item) => { return item.imageUrl});        
        for (let i = 0; i < myItems.length; i++) {
            if (! alreadySuggestUrls.includes(myItems[i].imageUrl)) {
                debug(`${profileName}: Добавляем карточку ${myItems[i].name}`)
                myItemsSuggest.push(myItems[i]);
                if (myItemsSuggest.length >= needTotalToSuggest) {
                    break;
                }
            }
        }
    }

    if (myItemsSuggest.length == 0) {
        debug(`${profileName}: Опа, а в итоге и предложить-то совсем нечего. Завершаем скрипт. Нужно докупить карточек, т.к. мы уже все отправили в предыдущим юзерам`);
        process.exit();
    }


    //
    // Now "myItemsSuggest" contains only cards that we will suggest to user. 
    // and "hisItems" contains items that we need to get
    // So, let's do it 
    //
    
    
    const hisCases = [];
    let exchangeAmountMe = 0;
    let exchangeAmountHim = 0;


    if (myItemsSuggest.length > hisItems.length) {
        debug(`${profileName}: У нас больше карточек для предложения, чем у него кейсов, так что предложим ${hisItems.length + config.cards_suggest_over_need} карточек на ${hisItems.length} кейсов`)        
        exchangeAmountMe = hisItems.length + config.cards_suggest_over_need;
        exchangeAmountHim = hisItems.length;
    } else if (myItemsSuggest.length < hisItems.length) {
        debug(`${profileName}: У нас меньше карточек, чем у него кейсов. Значит, возьмем ${myItemsSuggest.length} шт. наших карточек и попросим первые ${hisItems.length} кейсов на обмен. Остальные кейсы обработай вручную, купив карточки.`)

        exchangeAmountMe = myItemsSuggest.length;
        exchangeAmountHim = hisItems.length;
    } else if (myItemsSuggest.length == hisItems.length) {
        debug(`${profileName}: У нас карточек сколько же, сколько у него кейсов. Предлагаем обмен ${myItemsSuggest.length} на ${hisItems.length}`)
        exchangeAmountMe = myItemsSuggest.length;
        exchangeAmountHim = hisItems.length;
    }

    //
    // Выбираем кейсы для обмена и отправляем предложение
    //

    // open my items tab
    await page.click('.trades-main-inventories-persons .trades-main-inventories-persons-one:nth-child(1)');
    await a.delay(200);
    

    // IMPORTANT: HIDE ALL .selecter-options as they make a problem whne we move cursor
    // elements can appear and user wil click them instead of cases
    await page.evaluate(() => {
        const selectors = document.querySelectorAll('.block .trades-main-inventories-one:nth-child(1) .selecter-options')
        if (selectors[0]) selectors[0].style.display = 'none';
        if (selectors[1]) selectors[1].style.display = 'none';
    });
    await a.delay(250);

    let clicked = 0;
    const mySuggestedCards = [];

    // тут надо постараться не предлагать одинаковые карточки
    let times = exchangeAmountMe;
    while (times > 0) {

        for (let myItemSuggest of myItemsSuggest) {
            if (mySuggestedCards.includes(myItemSuggest.name)) {
                continue;
            }
            debug(`${profileName}: кликаем свою карточку ${myItemSuggest.name}`);
            await clickMyCard(myItemSuggest, page);
            globals.addItem('USED_ITEMS', myItemSuggest.id);
            mySuggestedCards.push(myItemSuggest.name);
            clicked++
            break;
        }


        if (clicked >= exchangeAmountMe) {
            break;
        }

        times--;

        if (times == 0 && mySuggestedCards.length < exchangeAmountMe) {
            let addRandomCardsAmount = exchangeAmountMe - mySuggestedCards.length;
            while (addRandomCardsAmount > 0) {
                for (let myItemSuggestNew of myItemsSuggest) {
                    if (!globals.hasItem('USED_ITEMS', myItemSuggestNew.id)) {
                        debug(`${profileName}: кликаем свою карточку ${myItemSuggestNew.name}`);
                        await clickMyCard(myItemSuggestNew, page);
                        globals.addItem('USED_ITEMS', myItemSuggestNew.id);
                        mySuggestedCards.push(myItemSuggestNew.name);
                        break;
                    }
                }
                addRandomCardsAmount--;
            }
        }
    }

    // open his items tab
    debug(`${profileName}: открываем его таб`);
    await page.click('.trades-main-inventories-persons .trades-main-inventories-persons-one:nth-child(2)');
    await a.delay(400);

    clicked = 0;
    for (let hisItem of hisItems) {    

        debug(`${profileName}: кликаем его кейс ${hisItem.name}`);
        await page.click(`.block .trades-main-inventories-one:nth-child(2) div.tradesThing:not(._selected) .thing-image > div[style*="${hisItem.imageUrl}"] `);
        await a.delay(300);

        hisCases.push(hisItem.name);

        clicked++
        if (clicked >= exchangeAmountHim) {
            break;
        }
    }

    await page.click('input[value="Отправить предложение"]');    
    await a.delay(1000);

    const captchaResult = await helpers.waitForCaptcha(page);
    if (captchaResult.found && ! captchaResult.solved) {
        debug("CAPTCHA FAILED X - RETRYING");
        const res = await suggestProfileExchange(page, profileUrl, true);
        return res;
    }

    await page.waitForSelector('.vueDesignDialog-title');
    const dialogTitle = await (await page.$('.vueDesignDialog-title')).evaluate(async (el) => {
        return el.innerText;
    });


    if (dialogTitle.includes('отправлено')) {
        if (config.play_sound_when_exchange_suggested) {
            player.play(__dirname + '/../suggested.wav');
        }

        debug(`${profileName}: Успешно отправили предложение обмена наших карточек "${mySuggestedCards.join('", "')}" на кейсы "${hisCases.join('", "')}"`)
        globals.addItem('SUGGESTED_PROFILES', {url: profileUrl, name: profileName});
    } else {
        debug(`${profileName}: Что-то пошло не так :( Сообщение: ${dialogTitle}`);
        debug(`${profileName}: Завершаем скрипт`);
        process.exit();
    }

    await a.delay(1000);
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


async function clickMyCard(myItemSuggest, page) {
    await page.click(`.block .trades-main-inventories-one:nth-child(1) div.tradesThing[id="${myItemSuggest.id}"]:not(._selected)`);
    await a.delay(300);
}










process.env.DEBUG = 'mon:*';
const fs = require('fs');
const config = require('./config')
const util = require('util');
const helpers = require('./helpers');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const a = require('awaiting');

const loginMonopoly = require('./modules/loginMonopoly');
const getAlreadySuggestedItems = require('./modules/getAlreadySuggestedItems');
const getMatchingGamesList = require('./modules/getMatchingGamesList');
const addOrRemoveFromMarket = require('./modules/addOrRemoveFromMarket');
const suggestProfileExchange = require('./modules/suggestProfileExchange');

const globals = require('./globals');
const d = require('debug');
const debug = d(`mon:app`);
const rimraf = require('rimraf');


let browser;

(async () => {

    const sessionFolder  = config.monopoly_auth.username.replace('@', '').replace(/\./g, '');
    const userDataFolder = __dirname + '/browserUserData/' + sessionFolder;

    var args = process.argv.slice(2);
    if (args.includes('--clear')) {
        debug('запуск с параметром --clear, чистим сессионные данные браузера')
        rimraf.sync(userDataFolder);
    }
    

    // await require('./enable-puppeteer-background-only.js');

    


    browser = await puppeteer.launch({
        headless:false,
        userDataDir: userDataFolder,
        args: [
            `--disable-extensions-except=${__dirname}/../extension/`,
            `--load-extension=${__dirname}/../extension/`,
        ]
    });

    const page = await helpers.newPage(browser);    

    await loginMonopoly(page);


    const alreadySuggestedItems = await getAlreadySuggestedItems(null, browser);
    //await addOrRemoveFromMarket(null, browser);

    // add items to globals
    for (let alreadySuggestedItem of alreadySuggestedItems) {
        for (let item of alreadySuggestedItem.items) {
            globals.addItem('USED_ITEMS', item.id);
        }
        globals.addItem('SUGGESTED_PROFILES', {
            url: alreadySuggestedItem.profileUrl,
            name: alreadySuggestedItem.profileName
        });
    }

    // get games
//+    const games = await getMatchingGamesList(null, browser);

    // 
    
    await suggestProfileExchange(browser, 'https://monopoly-one.com/profile/1798548'); // воробушек
    // await suggestProfileExchange(browser, 'https://monopoly-one.com/profile/awesomo');




    /*
    const handledProfilesCount = globals.get('HANDLED_PROFILES', 0);
    const maxAccountsInRow = helpers.rand(12, 15);

    if (handledProfilesCount >= maxAccountsInRow) {
        // add or remove item on market to make sure we are not banned to see profiles
        debug(`${suggestedProfile.name}: ${handledProfilesCount} профайлов обработано, удаляем\добавляем вещь на маркет, чтобы избежать банов (рандомно от 12 до 15 аккаунтов)`);
        await addOrRemoveFromMarket(null, browser);
        globals.set('HANDLED_PROFILES', 0);
    }
    globals.set('HANDLED_PROFILES', globals.get('HANDLED_PROFILES', 0) + 1);
    */

    

    


    

    // console.log('games:', games);
    
    

    // await browser.close()
})();









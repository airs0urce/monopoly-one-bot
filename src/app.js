
process.env.DEBUG = 'mon:*';

const config = require('./config')
const util = require('util');
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



let browser;

(async () => {
    await require('./enable-puppeteer-background-only.js');

    browser = await puppeteer.launch({
        headless:false,
        args: [
            `--disable-extensions-except=${__dirname}/../extension/`,
            `--load-extension=${__dirname}/../extension/`,
        ]
    });

    let page = await loginMonopoly(null, browser);

    const alreadySuggestedItems = await getAlreadySuggestedItems(null, browser);
    //await addOrRemoveFromMarket(null, browser);

    // add items to globals
    for (let alreadySuggestedItem of alreadySuggestedItems) {
        for (let item of alreadySuggestedItem.items) {
            globals.addItem('USED_ITEMS', item.id);
        }
        globals.addItem('SUGGESTED_PROFILES', item.profileUrl);
    }

    // get games
//+    const games = await getMatchingGamesList(null, browser);

    // 
    await suggestProfileExchange(browser, 'https://monopoly-one.com/profile/1633884');

    

    


    

    // console.log('games:', games);
    
    

    // await browser.close()
})();











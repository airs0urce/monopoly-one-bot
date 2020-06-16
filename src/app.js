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



let browser;

(async () => {
    await require('./enable-puppeteer-background-only.js');

    browser = await puppeteer.launch({
        headless:false,
        args: [
            `--disable-extensions-except=${__dirname}/../extension/`,
            `--load-extension=${__dirname}/../extension/`,
        ]
    })

    let page = await loginMonopoly(null, browser);

    // const alreadySuggestedItems = await getAlreadySuggestedItems(null, browser);
    // await addOrRemoveFromMarket(null, browser);


    const games = await getMatchingGamesList(null, browser);

    console.log('games:', games);
    
    

    // await browser.close()
})();











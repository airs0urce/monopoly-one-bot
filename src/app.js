const config = require('./config')
const util = require('util');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const a = require('awaiting');

const getMatchingGamesList = require('./modules/getMatchingGamesList');
const addOrRemoveFromMarket = require('./modules/addOrRemoveFromMarket');
const getAlreadySuggestedItems = require('./modules/getAlreadySuggestedItems');
const loginMonopoly = require('./modules/loginMonopoly');



let browser;

(async () => {
    browser = await puppeteer.launch({
        headless:false,
        args: [
            `--disable-extensions-except=${__dirname}/../extension/`,
            `--load-extension=${__dirname}/../extension/`,
        ]
    })

    let page = await loginMonopoly(null, browser);

    // await getAlreadySuggestedItems(page);

    // await addOrRemoveFromMarket(browser);
    // const games = await getMatchingGamesList(browser);
    // console.log('games:', util.inspect(games, {depth: 10}));
    
    

    // await browser.close()
})();











const config = require('./config')
const util = require('util');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());
const a = require('awaiting');

const loginAndGetMatchingGamesList = require('./loginAndGetMatchingGamesList');
const addOrRemoveFromMarket = require('./addOrRemoveFromMarket');

let browser;

(async () => {
    browser = await puppeteer.launch({
        headless:false,
        args: [
            `--disable-extensions-except=${__dirname}/../extension/`,
            `--load-extension=${__dirname}/../extension/`,
        ]
    })

    // await addOrRemoveFromMarket(browser);
    const games = await loginAndGetMatchingGamesList(browser);
    console.log('games:', util.inspect(games, {depth: 10}));
    
    // await browser.close()
})();











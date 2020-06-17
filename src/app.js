
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


let browser;

(async () => {
    // await require('./enable-puppeteer-background-only.js');

    const sessionFolder  = config.monopoly_auth.username.replace('@', '').replace(/\./g, '');
    const userDataFolder = __dirname + '/browserUserData/' + sessionFolder;

   
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

    

    


    

    // console.log('games:', games);
    
    

    // await browser.close()
})();









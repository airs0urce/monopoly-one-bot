
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
    debug('Начинаем');
    let handledProfilesCount = 0;

    const sessionFolder  = config.monopoly_auth.username.replace('@', '').replace(/\./g, '');
    const userDataFolder = __dirname + '/browserUserData/' + sessionFolder;

    var args = process.argv.slice(2);
    if (args.includes('--clear')) {
        debug('запуск с параметром --clear, чистим сессионные данные браузера')
        rimraf.sync(userDataFolder);
    }
    

    // await require('./enable-puppeteer-background-only.js');


    debug('Запускаем браузер');
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

    const games = await getMatchingGamesList(null, browser);

    let startFromProfile = null;
    //let startFromProfile='https://monopoly-one.com/profile/522832'

    for (let game of games) {
        /*
        min: 0,
        sec: 0,
        title: '',
        players: [{profile_link: ''}],
        */

        debug(`обработка игроков со стола ${game.title}. Время стола: ${game.min}:${game.sec}`);
        
        for (let player of game.players) {
            if (handledProfilesCount >= 15) {
                // add or remove item from market. Ban protection
                debug(`${handledProfilesCount} профайлов обработано, удаляем\добавляем вещь на маркет, чтобы избежать банов...`);
                await addOrRemoveFromMarket(null, browser);
                handledProfilesCount = 0;
            }

            if (startFromProfile && player.profile_link != startFromProfile) {
                continue;
            } else {
                startFromProfile = null;
            }

            await suggestProfileExchange(browser, player.profile_link);
            handledProfilesCount++ 
        }
    }
    
    // await suggestProfileExchange(browser, 'https://monopoly-one.com/profile/1798548'); // воробушек
    // await suggestProfileExchange(browser, 'https://monopoly-one.com/profile/awesomo');

    debug('На этом наши полномочия все!');
    await browser.close()
})();









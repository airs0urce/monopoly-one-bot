
process.env.DEBUG = 'mon:*';
const fs = require('fs');
const config = require('./../config')
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

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha-2');


let browser;

(async () => {
    debug('Начинаем');
    let handledProfilesCount = 0;

    const sessionFolder  = config.monopoly_auth.username.replace('@', '').replace(/\./g, '');
    const userDataFolder = __dirname + '/browserUserData/' + sessionFolder;

    const args = process.argv.slice(2);
    if (args.includes('--clear')) {
        debug('запуск с параметром --clear, чистим сессионные данные браузера')
        rimraf.sync(userDataFolder);
    }
   
    // await require('./enable-puppeteer-background-only.js');
    const chromeArgs = [];
    // if (config.auto_captcha_solver) {
    //     chromeArgs.push(`--disable-extensions-except=${__dirname}/../extension/`);
    //     chromeArgs.push(`--load-extension=${__dirname}/../extension/`);
    // }
    if (config.auto_captcha_solver) {
        puppeteer.use(
            RecaptchaPlugin({
                provider: {
                    id: '2captcha',
                    token: 'b940642def7a66f392ca52e6fa00023c' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
                },
                // visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
            })
        );
    }

    debug('Запускаем браузер');
    browser = await puppeteer.launch({
        headless:false,
        userDataDir: userDataFolder,
        args: chromeArgs
    });

    const page = await helpers.newPage(browser);    

    await page.bringToFront();

    await loginMonopoly(page);
    await a.delay(1000);

    const alreadySuggestedItems = await getAlreadySuggestedItems(page);
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
    await a.delay(1000);

await suggestProfileExchange(page, 'https://monopoly-one.com/profile/317630');
await a.delay(1043434343);


    const games = await getMatchingGamesList(page);

    let startFromProfile = null;
    //let startFromProfile='https://monopoly-one.com/profile/522832'

    for (let game of games) {
        debug(`обработка игроков со стола ${game.title}. Время стола: ${game.min}:${game.sec}`);
        
        for (let player of game.players) {
            if (handledProfilesCount >= 20) {
                // add or remove item from market. Ban protection
                debug(`${handledProfilesCount} профайлов обработано, удаляем\добавляем вещь на маркет, чтобы избежать банов...`);
                await addOrRemoveFromMarket(page);
                await addOrRemoveFromMarket(page);
                handledProfilesCount = 0;
            }

            if (startFromProfile && player.profile_link != startFromProfile) {
                continue;
            } else {
                startFromProfile = null;
            }

            const profileResult = await suggestProfileExchange(page, player.profile_link);

            handledProfilesCount++ 
        }
    }
    
    // await suggestProfileExchange(browser, 'https://monopoly-one.com/profile/1798548'); // воробушек
    // await suggestProfileExchange(browser, 'https://monopoly-one.com/profile/awesomo');

    debug('На этом наши полномочия все!');
})();









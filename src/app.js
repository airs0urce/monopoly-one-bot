
process.env.DEBUG = 'mon:*';
const fs = require('fs').promises;
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
const aplayer = require('play-sound')(opts = {});

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
    const chromeArgs = ['--disable-gpu'];
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

    // await addOrRemoveFromMarket(null, browser);
    // await addOrRemoveFromMarket(null, browser);
    // await addOrRemoveFromMarket(null, browser);
    // await addOrRemoveFromMarket(null, browser);
    // await a.delay(2000000);    

    // await suggestProfileExchange(page, 'https://monopoly-one.com/profile/2069820');
    // await a.delay(1043434343);


    const alreadySuggestedItems = await getAlreadySuggestedItems(page);
   
    // add items to globals
    for (let alreadySuggestedItem of alreadySuggestedItems) {

        if (config.consider_cards_from_sent_suggestions) {
            for (let item of alreadySuggestedItem.items) {
                globals.addItem('USED_ITEMS', item.id);
            }
        }

        globals.addItem('SUGGESTED_PROFILES', {
            url: alreadySuggestedItem.profileUrl,
            name: alreadySuggestedItem.profileName
        });
    }
    await a.delay(1000);


    const games = await getMatchingGamesList(page);

    let startFromProfile = null;
    //let startFromProfile='https://monopoly-one.com/profile/522832'
    let totalProfilesChecked = 0;
    
    for (let game of games) {
        debug(`обработка игроков со стола ${game.title}. Время стола: ${game.timeString}`);
        
        for (let player of game.players) {
            
            if (handledProfilesCount >= 27) {
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

            const res = await canCheckProfileAgain(player.profile_link);
            if (res.can) {
                let result = await suggestProfileExchange(page, player.profile_link);
                let times = 3;
                while (result === 'BANNED') {
                    debug('На профайле нет счетчика вещей в инвентаре. У нас бан... Обрабатываем');
                    if (times == 0) {
                        debug('Пробовали победить бан несколько раз, но ничего не вышло. Завершаем программу');
                        process.exit();
                    }
                    await addOrRemoveFromMarket(page);
                    await addOrRemoveFromMarket(page);
                    handledProfilesCount = 0;
                    result = await suggestProfileExchange(page, player.profile_link);
                    times--;
                }

                await addProfileCheck(player.profile_link);
                handledProfilesCount++ ;
                totalProfilesChecked++;
                debug(`Всего проверено игроков: ${totalProfilesChecked}`);
            } else {                
                debug(`Не проверяем аккаунт ${player.profile_link}, т.к. с последней проверки прошло ${res.passed_hours} часов, а надо ${config.profile_checking_frequency_hours}`);
            }
            
        }
    }
    
    // await suggestProfileExchange(browser, 'https://monopoly-one.com/profile/1798548'); // воробушек
    // await suggestProfileExchange(browser, 'https://monopoly-one.com/profile/awesomo');

    if (config.play_sound_when_finished) {
        aplayer.play(__dirname + '/finish.wav');
    }
    
    debug('На этом наши полномочия все!');
    setTimeout(async () => {
        await browser.close();
        process.exit();
    }, 5000);
    

})();


async function canCheckProfileAgain(profileUrl) {
    const db = await readDB();
    const nowTs = getTs();
    const profileCheckFreqSec = config.profile_checking_frequency_hours * 60 * 60;

    for (let record of db) {
        const passedSec = nowTs - record.ts;
        if (record.profileUrl == profileUrl && passedSec < profileCheckFreqSec) {
            const passedHours = passedSec / 60 / 60;
            return {can: false, passed_hours: passedHours};
        }
    }

    return {can: true};
}

async function addProfileCheck(profileUrl) {
    const profiles = await readDB();
    const nowTs = getTs();

    let set = false;
    for (let i = 0; i < profiles.length; i++) {
        if (profiles[i].profileUrl == profileUrl) {
            profiles[i].ts = nowTs;
            set = true;
            break;
        }
    }
    if (!set) {
        profiles.push({
            profileUrl: profileUrl,
            ts: nowTs
        });
    }

    await writeDB(profiles);
}

async function readDB() {
    try {
        const file = await fs.readFile(__dirname + '/checkedProfiles.json', {encoding: 'utf8'});
        return JSON.parse(file);
    } catch(e) {
        await writeDB([]);
        return [];
    }
}

async function writeDB(contentArray) {
    await fs.writeFile(__dirname + '/checkedProfiles.json', JSON.stringify(contentArray));
}


function getTs() {
    return Math.round(new Date().getTime()/1000);
}


const a = require('awaiting');
const {clear, rand, newPage} = require('./../helpers');
const config = require('./../config');
const uuidv4 = require('uuid').v4;
const scrollPageToBottom = require('puppeteer-autoscroll-down');
const url = require('url');

module.exports = async function loginMonopoly(page, orBrowser) {
    if (! page && orBrowser) {
        page = await newPage(orBrowser);
    }

    //
    // AUTH
    //
    await page.goto('https://monopoly-one.com/auth?return=Lw==', {referer: 'https://monopoly-one.com/'})
    await page.setViewport({ width: rand(1393, 1500), height: rand(600, 800) });

    let loginPageReady = false;  
    let paramsExists = false;
    while (! loginPageReady) {
        const queryObject = url.parse(page.url(), true).query;
        
        const params = Object.keys(queryObject);
        
        // ignore "return parameter"
        var index = params.indexOf('return');
        if (index !== -1) {
            params.splice(index, 1);
        }

        const newParamsExists = params.length > 0;
        if (newParamsExists == false && newParamsExists != paramsExists) {
            break;
        }
        paramsExists = newParamsExists;
        await a.delay(100);
    }
    
    await page.waitForSelector('#auth-form-email');
    await a.delay(1000);
    await page._cursor.click('#auth-form-email');
    await page.type('#auth-form-email', config.monopoly_auth.username, {delay: 25}); // Types slower, like a user
    await page._cursor.click('#auth-form-password');
    await page.type('#auth-form-password', config.monopoly_auth.password, {delay: 30}); // Types slower, like a user
    await a.delay(700);

    await page._cursor.click('#auth-form [type="submit"]');
    await page.waitForNavigation({waitUntil: 'load'});
    await a.delay(700);

    return page;
}

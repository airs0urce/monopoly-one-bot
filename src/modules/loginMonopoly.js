
const a = require('awaiting');
const helpers = require('./../helpers');
const config = require('./../../config');
const uuidv4 = require('uuid').v4;
const url = require('url');
const debug = require('debug')('mon:loginMonopoly');

module.exports = async function loginMonopoly(page, orBrowser) {
    if (! page && orBrowser) {
        page = await helpers.newPage(orBrowser);
    }
    
    debug(`Логинимся: аккаунт ${config.monopoly_auth.username}:${config.monopoly_auth.password}`);
    
    //
    // AUTH
    //
    debug(`Логинимся: идем на страницу логина`);
    await page.goto('https://monopoly-one.com/auth', {referer: 'https://monopoly-one.com/'})
    await page.setViewport({ width: helpers.rand(1393, 1500), height: helpers.rand(600, 800) });

    // wait for page loaded in any state - logged in or logged out
    await a.delay(1000);
    await a.single([
        a.result(page.waitForSelector('.header-auth')),
        a.result(page.waitForSelector('.HeaderUser-menu-one'))
    ], 1)
    

    debug(`Логинимся: Проверяем, может юзер уже залогинен`);
    let headerAuthExists = !!(await page.$('.header-auth'))
    if (! headerAuthExists) {
        debug('Логинимся: Да, уже был залогинен ранее (используем старую сессию)');
        return page;
    } else {
        debug('Логинимся: Нет, не залогинен)');
    }

    await login(page);

    await a.delay(3000);
    
    if (!!(await page.$('.header-auth'))) {
        debug('Проблема с логином. Почему-то не логинится. Возможно, блокировка из-за количества попыток, попробуй поменять свой IP адрес');
        debug('Завершаем скрипт');
        process.exit();
    }

    return page;
}

async function isEmailEmpty(page) {
    return await (await page.$('#auth-form-email')).evaluate((el) => {
        return (el.value.length == 0);
    })
}

async function login(page) {
    debug(`Логинимся: Ожидаем форму логина и вводим данные`);
    await page.waitForSelector('#auth-form-email');
    await a.delay(1000);
    debug(`Логинимся: вводим email`);
    await page._cursor.click('#auth-form-email');
    await page.type('#auth-form-email', config.monopoly_auth.username, {delay: 25}); // Types slower, like a user

    if (await isEmailEmpty(page)) {
        // if some redirect happened, email will be empty, so, let's start from beggining
        await login();
        return;
    }

    debug(`Логинимся: вводим пароль`);
    await page._cursor.click('#auth-form-password');
    await page.type('#auth-form-password', config.monopoly_auth.password, {delay: 30}); // Types slower, like a user
    await a.delay(700);

    if (await isEmailEmpty(page)) {
        // if some redirect happened, email will be empty, so, let's start from beggining
        await login();
        return;
    }

    debug(`Логинимся: кликаем Войти`);
    await page._cursor.click('#auth-form [type="submit"]');
    await page.waitForNavigation({waitUntil: 'load'});
    await a.delay(700);
}
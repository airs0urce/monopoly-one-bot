
const a = require('awaiting');
const {clear, rand, newPage} = require('./../helpers');
const uuidv4 = require('uuid').v4;
const scrollPageToBottom = require('puppeteer-autoscroll-down');

module.exports = async function getAlreadySuggestedCards(page, orBrowser) {

    if (! page && orBrowser) {
        page = await newPage(orBrowser);
    }

    //
    // Go to trades page
    //
    await page.goto('https://monopoly-one.com/trades', {referer: 'https://monopoly-one.com/m1tv'});
    await page.waitForSelector('[href="/trades/outgoing"]');
    await a.delay(500);
    await page.click('[href="/trades/outgoing"]');
    await page.waitForSelector('.trades-main-list.processing');
    
    while (! loaded1) {
        await a.delay(300);
        const stillProcessing = !!(await page.$('.trades-main-list.processing'));
        if (! stillProcessing) {
            break;
        }
    }
    await a.delay(300);

    //
    // Load more results until page finished
    //
    await scrollPageToBottom(page);
    let loadSuccess = false;
    while (loadSuccess = await loadMoreResults(page)) {
        await scrollPageToBottom(page);
        await a.delay(rand(1000, 1400));
    }

    // 
    // Take all items already on trade
    //
    const items = await page.$$('.trades-main-list-one-content-one._lost .trades-main-list-one-content-one-list > div');
    const resultItems = [];
    for (let item of items) {
        resultItems.push(await item.evaluate(async (el) => {
            return el.id;
        }));
    }

    setTimeout(() => {
        page.close();
    }, 500);
    return resultItems;
}



async function loadMoreResults(page) {
    const loadingBtn = await page.$('.loadBlock')
    const displayCss = await loadingBtn.evaluate(async (el) => {
        return el.style.display;
    });
    if (displayCss == 'none') {
        // loading finished
        return false;
    }

    await page._cursor.click('.loadBlock');
    await a.delay(300);
    let loadingInProgressEl = null;
    while (loadingInProgressEl = await page.$('.loadBlock[mnpl-status="loading"]')) {
        // still loading, wait
        await a.delay(500);
    }
    // load completed
    return true;
}
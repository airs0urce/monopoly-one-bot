
const a = require('awaiting');
const helpers = require('./../helpers');
const uuidv4 = require('uuid').v4;
const debug = require('debug')('mon:addOrRemoveFromMarket');

module.exports = async function addOrRemoveFromMarket(page, orBrowser) {
    if (! page && orBrowser) {
        page = await helpers.newPage(orBrowser);
    }
    
    //
    // Check if it's on market already
    //
    debug('проверяем, выставлена ли "Коробочка с кубиками #5" на маркет')
    await page.goto('https://monopoly-one.com/market/my', {referer: 'https://monopoly-one.com/market'});     
    await page.waitForSelector('.market-list');
    await page.waitForSelector('.market-list.processing');
    await helpers.waitSelectorDisappears(page, '.market-list.processing');
    

    const korobochka5El = await page.$(`[style*="dices-5.png"]`);
    let result = '';
    if (korobochka5El) {
        debug('"Коробочка с кубиками #5" на маркете, удаляем ее...')
        //
        // Remove from market if it's already there
        //        
        let removeFromMarketButtonId = 'button-' + uuidv4().replace(/-/g, '');
        await korobochka5El.evaluateHandle(async (el, removeFromMarketButtonId) => {
            const input = el.parentElement.querySelector('input');
            input.id = removeFromMarketButtonId;
        }, removeFromMarketButtonId);
        await a.delay(200);
        await page._cursor.click('#' + removeFromMarketButtonId);

        let finishedRemoving = false;
        while (! finishedRemoving) {
            const dialogContent = await page.$('.vueDesignDialog-title')
            if (dialogContent) {
                const text = await dialogContent.evaluate(async (el) => {
                    return el.innerText
                });
                if (text.includes('Предмет снят с продажи')) {
                    finishedRemoving = true;
                }
            }
        }

        debug('"Коробочка с кубиками #5" успешно удалена с маркета')
        result = 'ANTI-BAN: ITEM REMOVED FROM MARKET';
    } else {
        debug('"Коробочка с кубиками #5" нет на маркете, добавляем ее...')
        //
        // Add to market
        //
        await page.goto('https://monopoly-one.com/inventory');
        let loaded2 = false;
        while (!loaded2) {
            await a.delay(500);
            loaded2 = await page.$('.inventory-items') && !(await page.$('.inventory-items.processing'))
        }

        
        await page.waitForSelector('[style*="dices-5.png"]');
        await page._cursor.click('[style*="dices-5.png"]');
        await page.waitForSelector('.InventoryHelper-body-buttons div:nth-child(2)');
        await a.delay(200);
        await helpers.scrollToElement(await page.$('.InventoryHelper-body-buttons div:nth-child(2)'));
        await a.delay(500);
        await page._cursor.click('.InventoryHelper-body-buttons div:nth-child(2)');

        await page.waitForSelector('.inventory-marketSell-costs-value input');
        await page._cursor.click('.inventory-marketSell-costs-value input');
        await helpers.clear(page, '.inventory-marketSell-costs-value input');
        const priceToType = helpers.rand(450, 500).toString();
        await page.type('.inventory-marketSell-costs-value input', priceToType, {delay: 60});
        await a.delay(1500);

        await page._cursor.click('.vueDesignDialog-buttons button:nth-child(1)');

        let finishedPuttingOnMarket = false;
        while (! finishedPuttingOnMarket) {
            const dialogContent = await page.$('.vueDesignDialog-content')
            if (dialogContent) {
                const text = await dialogContent.evaluate(async (el) => {
                    return el.innerText
                });
                if (text.includes('Предмет успешно выставлен на продажу')) {
                    finishedPuttingOnMarket = true;
                }
            }
        }
        debug('"Коробочка с кубиками #5" успешно добавлена на маркет')
        result = 'ANTI-BAN: ITEM ADDED TO MARKET';
    }
    await a.delay(3000);
    
    return result;
}


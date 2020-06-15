
const a = require('awaiting');
const {clear, rand} = require('./helpers');
const installMouseHelper = require('./install-mouse-helper.js').installMouseHelper;
const createCursor = require("ghost-cursor").createCursor;
const uuidv4 = require('uuid').v4;
const scrollPageToBottom = require('puppeteer-autoscroll-down');

module.exports = async function addOrRemoveFromMarket(browser) {
    const page = await browser.newPage();
    await installMouseHelper(page);

    page.setDefaultNavigationTimeout(120 * 1000);
    page.setDefaultTimeout(120 * 1000);
    const pageCursor = createCursor(page);


    //
    // Check if it's on market already
    //
    await page.goto('https://monopoly-one.com/market/my');     
    await a.delay(2000);         

    let loaded1 = false;
    while (! loaded1) {
        await a.delay(500);
        loaded1 = await page.$('.market-list') && !(await page.$('.market-list.processing'));
    }

    const korobochka5El = await page.$(`[style*="dices-5.png"]`);

    if (korobochka5El) {
        console.log('ALREADY ON MARKET - removing...');
        //
        // Remove from market if it's already there
        //        
        let removeFromMarketButtonId = 'button-' + uuidv4().replace(/-/g, '');
        await korobochka5El.evaluateHandle(async (el, removeFromMarketButtonId) => {
            const input = el.parentElement.querySelector('input');
            input.id = removeFromMarketButtonId;
        }, removeFromMarketButtonId);
        await a.delay(200);
        await pageCursor.click('#' + removeFromMarketButtonId);

        let finishedRemoving = false;
        while (! finishedRemoving) {
            const dialogContent = await page.$('.vueDesignDialog-title')
            if (dialogContent) {
                const text = await dialogContent.evaluate(async (el) => {
                    return el.innerText
                });
                if (text.includes('Предмет снят с продажи')) {
                    finishedRemoving = true;
                    console.log('SUCCESS: Remove from market');
                }
            }
        }


        await a.delay(3000)
        await page.close();

    } else {
        console.log('NOT ON MARKET yet - adding...');
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
        await pageCursor.click('[style*="dices-5.png"]');
        
        await scrollPageToBottom(page);
        await a.delay(300);
        


        await page.waitForSelector('.InventoryHelper-body-buttons div:nth-child(2)');
        await pageCursor.click('.InventoryHelper-body-buttons div:nth-child(2)');
        await a.delay(2000);
        
        await pageCursor.click('.inventory-marketSell-costs-value input');
        await clear(page, '.inventory-marketSell-costs-value input');
        const priceToType = rand(450, 500).toString();
        await page.type('.inventory-marketSell-costs-value input', priceToType, {delay: 60});
        await a.delay(1500);

        await pageCursor.click('.vueDesignDialog-buttons button:nth-child(1)');

        let finishedPuttingOnMarket = false;
        while (! finishedPuttingOnMarket) {
            const dialogContent = await page.$('.vueDesignDialog-content')
            if (dialogContent) {
                const text = await dialogContent.evaluate(async (el) => {
                    return el.innerText
                });
                if (text.includes('Предмет успешно выставлен на продажу')) {
                    finishedPuttingOnMarket = true;
                    console.log('SUCCESS: Added to market');
                }
            }
        }
        
        await a.delay(3000)
        await page.close();
    }
}


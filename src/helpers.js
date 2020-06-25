const installMouseHelper = require('./install-mouse-helper.js').installMouseHelper;
const createCursor = require('../vendor/ghost-cursor/lib/spoof.js').createCursor

const a = require('awaiting');
const debug = require('debug')('mon:helpers');

exports.clear = async function clear(page, selector) {
  await page.evaluate(selector => {
    document.querySelector(selector).value = "";
  }, selector);
}

exports.rand = function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.scrollToElement = async function(el) {
    await el.evaluate((el) => {
        el.scrollIntoView({block: 'center', inline: 'center'});
    })
}

exports.newPage = async function(browser) {
    const page = await browser.newPage();
    const startPoint = { x: exports.rand(100, 700), y: exports.rand(100, 700)};
    page._cursor = createCursor(page, startPoint);
    await installMouseHelper(page);
    page.setDefaultNavigationTimeout(6 * 1000 * 60);
    page.setDefaultTimeout(6 * 1000 * 60);
    await page.on("dialog", async (dialog) => {
        await a.delay(1500);
        dialog.accept();
    });
    return page;
}

exports.waitSelectorDisappears = async function(page, selector) {
    // wait for disapearing
    while (true) {
        await a.delay(300);
        const stillProcessing = !!(await page.$(selector));
        if (! stillProcessing) {
            break;
        }
    }
    await a.delay(50);
}


exports.scrollPageToBottom = async function(page, scrollStep = 500, scrollDelay = 200) {
    await a.delay(600);
    const lastPosition = await page.evaluate(
        async (step, delay) => {
            const getScrollHeight = (element) => {
                if (!element) {
                    return 0
                }

                const { scrollHeight, offsetHeight, clientHeight } = element
                return Math.max(scrollHeight, offsetHeight, clientHeight)
            }

            let position = 0
            const intervalId = setInterval(() => {
                const { body } = document
                const availableScrollHeight = getScrollHeight(body)

                window.scrollBy(0, step)
                position += step
                if (position >= availableScrollHeight) {
                    clearInterval(intervalId)
                    return position
                }
            }, delay)
        },
        scrollStep,
        scrollDelay
    );
    return lastPosition
}


exports.waitForCaptcha = async function(page) {
    const result = {
        found: false,
        solved: false,
    }
    await a.delay(1000);
    
    debug('Проверка на captcha...');
    await a.delay(2000);
    const captchaResult = await page.solveRecaptchas();

    if (captchaResult.captchas.length > 0) {
        result.found = true;
        if (undefined == captchaResult.solved[0]) {
            console.log('solved is undefined');
            console.log('captchaResult:', captchaResult);
            result.solved = false;
        } else {
            result.solved = !!captchaResult.solved[0].isSolved;
        }
        
        await a.delay(1000);
    }
    console.log('captcha check result:', result);
    return result;
}

const installMouseHelper = require('./install-mouse-helper.js').installMouseHelper;
const createCursor = require("ghost-cursor").createCursor;
const a = require('awaiting');

exports.clear = async function clear(page, selector) {
  await page.evaluate(selector => {
    document.querySelector(selector).value = "";
  }, selector);
}

exports.rand = function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.newPage = async function(browser) {
    const page = await browser.newPage();
    page._cursor = createCursor(page);
    await installMouseHelper(page);
    page.setDefaultNavigationTimeout(120 * 1000);
    page.setDefaultTimeout(120 * 1000);
    await page.on("dialog", async (dialog) => {
        await a.delay(1500);
        dialog.accept();
    });
    return page;
}

exports.waitSelectorDisappears = async function(page, selector) {
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
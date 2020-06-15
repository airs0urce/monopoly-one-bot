const installMouseHelper = require('./install-mouse-helper.js').installMouseHelper;
const createCursor = require("ghost-cursor").createCursor;

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
    return page;
}

exports.clear = async function clear(page, selector) {
  await page.evaluate(selector => {
    document.querySelector(selector).value = "";
  }, selector);
}

exports.rand = function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
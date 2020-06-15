exports.autoScroll = async function autoScroll(page){
    return await page.evaluate(async () => {
        return await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
            return timer;
        });
    });
}

exports.clear = async function clear(page, selector) {
  await page.evaluate(selector => {
    document.querySelector(selector).value = "";
  }, selector);
}

exports.rand = function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const cp = require('child_process');
const a = require('awaiting');

// console.log(process.stdout);
// console.log(process.stderr);

let lastOutputEvent = 0;

function runChild() {
    return new Promise((resolve) => {
        let bot = cp.spawn('node', ['start.js'], {
            cwd: __dirname,
            encoding: 'utf-8',
        });
        bot.stdout.pipe(process.stdout);
        bot.stderr.pipe(process.stderr);

        bot.stdout.on('data', (data) => {
            lastOutputEvent = getTs();

            if (data.includes('STOP_AUTOSTART')) {
                console.log('автозапуск отключен. Причина: код STOP_AUTOSTART');
                process.exit();
            }
        });
        bot.stderr.on('data', (data) => {
            lastOutputEvent = getTs();

            if (data.includes('STOP_AUTOSTART')) {
                console.log('автозапуск отключен. Причина: код STOP_AUTOSTART');
                process.exit();
            }
        });

        const intervalId = setInterval(() => {
            const fourMinInSec = 60 * 4;

            if (getTs() - lastOutputEvent > fourMinInSec) {
                clearInterval(intervalId);
                lastOutputEvent = 0;
                bot.kill();
                resolve();
            }
        }, 2000)

        bot.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            lastOutputEvent = 0;
            clearInterval(intervalId);
            resolve();
        });
    });
    
}


(async function() {
    while (1) {
        console.log('=== STARTING CHILD ===');
        a.delay(10000);
        await runChild();
    }
})();



function getTs() {
    return Math.round(new Date().getTime()/1000);
}








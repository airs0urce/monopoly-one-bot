const fs = require('fs/promises');


module.exports = (async function() {
    const path = __dirname + '/../node_modules/puppeteer/.local-chromium/mac-756035/chrome-mac/Chromium.app/Contents/Info.plist'

    let fileContent = await fs.readFile(path, {encoding: 'utf8'});

    if (! fileContent.includes('LSBackgroundOnly')) {
        fileContent = fileContent.replace(`<key>BuildMachineOSBuild</key>`, `<key>LSBackgroundOnly</key>
        <string>True</string>
        <key>BuildMachineOSBuild</key>`);
        
        await fs.writeFile(path, fileContent);
        console.log('Chrome background mode enabled in: ' + path);
    }    
})();

const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const koaBody = require('koa-body');
const fs = require('fs').promises;

router.get('/ignoreProfile', koaBody(), httpHandle);
router.get('/ignoreProfile/:profileId', koaBody(), httpHandle);


async function httpHandle(ctx, next) {
    ctx.body = '<meta charset="UTF-8">';

    const ignoredProfiles = await readIgnoredProfiles();
    if (ctx.params.profileId) {
        const profileUrl = `https://monopoly-one.com/profile/${ctx.params.profileId.trim()}`;

        if (ignoredProfiles.includes(profileUrl)) {
            ctx.body += `Этот профайл уже и так в списке исключений: <b>${profileUrl}</b>`;
        } else {
            ignoredProfiles.push(profileUrl);
            await writeIgnoredProfiles(ignoredProfiles);
            ctx.body += `Этот профайл добавлен в список исключений: <b>${profileUrl}</b>`;
        }

    } else {
        ctx.body += `Пример: чтобы добавить профайл "https://monopoly-one.com/profile/vanone" в игнор, вызови этот адрес: /ignoreProfile/vanone`;
    }
    
    ctx.body += '<br/><hr/><br/>';
    ctx.body += `Список игнорируемых профайлов (${ignoredProfiles.length}):<br/>`;
    let ignoredProfile;
    for (ignoredProfile of ignoredProfiles) {
        ctx.body += `${ignoredProfile}<br/>`;
    }

    ctx.set('Content-Type', 'text/html');

    next();
}

app.use(router.routes());

app.listen(3000, '0.0.0.0');

let ignoredProfilesCache = null;

async function readIgnoredProfiles() {
    try {
        const file = await fs.readFile(__dirname + '/ignoreProfiles.json', {encoding: 'utf8'});
        return JSON.parse(file);
    } catch(e) {
        await writeIgnoredProfiles([]);
        return [];
    }
}

async function writeIgnoredProfiles(arr) {
    await fs.writeFile(__dirname + '/ignoreProfiles.json', JSON.stringify(arr));
    ignoredProfilesCache = arr;
}

async function checkProfileIgnored(profileUrl) {
    profileUrl = profileUrl.trim();

    if (null === ignoredProfilesCache) {
        ignoredProfilesCache = await readIgnoredProfiles();
    }
    
    return ignoredProfilesCache.includes(profileUrl);
}

exports.checkProfileIgnored = checkProfileIgnored;


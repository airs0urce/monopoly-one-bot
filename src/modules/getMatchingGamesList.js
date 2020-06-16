
const helpers = require('./../helpers');
const config = require('./../config');
const a = require('awaiting');
const debug = require('debug')('mon:getMatchingGameList');

module.exports = async function getMatchingGamesList(page, orBrowser) {
    
    if (! page && orBrowser) {
        page = await helpers.newPage(orBrowser);
    }

    //
    // Go to M1TV page
    //
    await page.goto('https://monopoly-one.com/m1tv', {referer: 'https://monopoly-one.com/'});
    await page.waitForSelector('.m1tvLive-games-list.processing');
    await helpers.waitSelectorDisappears(page, '.m1tvLive-games-list.processing');

    //
    // Load more results until page finished
    //
    await helpers.scrollPageToBottom(page);
    let loadSuccess = false;
    while (loadSuccess = await loadMoreResults(page)) {
        console.log('before scroll');
        await helpers.scrollPageToBottom(page);
        console.log('after scroll');
        await a.delay(helpers.rand(100, 150));
    }
    

    //
    // Parsing game list
    //

    const gameList = [];

    const gameListElements = await page.$$('div.m1tvLive-games-list div.VueGame');
    for (let gameListElement of gameListElements) {
        const game = {
            min: 0,
            sec: 0,
            title: '',
            players: [],
        };

        // =================================
        // Get game title
        // =================================
        let gameTitle = await gameListElement.$('.VueGame-stat .VueGame-stat-one-title span._title');
        gameTitle = await gameTitle.evaluate(el => el.innerHTML);
        if (gameTitle == 'Перетасовка') {
            // ignore this type of game as we only need players with type == idiot 
            console.log('IGNORE GAME REASON: title is "' + gameTitle + '"');
            continue;
        }
        game.title = gameTitle;

        // =================================
        // Get game time
        // =================================
        let gameTime = await gameListElement.$('.VueGame-stat .VueGame-stat-one-meta div:nth-last-child(1)');
        gameTime = await gameTime.evaluate(el => el.innerHTML);
        // example: '<span>игра идёт</span> 46:28'

        if (gameTime.match(/\d:[\d]{1,2}:[\d]{1,2}/)) {
            // in this case time looks like this: 1:32:11
            // so, it's longer than 1 hour and we don't need this game for sure as we need from 0 to 20
            console.log('IGNORE GAME REASON: time is "' + gameTime + '"');
            continue;
        }
        const gameTimeMatch = gameTime.match(/[\d]{1,2}:[\d]{1,2}/);
        if (!gameTimeMatch) {
            console.log(`TIME DIDN'T MATCH: ${gameTime}`);
        }
        let [gameMin, gameSec] = gameTimeMatch[0].split(':');
        game.min = parseInt(gameMin, 10);
        game.sec = parseInt(gameSec, 10);
        if (game.min > 20) {
            // ignore this game as we need games from 0 to 20 min
            console.log('IGNORE GAME REASON: time is "' + gameTime + '"');
            continue;
        }


        // =================================
        // Get players
        // =================================
        const gamePlayers = await gameListElement.$$('.VueGame-players > div.VueGame-players-one');
        for (let gamePlayer of gamePlayers) {
            const player = {
                profile_link: '',
            };            
            const profileLinkEl = await gamePlayer.$('.nick a');

            if (profileLinkEl) {
                const profileLinkUrl = await profileLinkEl.evaluate(el => el.href);
                player.profile_link = profileLinkUrl;
            } else {
                console.log('NOT FOUND URL FOR PROFILE');
                console.log(await gamePlayer.evaluate(el => el.innerHTML));
                console.log('---');
            }


            game.players.push(player);
        }

        gameList.push(game);
        
    }
    return gameList;
}

async function loadMoreResults(page) {
    const loadingBtn = await page.$('.loadBlock')
    if (!loadingBtn) {
        return false;
    }
    await page._cursor.click('.loadBlock');
    await a.delay(500);
    let loadingInProgressEl = null;
    while (loadingInProgressEl = await page.$('.loadBlock[mnpl-status="loading"]')) {
        // still loading, wait
        await a.delay(1000);
    }
    // load completed
    return true;
}
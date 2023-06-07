module.exports = {
    //anti_captcha_key: 'ee09917abe2540a87ff080d0d78abcc7', // added to extension/js/config_ac_api_key.js
    monopoly_auth: {
        // Надо убедиться, что в аккаунте есть "Коробочка с кубиками #5". Ее отправляем на 
        // маркет и снимаем с маркета, чтобы не банили. Добавить новые предметы тоже можно, но пока так что экономии времени.
        username: '<username>',
        password: '<pass>'
    },
    auto_captcha_solver: {
        enabled: true, // Автоматическое решение капчи. true - включить, false - выключить
        api_key_2captcha: '<api_key_here>' // API key от https://2captcha.com
    },
    play_sound_when_exchange_suggested: false, // Проигрывать звук каждый раз, когда успешно предложен обмен
    play_sound_when_finished: false, // Проигрывать звук когда скрипт отработал и завершен
    cards_suggest_over_need: 0, // число говорит насколько больше карт предлагать юзеру, чем мы кейсов у него берем (если у нас достаточно карточек)
                               // 0 - предлагать столько же сколько берем кейсов
                               // 1 - предлагать на одну карту больше, чем берем кейсов 
                               // 2 - предлагать на две карту больше, чем берем кейсов 
    /*
    Настройка "suggest_cards_rules" ПОКА ЧТО НЕ РАБОТАЕТ
    suggest_cards_rules: [
        // Если скрипт не найдет подходящее значение take, то будет 
        // предложено карточек столько же, сколько кейсов мы просим у юзера
        {take: 1, suggest_all_missing: 2, suggest_with_duplicates: 3},
        {take: 2, suggest_all_missing: 3, suggest_with_duplicates: 4},
        {take: 3, suggest_all_missing: 4, suggest_with_duplicates: 5},
        {take: 4, suggest_all_missing: 5, suggest_with_duplicates: 6},
        {take: 5, suggest_all_missing: 6, suggest_with_duplicates: 7},
        {take: 6, suggest_all_missing: 7, suggest_with_duplicates: 8},
        {take: 7, suggest_all_missing: 8, suggest_with_duplicates: 9},
        {take: 8, suggest_all_missing: 9, suggest_with_duplicates: 10},
        {take: 9, suggest_all_missing: 10, suggest_with_duplicates: 11},
        {take: 10, suggest_all_missing: 11, suggest_with_duplicates: 12},
        {take: 12, suggest_all_missing: 12, suggest_with_duplicates: 13},
    ],
    */
    consider_cards_from_sent_suggestions: true, // Нужно ли при запуске учитывать карты, которые уже были отправллены в предложениях
                                                 // true - учитывать. Карты, которые отправлены в 
                                                 //        предложениях и ожидают ответа другого игрока НЕ БУДУТ отправлены 
                                                 //        другим игрокам в текущем проходе
                                                 // false - не учитывать. Предлагать все имеющиеся карты, кроме тех, 
                                                 //         которые уже были предложены в текущем проходе.
    profile_checking_frequency_hours: 72, // Здесь указывается количество часов. 
                                         // Один и тот же профайл не будет проверяться больше одного раза в N часов.
                                         // Чтобы не учитывать время последней проверки можно установить значение 0.
    profile_max_games: 300, // профайлы, в которых больше матчей, не будут обработаны
    game_maximal_minutes: 7, // Игры, которые идут больше минут, чем указано в этом параметре будут пропущены
    needed_cases: [
        // сюда можно добавлять только кейсы и наборы
        // если добавить другой предмет - скрипт будет работать неверно
        // имя особо не важно, т.к. поиск предмета проходит по URL картинки 
        {
            name: 'Яркий кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/things/case-bright.png',
                'https://m1.dogecdn.wtf/things/case-bright@2x.png',
                'https://m1.dogecdn.wtf/things/case-bright.png',
            ]
        },
        {
            name: 'Яркий кейс 2',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/bright2.png',
                'https://m1.dogecdn.wtf/cases/bright2.png',
                'https://m1.dogecdn.wtf/cases/bright2@2x.png',
            ]
        },
        {
            name: 'Зелёный кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/green.png', 
                'https://m1.dogecdn.wtf/cases/green.png',
                'https://m1.dogecdn.wtf/cases/green@2x.png',
            ]
        },
        {
            name: 'Ночной кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/night.png',
                'https://m1.dogecdn.wtf/cases/night@2x.png',
                'https://m1.dogecdn.wtf/cases/night.png',
            ]
        },
        {
            name: 'Квантовый кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/quantum.png',
                'https://m1.dogecdn.wtf/cases/quantum@2x.png',
                'https://m1.dogecdn.wtf/cases/quantum.png',
            ]
        },
        {
            name: 'Кленовый кейс',
            images: [
                'https://m1.dogecdn.wtf/cases/maple.png',
                'https://m1.dogecdn.wtf/cases/maple@2x.png',
                'https://m1.dogecdn.wtf/cases/maple.png',
            ]
        },
        {
            name: 'Кейс Икс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/x.png',
                'https://m1.dogecdn.wtf/cases/x@2x.png',
                'https://m1.dogecdn.wtf/cases/x.png',
            ]
        },
        {
            name: 'Вулканический кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/volcano.png',
                'https://m1.dogecdn.wtf/cases/volcano@2x.png',
                'https://m1.dogecdn.wtf/cases/volcano.png',
            ]
        },
        {
            name: 'Пиксель-кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/pixel.png',
                'https://m1.dogecdn.wtf/cases/pixel@2x.png',
                'https://m1.dogecdn.wtf/cases/pixel.png',
            ]
        },
        {
            name: 'Дабл-кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/double.png',
                'https://m1.dogecdn.wtf/cases/double@2x.png',
                'https://m1.dogecdn.wtf/cases/double.png',
            ]
        },
        {
            name: 'Игровой кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/things/case-game.png',
                'https://m1.dogecdn.wtf/things/case-game@2x.png',
                'https://m1.dogecdn.wtf/things/case-game.png',
            ]
        },
        {
            name: 'Кейс «Фоллаут»',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/fallout.png',
                'https://m1.dogecdn.wtf/cases/fallout@2x.png',
                'https://m1.dogecdn.wtf/cases/fallout.png',
            ]
        },
        {
            name: 'Ретро-кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/retro.png',
                'https://m1.dogecdn.wtf/cases/retro.png',
                'https://m1.dogecdn.wtf/cases/retro@2x.png',
            ]
        },
        {
            name: 'Королевский кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/things/case-royal.png',
                'https://m1.dogecdn.wtf/things/case-royal@2x.png',
                'https://m1.dogecdn.wtf/things/case-royal.png',
            ]
        },
        {
            name: 'Летний кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/things/case-summer.png',
                'https://m1.dogecdn.wtf/things/case-summer@2x.png',
                'https://m1.dogecdn.wtf/things/case-summer.png',
            ]
        },
        {
            name: 'Кейс «Юпитер»',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/things/case-jupiter.png',
                'https://m1.dogecdn.wtf/things/case-jupiter@2x.png',
                'https://m1.dogecdn.wtf/things/case-jupiter.png',
            ]
        },
        {
            name: 'Спортивный кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/things/case-sport.png',
                'https://m1.dogecdn.wtf/things/case-sport@2x.png',
                'https://m1.dogecdn.wtf/things/case-sport.png',
            ]
        },
        {
            name: 'Коробочка с кубиками',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/things/dicebox-one.png',
                'https://m1.dogecdn.wtf/things/dicebox-one@2x.png',
                'https://m1.dogecdn.wtf/things/dicebox-one.png',
            ]
        },
        {
            name: 'Коробочка с кубиками #2',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/things/dicebox-two.png',
                'https://m1.dogecdn.wtf/things/dicebox-two@2x.png',
                'https://m1.dogecdn.wtf/things/dicebox-two.png',
            ]
        }
        ,{
            name: 'Кейс «Расклад»',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/disposition.big.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/disposition@2x.big.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/disposition@2x.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/disposition.png',
                'https://m1.dogecdn.wtf/cases/disposition.big.png',
                'https://m1.dogecdn.wtf/cases/disposition@2x.big.png',
                'https://m1.dogecdn.wtf/cases/disposition@2x.png',
                'https://m1.dogecdn.wtf/cases/disposition.png',
            ]
        },
        {
            name: 'Золотой набор',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/golden.big.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/golden@2x.big.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/golden@2x.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/golden.png',
                'https://m1.dogecdn.wtf/cases/golden.big.png',
                'https://m1.dogecdn.wtf/cases/golden@2x.big.png',
                'https://m1.dogecdn.wtf/cases/golden@2x.png',
                'https://m1.dogecdn.wtf/cases/golden.png',
                'https://m1.dogecdn.wtf/cases/golden.big.png',
                'https://m1.dogecdn.wtf/cases/golden@2x.big.png',
                'https://m1.dogecdn.wtf/cases/golden@2x.png',
                'https://m1.dogecdn.wtf/cases/golden.png',
            ]
        },
        {
            name: 'Коробочка с кубиками #3',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/things/dicebox-3.big.png',
                'https://cdn2.kirick.me/libs/monopoly/things/dicebox-3@2x.big.png',
                'https://cdn2.kirick.me/libs/monopoly/things/dicebox-3@2x.png',
                'https://cdn2.kirick.me/libs/monopoly/things/dicebox-3.png',
                'https://m1.dogecdn.wtf/things/dicebox-3.big.png',
                'https://m1.dogecdn.wtf/things/dicebox-3@2x.big.png',
                'https://m1.dogecdn.wtf/things/dicebox-3@2x.png',
                'https://m1.dogecdn.wtf/things/dicebox-3.png',
                'https://m1.dogecdn.wtf/things/dicebox-3.big.png',
                'https://m1.dogecdn.wtf/things/dicebox-3@2x.big.png',
                'https://m1.dogecdn.wtf/things/dicebox-3@2x.png',
                'https://m1.dogecdn.wtf/things/dicebox-3.png',
            ]
        },
        {
            name: 'Тёмный кейс',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/dark.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/dark@2x.big.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/dark@2x.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/dark.png',
                'https://m1.dogecdn.wtf/cases/dark.big.png',
                'https://m1.dogecdn.wtf/cases/dark@2x.big.png',
                'https://m1.dogecdn.wtf/cases/dark@2x.png',
                'https://m1.dogecdn.wtf/cases/dark.png',
                'https://m1.dogecdn.wtf/cases/dark.big.png',
                'https://m1.dogecdn.wtf/cases/dark@2x.big.png',
                'https://m1.dogecdn.wtf/cases/dark@2x.png',
                'https://m1.dogecdn.wtf/cases/dark.png',
            ]
        },
        {
            name: 'Коробочка с кубиками #4',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/dices-4.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/dices-4@2x.big.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/dices-4@2x.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/dices-4.png',
                'https://m1.dogecdn.wtf/cases/dices-4.big.png',
                'https://m1.dogecdn.wtf/cases/dices-4@2x.big.png',
                'https://m1.dogecdn.wtf/cases/dices-4@2x.png',
                'https://m1.dogecdn.wtf/cases/dices-4.png',
                'https://m1.dogecdn.wtf/cases/dices-4.big.png',
                'https://m1.dogecdn.wtf/cases/dices-4@2x.big.png',
                'https://m1.dogecdn.wtf/cases/dices-4.png',
            ]

        },
        {
            name: 'Кейс GTA',
            images: [
                'https://cdn2.kirick.me/libs/monopoly/cases/gta.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/gta@2x.big.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/gta@2x.png',
                'https://cdn2.kirick.me/libs/monopoly/cases/gta.png',
                'https://m1.dogecdn.wtf/cases/gta.big.png',
                'https://m1.dogecdn.wtf/cases/gta@2x.big.png',
                'https://m1.dogecdn.wtf/cases/gta@2x.png',
                'https://m1.dogecdn.wtf/cases/gta.png',
                'https://m1.dogecdn.wtf/cases/gta.big.png',
                'https://m1.dogecdn.wtf/cases/gta@2x.big.png',
                'https://m1.dogecdn.wtf/cases/gta@2x.png',
                'https://m1.dogecdn.wtf/cases/gta.png',
            ]

        }
        

    ]
}

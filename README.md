# Как запустить на MacOS


1) Установить node.js https://nodejs.org/en/. Версия от 14.4 и выше.
2) Открыть Терминал
2) Клонировать себе репозиторий 
   ```bash
   git clone https://github.com/airs0urce/monopoly-one-bot.git
   ```
3) Зайти в папку
   ```bash
   cd monopoly-one-bot
   ```

4) Установить модули   
   ```bash
   npm install
   ```
5) Если нужно - изменить настройки в файле config.js любым текстовым редактором.
6) Запустить бота:

   Вариант 1. Сделать один проход:
   ```bash
   node start.js
   ```

   Вариант 2. Автопилот. Когда скрипт завершится - будет запущен еще раз бесконечное число раз.
   Если случится ошибка или ничего не будет происходить 4 минуты - автоматически запустится новый проход:

   ```bash
   node auto.js
   ```

# Остановка бота

Остановить работу бота можно сочетанием клавиш Control + C в терминале

# Очистка сессионных данных

Данные сессии (cookie и т.д.) хранятся отдельно на каждый аккаунт, при смене 
аккаунта в src/config.js в параметре "monopoly_auth" при следующем запусе будет подгружена последняя сессиия этого аккаунта.
Чтобы стартовать бот с нуля с пустыми данными сессии для аккаунта, можно запустить бот с флагом "--clear":
   ```bash
   node start.js --clear
   ```

# Настройки

Все настройки в ./src/config.js
Описание параметров:

## monopoly_auth
Имя пользователя и пароль для сайта https://monopoly-one.com/.

При изменении аккаунта в параметре "monopoly_auth" нужно убедиться, что у этого аккаунта есть предмет "Коробочка с кубиками #5".
Ее отправляем на маркет и снимаем с маркета, чтобы не банили. Добавить новые предметы тоже можно, но пока так что экономии времени.

## auto_captcha_solver.enabled
Автоматическое решение капчи. true - включить, false - выключить

## auto_captcha_solver.api_key_2captcha
Если автоматическое решение капчи включено, то нужно прописать здесь API key с сайта https://2captcha.com

## play_sound_when_exchange_suggested 
Проигрывать звук каждый раз, когда успешно предложен обмен.  
true - включить,  
false - выключить.  
Звук находится здесь: src/suggested.wav.

## play_sound_when_finished
Проигрывать звук когда проход завершился
true - включить,  
false - выключить.  
Звук находится здесь: src/finish.wav.

## cards_suggest_over_need
Число говорит насколько больше карт предлагать юзеру, чем мы кейсов у него берем. Если будет недостаточно карточек - предложим сколько получится.  
0 - предлагать столько же сколько берем кейсов  
1 - предлагать на одну карту больше, чем берем кейсов  
2 - предлагать на две больше, чем берем кейсов  
и т.д.  

## suggest_cards_rules
***[ЭТА НАСТРОЙКА ПОКА ЧТО НЕ РАБОТАЕТ]***

## profile_checking_frequency_hours  
Здесь указывается количество часов. По-умолчанию 24.  
Один и тот же профайл не будет проверяться больше одного раза в N часов.  
Чтобы не учитывать время последней проверки можно установить значение 0.

## profile_max_games
Максимальное количество игр. Профайлы, которые сыграли больше матчей, чем указано в этом параметре, будут игнорироваться.

## consider_cards_from_sent_suggestions
Нужно ли при запуске учитывать карты, которые уже были отправллены в предложениях. 
true - учитывать. Карты, которые отправлены в  
       предложениях и ожидают ответа другого игрока НЕ БУДУТ отправлены   
       другим игрокам в текущем проходе  
false - не учитывать. Предлагать все имеющиеся карты, кроме тех,  
        которые уже были предложены в текущем проходе.  

## game_maximal_minutes
Игры, которые идут больше минут, чем указано в этом параметре будут пропущены.

## needed_cases
Кейсы, которые мы хотели бы получить от пользователей.  
указываются два параметра кейса:  
name - Имя кейса. Используется для логов, так что можно писать как хочешь - регистр и лишние пробелы - не проблема.  
image - Полный URL картинки айтема. Важно чтобы не было пробелов в начале и конце и регистр символов был как в игре.  

Например:
```
{name: 'Коробочка с кубиками', image: 'https://cdn2.kirick.me/libs/monopoly/things/dicebox-one.png'},
```
(в конце запятая)



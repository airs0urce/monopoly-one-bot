Как запустить на MacOS
======================

1) Установить node.js https://nodejs.org/en/. Версия от 14.4 и выше.
2) Скачать код бота https://github.com/airs0urce/monopoly-one-bot/archive/master.zip и распаковать.
3) Открыть Терминал и зайти в папку, куда распаковали код
   ```bash
   $ cd /Users/airs0urce/Downloads/monopoly-one-bot-master
   ```

4) Установить модули   
   ```bash
   $ npm install
   ```
5) Если нужно - изменить настройки в файле config.js
6) Запустить бота
   ```bash
   $ node start.js
   ```
Остановка бота
=============
Остановить работу бота можно сочетанием клавиш Control + C в терминале

Очистка сессионных данных
==============
Данные сессии (cookie и т.д.) хранятся отдельно на каждый аккаунт, при смене 
аккаунта в src/config.js в параметре "monopoly_auth" при следующем запусе будет подгружена последняя сессиия этого аккаунта.
Чтобы стартовать бот с нуля с пустыми данными сессии для аккаунта, можно запустить бот с флагом "--clear":
   ```bash
   $ node start.js --clear
   ```

Настройки
==============
Все настройки в ./src/config.js






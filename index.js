import { Telegraf, Markup } from "telegraf";
import { config } from "./config.js";
// import mongoose from "mongoose";
// import dbConnect from "./dbConnect.js";

// Здесь можно добавить импорты для конфигурации, базы данных и т.д.

const bot = new Telegraf(config.telegramToken);

let buttonData1 = {
    text: 'Кнопка 1',
    url: 'https://example.com/1'
};

let buttonData2 = {
    text: 'Кнопка 2',
    url: 'https://example.com/2'
};

let linkData = [
    { text: 'Ссылка 1', url: 'https://t.me/subertestchannel' },
    { text: 'Ссылка 2', url: 'https://t.me/subertestchannel2' },


];

let showButton1 = true;
let showButton2 = true;

const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/;

let sourceLink = 'https://example.com/source';
let showLinks = false; // Переменная для отслеживания состояния отображения ссылок

const adminUsername = 'thebreot';

let welcomeText = 'Ласкаво просимо! Наразі трансляцій відсутні.';
let StreamsText = 'Ласкаво просимо! Щоб дивитись пряму трансляцію матчу, потрібно підписатись на всі канали нижче:';


function isAdmin(username) {
    return username == adminUsername;
}
// Функция для извлечения username канала из URL
function extractUsernameFromUrl(url) {
    const match = url.match(/t\.me\/([^\s/]+)/);
    if (match && match[1]) {
        return '@' + match[1];
    }
    return null;
}

// Функция для проверки подписки пользователя на все каналы
async function checkSubscriptions(ctx) {
    const user = ctx.from.id; // Получаем ID пользователя (можно использовать другие данные для проверки подписки)

    const promises = linkData.map(async (link) => {
        const channelUsername = extractUsernameFromUrl(link.url);
        if (channelUsername) {
            try {
                const chatMember = await ctx.telegram.getChatMember(channelUsername, user);
                // Проверяем статус участника чата
                if (chatMember && ['member', 'administrator', 'creator'].includes(chatMember.status)) {
                    return true; // Пользователь подписан на канал
                } else {
                    return false; // Пользователь не подписан на канал
                }
            } catch (error) {
                console.error(`Ошибка при проверке подписки на канал ${channelUsername}:`, error);
                return false; // Ошибка при проверке подписки
            }
        } else {
            return false; // Если не удалось извлечь username из URL
        }
    });

    const results = await Promise.all(promises);

    if (results.every(subscribed => subscribed)) {
        // Создаем массив кнопок для подписанных каналов

        // Отправляем сообщение с кнопками
        ctx.reply('Всі умови виконано і вам надано доступ до безкоштовної трансляції яку можете дивитись тут:', Markup.inlineKeyboard([Markup.button.url('Дивитися трансляцію', sourceLink)]));
    } else {
        ctx.reply('Будь ласка, підпишіться на всі канали з посилань для продовження.');
    }
}
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

bot.command('setwelcometext', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const args = ctx.message.text.split(' ').slice(1);
        if (args.length >= 1) {
            let text = args.join(' ');
            if (text.startsWith('<') && text.endsWith('>')) {
                text = text.slice(1, -1); // Убираем символы <> из текста
            }
            welcomeText = text;
            ctx.reply(`Текст приветствия успешно обновлен: ${welcomeText}`);
        } else {
            ctx.reply(`Пример команды: /setwelcometext <текст>`);
        }
    } else {
        ctx.reply('У вас нет прав для выполнения этой команды.');
    }
});

bot.command('setstreamtext', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const args = ctx.message.text.split(' ').slice(1);
        if (args.length >= 1) {
            let text = args.join(' ');
            if (text.startsWith('<') && text.endsWith('>')) {
                text = text.slice(1, -1); // Убираем символы <> из текста
            }
            StreamsText = text;
            ctx.reply(`Текст о трансляціях успішно оновлено: ${StreamsText}`);
        } else {
            ctx.reply(`Используйте команду в формате: /setstreamtext <текст>`);
        }
    } else {
        ctx.reply('У вас нет прав для выполнения этой команды.');
    }
});

bot.command('setsource', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const args = ctx.message.text.split(' ').slice(1);
        const url = args.join(' ');

        if (args.length >= 1 && isValidUrl(url)) {
            sourceLink = url;
            ctx.reply(`Ссылка на трансляцию успешно обновлена: ${sourceLink}`);
        } else {
            ctx.reply('Некорректная ссылка. Используйте правильный URL.');
        }
    } else {
        ctx.reply('У вас нет прав для выполнения этой команды.');
    }
});

// Команда для настройки данных первой кнопки
bot.command('setbutton1', (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length >= 2) {
        const url = args.pop();
        let text = args.join(' ');
        text = text.replace(/[<>]/g, ''); // Убираем символы <>
        if (isValidUrl(url)) {
            buttonData1.text = text;
            buttonData1.url = url;
            ctx.reply(`Данные кнопки 1 успешно обновлены. Текст: ${buttonData1.text}, Ссылка: ${buttonData1.url}`);
        } else {
            ctx.reply('Неверный формат ссылки. Пожалуйста, используйте корректный URL.');
        }
    } else {
        ctx.reply(`Используйте команду в формате: /setbutton1 <текст кнопки> <ссылка>`);
    }
});


// Команда для настройки данных второй кнопки
bot.command('setbutton2', (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length >= 2) {
        const url = args.pop();
        let text = args.join(' ');
        text = text.replace(/[<>]/g, ''); // Убираем символы <>
        if (isValidUrl(url)) {
            buttonData2.text = text;
            buttonData2.url = url;
            ctx.reply(`Данные кнопки 2 успешно обновлены. Текст: ${buttonData2.text}, Ссылка: ${buttonData2.url}`);
        } else {
            ctx.reply('Неверный формат ссылки. Пожалуйста, используйте корректный URL.');
        }
    } else {
        ctx.reply(`Используйте команду в формате: /setbutton2 <текст кнопки> <ссылка>`);
    }
});

// Команда для включения/выключения отображения ссылок
bot.command('togglelinks', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        showLinks = !showLinks;
        ctx.reply(`Отображение ссылок теперь ${showLinks ? 'включено' : 'выключено'}.`);
    } else {
        ctx.reply('У вас нет прав для выполнения этой команды.');
    }
});

async function setCommandsByAdminStatus(ctx) {
    try {
        const username = ctx.message.from.username;

        if (isAdmin(username)) {
            await bot.telegram.setMyCommands([
                { command: 'start', description: 'Запустить бота' },
                { command: 'addlink', description: 'Добавить ссылку' },
                { command: 'setlink', description: 'Изменить определенную ссылку' },
                { command: 'deletelink', description: 'Удалить ссылку' },
                { command: 'setsource', description: 'Установить ссылку на трансляцию' },
                { command: 'setbutton1', description: 'Настроить кнопку 1' },
                { command: 'setbutton2', description: 'Настроить кнопку 2' },
                { command: 'setwelcometext', description: 'Установить текст приветствия' },
                { command: 'setstreamtext', description: 'Установить текст c ссылками' },
                { command: 'togglelinks', description: 'Включить/выключить отображение ссылок' },
                { command: 'togglebuttons', description: 'Включить/выключить отображение кнопки' },
                { command: 'help', description: 'Помощь' }
                // Добавьте другие администраторские команды по необходимости
            ]);
        } else {

            await bot.telegram.setMyCommands([
                { command: 'start', description: 'Запустить бота' }
                // Добавьте другие команды для пользователей по необходимости
            ]);
        }
    } catch (error) {
        console.error('Ошибка при установке команд бота:', error);
        throw error; // Пробросим ошибку выше для обработки
    }
}

async function handleStartCommand(ctx) {
    try {
        await setCommandsByAdminStatus(ctx);

        // Отправка сообщения пользователю
        // ctx.reply('Команды установлены в зависимости от вашего статуса администратора.');
    } catch (error) {
        console.error('Ошибка в обработке команды /start:', error);
        // ctx.reply('Произошла ошибка при обработке команды.');
    }
}

// Обработка команды /start
bot.command('start', (ctx) => {
    handleStartCommand(ctx);
    const buttons = [
        Markup.button.url(buttonData1.text, buttonData1.url),
        Markup.button.url(buttonData2.text, buttonData2.url)
    ];

    if (showLinks) {
        const linkButtons = linkData.map(link => Markup.button.url(link.text, link.url));
        const inlineKeyboard = linkButtons.map(button => [button]); // Каждую ссылку помещаем в отдельную строку
        const readyButton = Markup.button.callback('Готово ✅', 'ready');
        inlineKeyboard.push([readyButton]); // Добавляем кнопки "Меню" и "Готово" в отдельную строку
        ctx.reply(StreamsText, Markup.inlineKeyboard(inlineKeyboard));
    } else {
        let buttonsToShow = [];
        if (showButton1) buttonsToShow.push(buttonData1);
        if (showButton2) buttonsToShow.push(buttonData2);

        const buttonMarkup = buttonsToShow.map(button => Markup.button.url(button.text, button.url));
        ctx.reply(welcomeText, Markup.inlineKeyboard([buttonMarkup]));
    }
});


bot.command('setlink', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const args = ctx.message.text.split(' ').slice(1);
        const index = parseInt(args[0], 10) - 1;
        const textWithSymbols = args.slice(1, -1).join(' '); // Весь текст, кроме последнего аргумента (ссылки) с символами <>
        const url = args[args.length - 1]; // Последний аргумент (ссылка)

        if (!isNaN(index) && index >= 0 && index < linkData.length && args.length >= 3 && isValidUrl(url)) {
            const text = textWithSymbols.replace(/[<>]/g, ''); // Убираем символы <>
            linkData[index].text = text;
            linkData[index].url = url;
            ctx.reply(`Данные ссылки ${index + 1} успешно обновлены. Текст: ${text}, Ссылка: ${linkData[index].url}`);
        } else {
            ctx.reply(`Пример команды (меняет первую ссылку) : /setlink 1 <текст ссылки> https://ссылка`);
        }
    } else {
        ctx.reply('У вас нет прав для выполнения этой команды.');
    }
});

bot.command('deletelink', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const args = ctx.message.text.split(' ').slice(1);
        const index = parseInt(args[0], 10) - 1;

        if (!isNaN(index) && index >= 0 && index < linkData.length) {
            linkData.splice(index, 1); // Удаляем элемент из массива linkData
            ctx.reply(`Ссылка ${index + 1} успешно удалена.`);
        } else {
            ctx.reply(`Пример команды(удаляет первую ссылку) : /deletelink 1`);
        }
    } else {
        ctx.reply('У вас нет прав для выполнения этой команды.');
    }
});
bot.command('addlink', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const args = ctx.message.text.split(' ').slice(1);
        if (args.length >= 2) {
            const textWithSymbols = args.slice(0, -1).join(' '); // Весь текст, кроме последнего аргумента (ссылки) с символами <>
            const url = args[args.length - 1]; // Последний аргумент (ссылка)

            if (isValidUrl(url) && url.includes('t.me')) {
                const text = textWithSymbols.replace(/[<>]/g, ''); // Убираем символы <>
                const newLink = {
                    text: text,
                    url: url
                };
                linkData.push(newLink);
                ctx.reply(`Ссылка успешно добавлена. Текст: ${text}, Ссылка: ${url}`);
            } else {
                ctx.reply('Неверный формат ссылки. Пожалуйста, используйте корректный URL на Telegram (например, https://t.me/ссылка).');
            }
        } else {
            ctx.reply(`Пример команды(добавляем ссылку): /addlink <текст ссылки> https://t.me/ссылка`);
        }
    } else {
        ctx.reply('У вас нет прав для выполнения этой команды.');
    }
});
bot.action('ready', async (ctx) => {
    await checkSubscriptions(ctx);
    await ctx.answerCbQuery();
});

// bot.telegram.setMyCommands([
//     { command: 'menu', description: 'Показать менюю' },
// ]);


// Command to toggle between showing buttonData1, buttonData2, or both
bot.command('togglebuttons', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const args = ctx.message.text.split(' ').slice(1);
        const validArgs = ['1', '2'];
        const invalidArgs = args.filter(arg => !validArgs.includes(arg));

        if (invalidArgs.length > 0 || args.length === 0) {
            ctx.reply('Неправильный формат команды: Доступны 2 команды : /togglebuttons 1 и /togglebuttons 2 ');
        } else {
            // Toggle specific button visibility based on command arguments
            if (args.includes('1')) {
                showButton1 = !showButton1;
            }
            if (args.includes('2')) {
                showButton2 = !showButton2;
            }

            ctx.reply(`Отображение кнопок: 
                1: ${showButton1 ? 'первая кнопка' : 'Скрытая'},
                2: ${showButton2 ? 'вторая кнопка' : 'Скрытая'}.`);
        }
    } else {
        ctx.reply('У вас нет прав для выполнения этой команды.');
    }
});

bot.command('help', (ctx) => {
    const isAdminUser = isAdmin(ctx.message.from.username);

    let helpText = 'Доступные команды:\n\n';

    if (isAdminUser) {
        helpText += '/start - Запустить бота\n';
        helpText += '/addlink <текст> https://сслыка - Добавить новую ссылку\n';
        helpText += '/setlink 1 <текст> https://сслыка - Установить текст и ссылку для определенной кнопки(в данном случае для первой)\n';
        helpText += '/deletelink 1 - Удалить ссылку по её номеру (в данном случае первую)\n';
        helpText += '/setsource https://сслыка - Установить ссылку для трансляции\n';
        helpText += '/setbutton1 <текст> https://сслыка - Настроить первую кнопку\n';
        helpText += '/setbutton2 <текст> https://сслыка - Настроить вторую кнопку\n';
        helpText += '/setwelcometext <текст> - Установить текст приветствия\n';
        helpText += '/setstreamtext <текст> - Установить текст о отсутствии трансляций\n';
        helpText += '/togglelinks - Включить/выключить отображение ссылок\n';
        helpText += '/togglebuttons - Включить/выключить отображение кнопки \n';
    } else {
        helpText += '/start - Запустить бота\n';
    }

    ctx.reply(helpText);
});


// Запуск бота
bot.launch().then(() => console.log('Бот запущен'));


async function fetchWithRetry(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            return await response.json();
        } catch (err) {
            if (i === retries - 1) {
                throw err;
            }
            console.warn(`Fetch attempt ${i + 1} failed. Retrying...`);
        }
    }
}

async function getBotInfo() {
    try {
        const data = await fetchWithRetry(`https://api.telegram.org/bot${config.telegramToken}/getMe`, { timeout: 20000 });
        console.log(data);
    } catch (err) {
        console.error('FetchError:', err);
    }
}

getBotInfo();
// await dbConnect()

//    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
//    const kittySchema = new mongoose.Schema({
//       name: String
//    });
//    kittySchema.methods.speak = function speak() {
//       const greeting = this.name
//         ? 'Meow name is ' + this.name
//         : 'I don\'t have a name';
//       console.log(greeting);
//     };
//    const Kitten = mongoose.model('Kitten', kittySchema);
//    const silence = new Kitten({ name: 'Silence' });
//    console.log(silence.name); // 'Silence'
// silence.speak();
//    await silence.save();
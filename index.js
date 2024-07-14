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

let sourceText = 'Всі умови виконано і вам надано доступ до безкоштовної трансляції яку можете дивитись тут:'

let buttonData2 = {
    text: 'Кнопка 2',
    url: 'https://example.com/2'
};

let linkData = [
    {
        text: 'Спортивні новини ⚽️🇺🇦',
        url: '-1002126756144',
        value: 'https://t.me/+6bmu-EYcsollZmIy'
    },
    {
        text: 'Base of Ukrainian sport',
        url: '-1001797727702',
        value: 'https://t.me/+W0wPCcZOJs1lNTli'
    },
];

let showButton1 = true;
let showButton2 = true;

const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/;

let sourceLink = 'https://example.com/source';
let showLinks = false; // Переменная для отслеживания состояния отображения ссылок

const adminUsername = 'Kopylash8';

let welcomeText = 'Ласкаво просимо! Наразі трансляцій відсутні.';
let LinksText = 'Ласкаво просимо! Щоб дивитись пряму трансляцію матчу, потрібно підписатись на всі канали нижче:';
let sourceLinkText = "Дивитися трансляцiю"

function isAdmin(username) {
    return username == adminUsername;
}
// Функция для извлечения username канала из URL
function extractChatIdFromUrl(url) {
    const match = url.match(/t\.me\/([^\s/]+)/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}

// Функция для проверки подписки пользователя на все каналы

// Функция для проверки подписки пользователя на все каналы
async function checkSubscriptions(ctx) {
    const user = ctx.from.id; // Получаем ID пользователя

    if (linkData.length === 0) {
        // Если ссылок нет
        ctx.reply("Ссылок нет.");
        return;
    }

    const promises = linkData.map(async (link) => {
        let chatId;
        if (link.url.startsWith('-')) {
            chatId = link.url;
        } else {
            chatId = extractChatIdFromUrl(link.url);
        }

        if (chatId) {
            try {
                let chatMember;
                if (chatId.startsWith('-')) {
                    // console.log( await ctx.telegram.getChatMember("-1002192351032", user));
                    chatMember = await ctx.telegram.getChatMember(chatId, user);
                } else {
                    chatMember = await ctx.telegram.getChatMember(`@${chatId}`, user);
                }

                if (chatMember && ['member', 'administrator', 'creator'].includes(chatMember.status)) {
                    return true; // Пользователь подписан на канал
                } else {
                    return false; // Пользователь не подписан на канал
                }
            } catch (error) {
                console.error(`Ошибка при проверке подписки на канал ${chatId}:`, error);
                return false; // Ошибка при проверке подписки
            }
        } else {
            console.error(`Не удалось извлечь username или ID из URL: ${link.url}`);
            return false; // Если не удалось извлечь username или ID из URL
        }
    });

    const results = await Promise.all(promises);

    if (results.every(subscribed => subscribed)) {
        ctx.reply(sourceText, Markup.inlineKeyboard([Markup.button.url(sourceLinkText, sourceLink)]));
    } else {
        ctx.reply('Підпишіться на всі канали зі списку вище щоб отримати доступ.');
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

bot.command('setlinkstext', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const args = ctx.message.text.split(' ').slice(1);
        if (args.length >= 1) {
            let text = args.join(' ');
            if (text.startsWith('<') && text.endsWith('>')) {
                text = text.slice(1, -1); // Убираем символы <> из текста
            }
            LinksText = text;
            ctx.reply(`Текст о трансляціях успішно оновлено: ${LinksText}`);
        } else {
            ctx.reply(`Используйте команду в формате: /setlinkstext <текст>`);
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

bot.command('setsourcetext', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const newText = ctx.message.text.split(' ').slice(1).join(' ');

        if (newText) {
            const cleanedText = newText.replace(/[<>]/g, ''); // Убираем символы <>
            sourceText = cleanedText;
            ctx.reply(`Текст успешно обновлен. Новый текст: ${sourceText}`);
        } else {
            ctx.reply(`Пример команды (обновляет текст): /setsourcetext <Новый текст для сообщения>`);
        }
    } else {
        ctx.reply('У вас нет прав для выполнения этой команды.');
    }
});


bot.command('setsourcelinktext', (ctx) => {
    if (isAdmin(ctx.message.from.username)) {
        const newText = ctx.message.text.split(' ').slice(1).join(' ');

        if (newText) {
            const cleanedText = newText.replace(/[<>]/g, ''); // Убираем символы <>
            sourceLinkText = cleanedText;
            ctx.reply(`Текст успешно обновлен. Новый текст: ${sourceLinkText}`);
        } else {
            ctx.reply(`Пример команды (обновляет текст): /setsourcelinktext <Новый текст для ссылки>`);
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
                { command: 'deletelink', description: 'Удалить ссылку' },
                { command: 'setsource', description: 'Установить ссылку на трансляцию' },
                { command: 'setbutton1', description: 'Настроить кнопку 1' },
                { command: 'setbutton2', description: 'Настроить кнопку 2' },
                { command: 'setwelcometext', description: 'Установить текст приветствия' },
                { command: 'setlinkstext', description: 'Установить текст c ссылками' },
                { command: 'setsourcetext', description: 'Установить текст для сообщения' },
                { command: 'setsourcelinktext', description: 'Установить текст для ссылки на трансляцию' },
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

bot.command('start', async (ctx) => {
    await handleStartCommand(ctx);

    if (showLinks) {
        const updatedLinkData = [];
        const linkButtons = await Promise.all(
            linkData.map(async (link) => {
                if (link.value) {
                    return Markup.button.url(link.text, link.value); // Используем value для кнопки
                } else {
                    console.error(`No value found for link ${link.text}`);
                    return null; // Возвращаем null в случае отсутствия value
                }
            })
        );

        linkButtons.forEach((button, index) => {
            if (button !== null) {
                updatedLinkData.push(linkData[index]);
            }
        });

        linkData = updatedLinkData; // Обновляем linkData только с корректными ссылками

        const inlineKeyboard = linkButtons.filter(button => button !== null).map(button => [button]); // Каждую ссылку помещаем в отдельную строку
        const readyButton = Markup.button.callback('Готово ✅', 'ready');
        inlineKeyboard.push([readyButton]); // Добавляем кнопку "Готово" в отдельную строку
        ctx.reply(LinksText, Markup.inlineKeyboard(inlineKeyboard));
    } else {
        let buttonsToShow = [];
        if (showButton1) buttonsToShow.push(buttonData1);
        if (showButton2) buttonsToShow.push(buttonData2);

        const buttonMarkup = buttonsToShow.map(button => Markup.button.url(button.text, button.url));
        ctx.reply(welcomeText, Markup.inlineKeyboard([buttonMarkup]));
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
        const commandText = ctx.message.text;

        // Регулярное выражение для первого случая: /addlink <Текст> <ID группы> <Ссылка>
        const regex1 = /^\/addlink <(.+?)> (-?\d+) (.+)$/;
        // Регулярное выражение для второго случая: /addlink <Текст> <Ссылка>
        const regex2 = /^\/addlink <(.+?)> (.+)$/;

        let match;

        // Проверяем соответствие первому формату команды
        if ((match = commandText.match(regex1)) && match.length === 4) {
            const text = match[1].trim(); // Получаем текст (убираем лишние пробелы)
            let groupId = match[2]; // Получаем ID группы
            const link = match[3].trim(); // Получаем ссылку (убираем лишние пробелы)

            // Если groupId начинается с "-", добавляем "100" после "-"
            if (groupId.startsWith('-')) {
                groupId = `${groupId.slice(0, 1)}100${groupId.slice(1)}`;
            }

            const newLink = {
                text: text, // Use extracted text
                url: groupId, // Format URL for chat ID
                value: link // Duplicate URL for value
            };
            console.log(newLink);
            linkData.push(newLink);
            // Выводим значения в чат
            ctx.reply(`Текст: ${text}\nID группы: ${groupId}\nСсылка: ${link}`);
        }
        // Проверяем соответствие второму формату команды
        else if ((match = commandText.match(regex2)) && match.length === 3) {
            const text = match[1].trim(); // Получаем текст (убираем лишние пробелы)
            const link = match[2].trim(); // Получаем ссылку (убираем лишние пробелы)

            const newLink = {
                text: text,
                url: link,
                value: link // Duplicate URL for value
            };
            console.log(newLink);
            linkData.push(newLink);
            // Выводим значения в чат
            ctx.reply(`Текст: ${text}\nСсылка: ${link}`);
        } else {
            ctx.reply('Неправильный формат команды. Используйте:\n/addlink <Текст> <ID группы> <Ссылка>\nили\n/addlink <Текст> <Ссылка>.');
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
        helpText += '/addlink <текст> https://сслыка (если канал открытый канал), /addlink <текст> id https://сслыка (Если канал закрытый)  - Добавить новую ссылку\n';
        helpText += '/deletelink 1 - Удалить ссылку по её номеру (в данном случае первую)\n';
        helpText += '/setsource https://сслыка - Установить ссылку для трансляции\n';
        helpText += '/setbutton1 <текст> https://сслыка - Настроить первую кнопку\n';
        helpText += '/setbutton2 <текст> https://сслыка - Настроить вторую кнопку\n';
        helpText += '/setwelcometext <текст> - Установить текст приветствия\n';
        helpText += '/setlinkstext <текст> - Установить текст c cылками\n';
        helpText += '/setsourcetext <текст> - Установить текст для сообщения\n';
        helpText += '/setsourcelinktext <текст> - Установить текст для ссылки\n';
        helpText += '/togglelinks - Включить/выключить отображение ссылок\n';
        helpText += '/togglebuttons - Включить/выключить отображение кнопки\n';
        helpText += '/help - Помощь\n';
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
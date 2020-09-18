
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;

let bot;

if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
    bot = new TelegramBot(token, { polling: true });
}


// This file would be created soon
//const parser = require('./parser.js');

// Matches "/word whatever"
bot.onText(/\/word (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const word = match[1];
    axios.get(`${process.env.DICTIONARY_API_URL}/${word}`)

        .then(response => {
            const parsedHtml = `Welcome to Cobra Dictionary🐍🐍<b>Def:</b>${response.data[0].meanings[0].definitions[0].definition}`;
            bot.sendMessage(chatId, parsedHtml, { parse_mode: 'HTML' });
        })
        .catch(error => {
            const errorText = error.response.status === 404 ? `No definition found for the word: <b>${word}</b>` : `<b>An error occured, please try again later</b>`;
            bot.sendMessage(chatId, errorText, { parse_mode: 'HTML' })
        });
});

// Weather bot
// Matches "/weather whatever"
bot.onText(/\/weather (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const word = match[1];
    console.log(word)

    const weatherData = async () => {
        try {


            const res = await axios.get(`${process.env.OPENWEATHERMAP_API_URL}=${word}&appid=${process.env.OPENWEATHER_API_KEY}`)

            let temperature = (parseFloat(res.data['main'].temp) - 273.15).toFixed(2);
            let pressure = res.data['main'].pressure;
            let humidity = res.data['main'].humidity;
            const parsedHtml = `Welcome to Cobra Weather Bot🐍🐍<b>Weather:</b>Temperature:${temperature}&#176;C Pressure:${pressure} mb Humidity:${humidity}% `;
            bot.sendMessage(chatId, parsedHtml, { parse_mode: 'HTML' });
        } catch (err) {
            const errorText = err.response.status === 404 ? `No weather info found: <b>${word}</b>` : `<b>An error occured, please try again later</b>`;
            bot.sendMessage(chatId, errorText, { parse_mode: 'HTML' })
        }
    };

    weatherData();


});




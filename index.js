const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const axios = require('axios');


// Load your Telegram API token from the .env file
const token = process.env.TELEGRAM_TOKEN;

// Load your TrueCaller API token from the .env file
const trueCallerToken = process.env.TRUE_CALLER_TOKEN;

// Create a bot using the token
const bot = new TelegramBot(token, {polling: true});

// Listen for incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const phoneNumber = msg.text;
  try {
    if (chatId !== parseInt(process.env.CHAT_ID)){
      throw Error("I am a bot created only for my master");
    }

    if (isNaN(phoneNumber) || phoneNumber.startsWith('0')){
      throw Error("Please type only the numbers, without zero at the start");
    }

    const truecallerResponse = await getTruecallerInfo(phoneNumber);
    
    const name = truecallerResponse.name;
    const countryCode = truecallerResponse.phones[0].countryCode;

    // Format message
    const message = `Hey! Thanks for using *Who is this*\n\nThe person you are looking for is:\n\n *${name}*\n\n from:\n *${countryCode}*`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, error.message);
  }
});


// Function to make a request to Truecaller API
async function getTruecallerInfo(phoneNumber) {
  const url = 'https://asia-south1-truecaller-web.cloudfunctions.net/api/noneu/search/v1';
  const params = {
    q: phoneNumber,
    countryCode: 'il',
    type: '40',
  };

  const headers = {
    Authorization: `Bearer ${trueCallerToken}`,
  };

  const response = await axios.get(url, { params, headers });
  return response.data;
}

console.log('Bot is running...');

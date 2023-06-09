import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import { API_GET_SCANNER_DATA, BASE_URL } from "./config/endpoint.js";
import { filterParam } from "./config/filter.js";
import dotenv from "dotenv";
dotenv.config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let lastStockInfos = [];

// Event handler when the bot is ready
client.once("ready", () => {
  // Fetch data and send message in an interval
  setInterval(() => {
    fetchDataAndSendMessage();
  }, 60000); // Interval in milliseconds (e.g., 60000 ms = 1 minute)
  console.log(`Bot is ready. Logged in as ${client.user.tag}`);
  console.log("Please wait until loading is finished.");
});

// Command handler for the 'hello' command
client.on("messageCreate", (message) => {
  const stockInfo = lastStockInfos.find(
    (item) => item.Ticker.toLowerCase() === message.content.toLowerCase()
  );
  if (stockInfo) {
    message.channel.send(
      `**${stockInfo.Ticker}**   |   Price: **$${
        stockInfo.CurrentPrice
      }**   |   Float: **${stockInfo.MarketCapFloat.toFixed(
        2
      )}M**   |   5-Min Volumn: **${stockInfo.Volume5Min.toLocaleString()} **`
    );
  }

  if (message.content.startsWith("!hello")) {
    message.channel.send("Hello, I am your friendly Discord bot!");
  }
});

// Replace 'YOUR_TOKEN' with your actual bot token
client.login(process.env.BotToken);

async function fetchDataAndSendMessage() {
  console.log("Loading data...");
  try {
    const response = await axios.post(
      BASE_URL + API_GET_SCANNER_DATA,
      filterParam
    );
    lastStockInfos = response.data;
    const msg = lastStockInfos[0];

    // Get the channel where you want to send the message
    const channel = client.channels.cache.get("1116534254181027864");
    if (!channel || !msg) {
      console.log("Channel not found");
      return;
    }
    // // Send the message to the channel
    // channel.send(
    //   `**${msg.Ticker}**   |   Price: **$${
    //     msg.CurrentPrice
    //   }**   |   Float: **${msg.MarketCapFloat.toFixed(
    //     2
    //   )}M**   |   5-Min Volumn: ** ${msg.Volume5Min.toLocaleString()} **`
    // );
  } catch (error) {
    console.log("Error fetching data:", error);
  }
  console.log("Loading finished!");
}

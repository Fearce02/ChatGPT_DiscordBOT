require('dotenv').config();
const { Client } = require("discord.js");


const token = process.env.TOKEN;
const client = new Client({
    intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"],
  });
  
  client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  if (!token) {
    console.error(
      "Please provide both DISCORD_BOT_TOKEN in the environment variables."
    );
  } else {
    client.login(token).catch((error) => {
      console.error("Error logging in:", error);
    });
  }

  module.exports = {
    client,
  }
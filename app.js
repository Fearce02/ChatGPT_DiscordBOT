const { OpenAI } = require("openai");
const {client} = require("./client")
require("dotenv").config();



const IGNORE = "!";
const Channels = process.env.Channel_IDS;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ratelimit = 2000; // Rate Limit 2seconds
let lastReq = 0;


client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;
    if (msg.content.startsWith(IGNORE)) return;
    if (!Channels.includes(msg.channelId) && !msg.mentions.users.has(client.user.id))
      return;
  
    await msg.channel.sendTyping();

    const typeInterval = setInterval(() => {
      msg.channel.sendTyping();
    }, 5000);
  
    let converstation = [];
    converstation.push({
      role: "system",
      content:
        "GPT-BOT is a Friendly Chat-BOT",
    });
  
    let prevMessages = await msg.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();
    prevMessages.forEach((msg) => {
      if (msg.author.bot && msg.author.id !== client.user.id) return;
      if (msg.content.startsWith(IGNORE)) return;
  
    const username = msg.author.username
        .replace(/\s+/g, "_")
        .replace(/[^\w\s]/gi, "");
  
    if (msg.author.id === client.user.id) {
        converstation.push({
          role: "assistant",
          name: username,
          content: msg.content,
        });
        return;
      }
  
      converstation.push({
        role: "user",
        name: username,
        content: msg.content,
      });
    });
  
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastReq;
    if (elapsedTime < ratelimit) {
      console.log("Message Limit Exceeded, Please wait before sending the message again.");
      return; 
    }
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: converstation,
      });
  
      clearInterval(typeInterval);
  
      let replycontent;
      if (response && response.choices && response.choices.length > 0) {
        replycontent = response.choices[0].message.content;
      } else {
        console.error("Invalid response:", response);
        replycontent = "Sorry I Can't process your message at the moment.";
      }
  
      if (replycontent.length > 2000) {
        replycontent = replycontent.substring(0, 1997) + "...";
      }
  
      msg.reply(replycontent);
  
      lastReq = currentTime;
    } catch (error) {
      console.error("OPENAI ERROR:", error);
    }
  });
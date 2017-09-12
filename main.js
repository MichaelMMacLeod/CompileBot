var Discord = require("discord.io")
  , logger  = require("winston")
  , auth    = require("./auth.json");

var bot = new Discord.Client({
    token:   auth.token,
    autorun: true
});

const PROMPT = "compile";

var promptedIn = function (message) {
    return message.substring(0, PROMPT.length).toLowerCase() == PROMPT;
}

bot.on("ready", function (e) {
    logger.info("Connected");
    logger.info("Logged in as: ");
    logger.info(bot.username + " - (" + bot.id + ")");
});
bot.on("message", function (user, userID, channelID, message, e) {
    if (promptedIn(message)) {
        bot.sendMessage({
            to: channelID,
            message: "Hi, I'm CompileBot! Sadly, I'm still under construction."
        });
    }
});


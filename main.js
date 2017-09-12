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

var parse = function (message) {
    var sections = message.split("```")
      , task = sections[0].substring(0, PROMPT.length)
      , args = sections[0].substring(PROMPT.length, sections[0].length)
      , lang = sections[1].split("\n")[0]
      , code = sections[1].substring(lang.length, sections[1].length);
    
    return {task, args, lang, code};
}

bot.on("ready", function (e) {
    logger.info("Connected");
    logger.info("Logged in as: ");
    logger.info(bot.username + " - (" + bot.id + ")");
});
bot.on("message", function (user, userID, channelID, message, e) {
    if (promptedIn(message)) {
        var input = parse(message);
        bot.sendMessage({
            to: channelID,
            message: "```" + input.lang + "\n" + input.code + "```"
        });
    }
});

var Discord = require('discord.io')
  , logger  = require('winston')
  , auth    = require('./auth.json')
  , request = require('request');

var bot = new Discord.Client({
    token:   auth.token,
    autorun: true
});

/* Checks to see if a String starts with @CompileBot
 *
 * String s       | A String.
 * return Boolean | true; The message starts with @CompileBot
 *                  false; The message does not start with @CompileBot
 */
function containsCall(s) {
    return s.startsWith('@<' + bot.id + '>');
}

/* Converts the name of a language to it's rextester.com id.
 *
 * String l      | The name of the language.
 * return Number | The rextester.com language id.
 */
function parseLanguage(l) {
    var langs = {
        'C#': 1,
        'VB.NET': 2,
        'F#': 3,
        'Java': 4,
        'Python': 5,
        'C (gcc)': 6,
        'C++ (gcc)': 7,
        'Php': 8,
        'Pascal': 9,
        'Objective-C': 10,
        'Haskell': 11,
        'Ruby': 12,
        'Perl': 13,
        'Lua': 14,
        'Nasm': 15,
        'Sql Server': 16,
        'Javascript': 17,
        'Lisp': 18,
        'Prolog': 19,
        'Go': 20,
        'Scala': 21,
        'Scheme': 22,
        'Node.js': 23,
        'Python 3': 24,
        'Octave': 25,
        'C (clang)': 26,
        'C++ (clang)': 27,
        'C++ (vc++)': 28,
        'C (vc)': 29,
        'D': 30,
        'R': 31,
        'Tcl': 32,
        'MySQL': 33,
        'PostgreSQL': 34,
        'Oracle': 35,
        'Swift': 37,
        'Bash': 38,
        'Ada': 39,
        'Erlang': 40,
        'Elixer': 41,
        'Ocaml': 42,
        'Kotlin': 43,
        'Brainfuck': 44,
        'Fortran': 45
    };

    return langs[l];
}

/* Parses a valid compilation query. The query must use proper syntax.
 *
 * String m  | The entire user message.
 * return {} | An object specifying the language, program, input, and compiler
 *             args of the user's message all stored as Strings.
 */
function parseMessage(m) {
    var lines   = m.split('\n')
      , args    = lines[0].match(/-\w+/g)
      , lang    = lines[0].match(/\w+\n/g)
      , content = m.match(/\n[^```]*/g)
      , program = content[0]
      , input   = content[1];

    return {
        'LanguageChoice': parseLanguage(lang),
        'Program': program,
        'Input': input,
        'CompilerArgs': args
    };
}

/* Sends an api POST request to http://rextester.com/
 * 
 * String m      | A valid message.
 * return String | Rextester's response.
 */
function rextest(m) {
    request.post(
        'http://rextester.com/rundotnet/api',
        { json: parseMessage(m) },
        function (e, response, body) {
            return body['Result'];
        });
}

/* Sends a channel message.
 * 
 * String id | id of the channel.
 * String m  | Message to send.
 */
function sendMessage(id, m) {
    bot.sendMessage({ to: id, message: m });
}

bot.on('ready', function (e) {
    logger.info("Connected");
    logger.info("Logged in as: ");
    logger.info(bot.username + " - (" + bot.id + ")");
});

bot.on('message', function (user, userID, channelID, message, e) {
    if (containsCall(message)) {
        try {
            sendMessage(channelID, rextest(message));
        } catch (e) {
            sendMessage(channelID, e.message);
        }
    }
});
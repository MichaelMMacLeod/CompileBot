var Discord = require('discord.io')
  , logger  = require('winston')
  , auth    = require('./auth.json')
  , request = require('request');

var bot = new Discord.Client({
    token:   auth.token,
    autorun: true
});

var MESSAGE_TYPES = {
    QUERY: 'query',
    CODE: 'compilation'
}

var parseUserMessage = function (message) {
    if (message.substring(0, ('<@' + bot.id + '>').length) != '<@' + bot.id + '>')
        return {valid:false};

    var text = message;
    var lines = (function () {
        return text.split('\n');
    })();
    var type = (function () {
        if (lines.length === 1)
            return MESSAGE_TYPES.QUERY;
        else
            return MESSAGE_TYPES.CODE;
    })();
    var valid = (function () {
        if (lines.length === 0)
            return false;

        var botName   = '<@' + bot.id + '>'
          , givenName = lines[0].substring(0, botName.length);

        if (botName != givenName)
            return false;

        if (type == MESSAGE_TYPES.QUERY && lines.length != 1)
            return false;

        if (type == MESSAGE_TYPES.CODE && lines.length < 2)
            return false;

        // TODO: more checks needed!

        return true;
    })();
    var content = (function () {
        if (type === MESSAGE_TYPES.CODE) {
            return text.match(/```[\S\s]*```/g)[0];
        } else {
            return "Hi, I'm CompileBot. Call me *exactly* like this:\n\n    @CompileBot **Language**\\`\\`\\`\n    **Code**\n    \\`\\`\\`\nFor example,\n\n    @CompileBot **Java**\\`\\`\\`\n**    class Rextester\n    {\n        public static void main(String[] args)\n        {\n            System.out.println(\"Hello, World!\");\n        }\n    }**\n    \\`\\`\\`";
        }
    })();
    var codeLines = (function () {
        if (type === MESSAGE_TYPES.CODE)
            return content.split('\n');
        else
            return '';
    })();
    var program = (function () {
        if (type === MESSAGE_TYPES.QUERY)
            return '';
        
        var code = '';

        for (let i = 1; i < codeLines.length - 1; i++) {
            code += codeLines[i];
        }

        return code;
    })();
    var input = ''; // TODO
    var language = (function () {
        if (type === MESSAGE_TYPES.CODE) {
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
            return +langs[codeLines[0].substring(3, codeLines[0].length)];
        } else {
            return '';
        }
    })();

    return {text, lines, type, valid, content, program, input, language};
}

bot.on('ready', function (e) {
    logger.info("Connected");
    logger.info("Logged in as: ");
    logger.info(bot.username + " - (" + bot.id + ")");
});
bot.on('message', function (user, userID, channelID, message, e) {
    var parsed = parseUserMessage(message);
    if (parsed.valid) {
        switch (parsed.type) {
            case MESSAGE_TYPES.QUERY:
                bot.sendMessage({
                    to: channelID,
                    message: parsed.content
                });
                break;
            case MESSAGE_TYPES.CODE:
                console.log(parsed.language);
                request.post(
                    'http://rextester.com/rundotnet/api',
                    {
                        json: {
                            'LanguageChoice': parsed.language,
                            'Program': parsed.program,
                            'Input': parsed.input,
                            'CompilerArgs': parsed.args
                        }
                    },
                    function (e, response, body) {
                        var r = '`Output`\n' + body['Result'] + '\n`Errors`\n' + body['Errors'];
                        console.log(r);
                        bot.sendMessage({
                            to: channelID,
                            message: r
                        })
                    });
                break;
            default:
                console.log("Unknown message type: " + parsed.type);
                break;
        }
    }
});

var Discord = require('discord.io')
  , logger  = require('winston')
  , auth    = require('./auth.json')
  , request = require('request');

var bot = new Discord.Client({
    token:   auth.token,
    autorun: true
});

bot.on('ready', function (e) {
    logger.info("Connected");
    logger.info("Logged in as: ");
    logger.info(bot.username + " - (" + bot.id + ")");
    bot.setPresence({
        game: {
            name: '@CompileBot help'
        }
    })
});

var CompileBot = (() => {
    var In = (() => {
        summoned = (message, id) => message.startsWith('<@' + id + '>');

        verify = (message, id) => {
            if (!message) 
                return false;

            if (!summoned(message, id)) 
                return false;

            var lines = message.split('\n');

            if (lines.length === 1) {
                var words = lines[0].match(/\w+/g);

                if (words.length != 2) {
                    return false;
                }

                return true;
            } else {
                var words = lines[0].match(/\w+/g);

                if (words.length < 2)
                    return false;

                if (!lines[0].includes('```'))
                    return false;
                if (!lines[lines.length - 1].includes('```'))
                    return false;

                // TODO: check for valid input section
            }

            return true;
        };

        parseLang = (lang) => {
            var langs = {
                  'csharp': '1'
                , 'vbnet': '2'
                , 'fsharp': '3'
                , 'java': '4'
                , 'python': '5'
                , 'c': '6'
                , 'cgcc': '6'
                , 'c++': '7'
                , 'php': '8'
                , 'pascal': '9'
                , 'objectivec': '10'
                , 'haskell': '11'
                , 'ruby': '12'
                , 'perl': '13'
                , 'lua': '14'
                , 'nasm': '15'
                , 'sqlserver': '16'
                , 'javascript': '17'
                , 'lisp': '18'
                , 'prolog': '19'
                , 'go': '20'
                , 'scala': '21'
                , 'scheme': '22'
                , 'nodejs': '23'
                , 'python3': '24'
                , 'octave': '25'
                , 'cclang': '26'
                , 'cppclang': '27'
                , 'c++clang': '27'
                , 'cppvcpp': '28'
                , 'c++vc++': '28'
                , 'cvc': '29'
                , 'd': '30'
                , 'r': '31'
                , 'tcl': '32'
                , 'mysql': '33'
                , 'postgresql': '34'
                , 'oracle': '35'
                , 'swift': '37'
                , 'bash': '38'
                , 'ada': '39'
                , 'erlang': '40'
                , 'elixer': '41'
                , 'ocaml': '42'
                , 'kotlin': '43'
                , 'brainfuck': '44'
                , 'fortran': '45'
            };

            return langs[lang.toLowerCase()];
        }

        parse = (message, id) => {
            var lines = message.split('\n');
            
            if (lines.length === 1) {
                return {
                    'type': 'query',
                    'query': lines[0].match(/\w+/g)[1]
                }

            }

            var lines   = message.match(/.*\n/g)
              , words   = lines[0].match(/\w+/g)
              , lang    = parseLang(words[1])
              , args    = (lines[0].match(/-.[^-^`]+/g) || []).join(' ')
              , program = message.match(/\n[^```]*/g)[0] || ''
              , input   = (message.match(/\n[^```]*/g)[1] || '').trim();

            return { 
                'type': 'compilation',
                'lang': lang, 
                'args': args, 
                'program': program, 
                'input': input
            };
        };

        return { verify, parse };
    })();

    var Out = (() => {
        var send = (channelID, str) => {
            bot.sendMessage({
                to: channelID, 
                message: str });
        };
    
        var rexhandler = (channelID) => (e, response, body) => {
            if (body['Errors'])
                send(channelID, 'rextester error(s):```\n' + body['Errors'] + '```');
    
            send(channelID, 'Output:```\n' + body['Result'] + '```');
        };

        var compile = (parsed, handler) => {
            var j = {
                json: {
                    'LanguageChoice': parsed.lang,
                    'Program': parsed.program,
                    'Input': parsed.input,
                    'CompilerArgs': parsed.args
                }
            };

            request.post(
                'http://rextester.com/rundotnet/api',
                j, 
                handler);
        };

        return { send, rexhandler, compile };
    })();

    var Internal = (() => {
        var query = (message, botID) => {
            var queries = {
                    'help': 'Hi. I\'m @CompileBot. I compile code.\nCommands:\nhelp - Display this message.\nsyntax - How to enter code that I can understand.\napi - Information about the api(s) I use to compile code.\nsource - View my source code.\nissue - Submit a bug/issue report.\nauthor - Who built me?\ntest - Have me compile a test program for you.'
                  , 'syntax': 'IMPORTANT:\nThere are special API-specific rules for how to structure programs that I can understand.\nTo see these rules, enter `@CompileBot api`\n\nText inside [brackets] is optional. Text inside (parenthesis) is required. Plain text should appear exactly how it is written.\n\n@CompileBot (language) [-args]\\`\\`\\`[language]\n[code]\n\\`\\`\\`Input\\`\\`\\`\n[input]\n\\`\\`\\`\n\nExample:\n\n@CompileBot Java\\`\\`\\`Java\nimport java.util.Scanner;\nclass Rextester {\n    public static void main(String[] args) {\n        Scanner scan = new Scanner(System.in);\n        String demoInput = scan.nextLine();\n        System.out.println("Demo input: " + demoInput);\n    }\n}\n\\`\\`\\`Input\\`\\`\\`\nHello, World!\n\\`\\`\\`\n\nWill print\n\nDemo Input: Hello, World!'
                  , 'api': 'I use the rextester.com API.\n\nFor Java programs, you must include a main method within a class declared as `class Rextester` (no public modifier).\n\nThere are other rules for different languages.\nFor a full list of rules, visit rextester.com.'
                  , 'source': 'Source core available at https://github.com/michaelmmacleod/compilebot'
                  , 'issue': 'Found a bug or issue? Submit it at https://github.com/michaelmmacleod/compilebot/issues. Thanks!'
                  , 'author': 'I was created by Michael MacLeod. <michaelmmacleod@gmail.com>'
                  , 'test': '<@' + botID + '>' + ' Haskell -o a.out source_file.hs```Haskell\nmain = getLine >>= print\n```Input```\nHello, World!```'
            }

            var result = queries[message.toLowerCase()];

            if (result)
                return result;
            else
                return 'Unknown command. Try `@CompileBot help`';
        };

        return { query };
    })();

    return { In, Internal, Out };
})();

bot.on('message', function (user, userID, channelID, message, e) {
    if (CompileBot.In.verify(message, bot.id)) {
        var parsedMessage = CompileBot.In.parse(message, bot.id);

        if (parsedMessage['type'] === 'compilation') {
            CompileBot.Out.compile(
                CompileBot.In.parse(message, bot.id),
                CompileBot.Out.rexhandler(channelID));
        } else if (parsedMessage['type'] === 'query') {
            CompileBot.Out.send(
                channelID, 
                CompileBot.Internal.query(parsedMessage['query'], bot.id));
        }
    }
});

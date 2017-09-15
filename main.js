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

            if (message.length === 1) {
                return false; // TODO: handle commands like "@CompileBot info"
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
            var lines   = message.match(/.*\n/g)
              , words   = lines[0].match(/\w+/g)
              , lang    = parseLang(words[1])
              , args    = (lines[0].match(/-.[^-^`]+/g) || []).join(' ')
              , program = message.match(/\n[^```]*/g)[0]
              , input   = ''; // TODO: handle input.

            return { 
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

    return { In, Out };
})();

bot.on('message', function (user, userID, channelID, message, e) {
    if (CompileBot.In.verify(message, bot.id)) {
        CompileBot.Out.compile(
            CompileBot.In.parse(message, bot.id),
            CompileBot.Out.rexhandler(channelID));
    }
});
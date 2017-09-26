CompileBot
==========
Hi, I'm a code compiler for Discord servers.

I use the rextester.com API. Support for more APIs may come in the future.

Requirements
============
node.js

npm

Usage
=====
Create a new Discord application at https://discordapp.com/developers/applications/me.

Click "Create a Bot User".

Take note of the Client ID and Bot Token.

Click save.

Replace "CLIENT_ID" in https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot with your bot's id, and go to the link. Add your bot to a server.

run `git clone https://github.com/MichaelMMacLeod/CompileBot.git`

Add a file named "auth.json"

In auth.json:
```
{
	"token": "your bot token here"
}
```

run `npm install discord.io winston request --save`

Start the bot with `node main`

Check if the bot is working correctly by typing `@YourBotName test` in the Discord server that your bot lives in.

Contributions
=============
Bugs/issues/requests/ideas are welcome!

Go to https://github.com/MichaelMMacLeod/CompileBot/issues, or submit a pull request.
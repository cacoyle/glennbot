"use strict";

const Discord = require('discord.js');
const client = new Discord.Client();
const nconf = require('nconf');
const fs = require('fs');
const { randomArrayValue } = require('./util/random');
//Load configuration, either from environment or file
nconf.argv()
    .env()
    .file({ file: './auth.json' });

//Validate configuration
if (typeof nconf.get('bot_token') === 'undefined' || typeof nconf.get('bot_token') !== 'string') {
    console.error("No token information supplied.\n\nHint: try --bot_token TOKEN or set bot_token variable in auth.json");
    process.exit(1);
}

//Authenticates
process.stdout.write('Logging in to discord with token... ');
client.login(nconf.get('bot_token'))
    .then(console.log('GREAT SUCCESS!'))
    .catch(err => {
        console.log('FAILED!');
        console.error(err);
        process.exit(1);
    });

var processFileAsync = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, contents) => {
            if (err) {
                reject(err);
            } else {
                var data = contents.toString().split("\n");
                resolve(data);
            }
        });
    });
};

var shutup = [];
var nolink = [];

if (fs.existsSync('insults/shutup.txt')) {
    processFileAsync('insults/shutup.txt').then(data => {
        shutup = data;
    });
}

if (fs.existsSync('insults/nolink.txt')) {
    processFileAsync('insults/nolink.txt').then(data => {
        nolink = data;
    });
}

//Discord client events
client.on('ready', () => {
    client.user.setPresence({ status: 'online', game: { name: 'Fuck Trent', type: 'wut' } });
    console.log(client.user.status, client.user.presence);
    console.log(`Logged in as ${client.user.id}`);
    console.log('Bot is authorized.');
});


//Setting global var targetuser for the userid of who to 'troll'
var targetUser = 'Trent8688'
var prefix = '?';

//Tells trent to shutup when he says something
client.on('message', message => {
    // Making sure bot doesn't reply to itself or other bots for whatever reason.
    if (message.author.bot) return;

    if (message.content.startsWith(`${prefix}settarget`)) {

        if (message.author.username === targetUser) {
            message.reply('No can do.');
            return;
        }
        
        let newTarget = message.mentions.users.first();
        if (newTarget) {
            targetUser = newTarget.username;
            message.reply(`New target set: ${newTarget}`);
        } else {
            message.reply('Mention a user.');
        }
        // Exit early for now
        return;
    }

    if  (`${message.mentions.users.first()}` == `<@${client.user.id}>`) {
        message.reply('hello');
    }

    // He sent a link
    if (message.author.username === targetUser && message.content.substring(0, 4) === 'http') {
        var response = randomArrayValue(nolink);
        message.reply(response);
    }
    //He talked but didn't send a link, be mean to him anyway
    if (message.author.username === targetUser) {
        var response = randomArrayValue(shutup);
        message.reply(response);
    }

});    

client.on('message', message => {
if (message.content.startsWith(`${prefix}imgur`)) {
var imgurlink = require('./util/imgur');
var arr = message.content.match(/\S+/gi)
var subReddit = arr[1]
    imgurlink.imgur(`${subReddit}`).then(data => {
    imgurlink = data;
    message.reply(imgurlink);    

});
}
});


// Sends original message after an edit
client.on('messageUpdate', (original, updated) => {
    if (original.author.username === targetUser) {
        console.log(`Original: ${original.content}`);
        console.log(`Updated: ${updated.content}`);
        updated.reply(`Nice try: \n\`\`\`${original.content}\`\`\``);
    }
});


//Message Logging
client.on('message', message => {
    console.log(message.content, message.author.username);
    console.log(`Mentions: ${message.mentions.users.first()}`);
    console.log(message.author.username.roles);;
    console.log(`${message.mentions.users.first()}`)
});

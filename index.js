require('isomorphic-fetch');

var Dropbox = require("dropbox").Dropbox;

const Discord = require("discord.js");
const bot = new Discord.Client();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = "!";

bot.on("ready", () => {
    console.log("This bot is online!");
})

bot.on("message", msg => {
    if(msg.content.startsWith(PREFIX)){
        let message = msg.content.substring(PREFIX.length);
        let args = message.split(" ");
        
        if(args.length > 0) {
            try {
                if(args[0] == "show"){
                    let card_no = args[1];
                    let card_path = "/Photos/Remonster Cards/Updated/" + card_no + ".png";
                    
                    var dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });
                    dbx.filesGetTemporaryLink({path: card_path})
                        .then(function(response) {
                            msg.channel.send(response.link);
                        })
                        .catch(function(error) {
                            msg.reply("Sorry, an error occured");
                        });
                }else{
                    msg.reply("I don't understand");
                }
            }catch{
                msg.reply("Sorry, an error occured");
            }
        }else{
            msg.reply("I don't understand");
        }
    }
})

bot.login(DISCORD_TOKEN);

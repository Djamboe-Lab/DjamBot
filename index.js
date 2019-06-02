require('isomorphic-fetch');

var Dropbox = require("dropbox").Dropbox;
var dbx = new Dropbox({ accessToken: "G7kep4ugLgkAAAAAAAABlGmBiMOBO8jpyrjfWBa0cPUgnN1Jl4Zu3G0113tVOvXY" });

const Discord = require("discord.js");
const bot = new Discord.Client();

const DISCORD_TOKEN = "NTg0NTgyNTc1NzY3NTUyMDAx.XPNDVA.3Er0WBYjpm_1ky_MD9hZWNE7fxs";
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
                    
                    dbx.filesGetTemporaryLink({path: card_path})
                        .then(function(response) {
                            console.log(response);
                            msg.channel.send(response);
                        })
                        .catch(function(error) {
                            console.log(error);
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
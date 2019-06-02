require('isomorphic-fetch');

var Dropbox = require("dropbox").Dropbox;
var dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });

const { Client, RichEmbed } = require("discord.js");
const client = new Client();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = "!";

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on("message", msg => {
    if(msg.content.startsWith(PREFIX)){
        let message = msg.content.substring(PREFIX.length);
        let args = message.split(" ");
        
        if(args.length > 0) {
            try {
                if(args[0] == "help"){
                    msg.channel.send(
                        "- `!show unit_number`\n" +
                        "- `!help`\n" +
                        "- `!about`");
                }
                else if(args[0] == "about"){
                    msg.channel.send("I am DjamBot, created with love by my Master, Djamboe");
                }
                else if(args[0] == "show"){
                    let card_no = args[1] + (args[2] != null ? " " + args[2] : "");
                    let card_path = "/Photos/Remonster Cards/Updated/" + card_no + ".png";
                    
                    dbx.filesGetTemporaryLink({path: card_path})
                        .then(function(response) {
                            console.log(response);

                            const embed = new RichEmbed();
                            embed.setTitle("Re:Monster Card");
                            embed.setImage(response.link);
                            embed.setColor(0xFF0000);
                            embed.setFooter("No. " + args[1]);
                            msg.channel.send(embed);
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
    }else{
        if(msg.content.indexOf("fuck") !== -1 || msg.content.indexOf("fvck") !== -1 || msg.content.indexOf("f*ck") !== -1)
            msg.reply("Hey! Language..");
    }
})

client.login(DISCORD_TOKEN);

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
        let message = msg.content.toLowerCase().substring(PREFIX.length);
        let args = message.split(" ");
        
        if(message == "show tier list"){
            const embed = new RichEmbed();
                embed.setTitle("Re:Monster Tier List");
                embed.setURL("https://docs.google.com/spreadsheets/d/1rC9_oQXl9DU4J13X9wRhW194FtOLFJP_udYj-f-ZtBs/edit?usp=sharing");
                embed.setColor(0x239B56);
                embed.setDescription("This tier list aims to help new players figure out the strength of their units and in which situations they are best placed.");
                embed.setFooter("Thanks to @Tier List team");
                msg.channel.send(embed);
        }
        else if(args.length > 0) {
            try {
                if(args[0] == "help"){
                    msg.channel.send(
                        "- `!show unit_number`\n" +
                        "- `!show tier list`\n" +
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
        let message = msg.content.toLowerCase();

        if(message == "┬──┬◡ﾉ(° -°ﾉ)"){
            msg.channel.send("(╯°Д°)╯︵/(.□ . \)");
        }
        else if(message.indexOf("tier list") !== -1 && message.indexOf("?") !== -1 && message.indexOf("?") > message.indexOf("tier list")){
            msg.reply("Looks like you're looking for tier list. Please check #guides_and_lists or type `!show tier list` command.");
        }
        else if(message.indexOf("re-monster.fandom.com") !== -1 || message.indexOf("reddit.com/r/goblinreincarnation") !== -1){
            msg.react("👍");
        }
        else if(message.indexOf("fuck") !== -1 || message.indexOf("fvck") !== -1 || message.indexOf("f*ck") !== -1){
            msg.reply("Hey! Language..");
        }
    }
})

client.login(DISCORD_TOKEN);

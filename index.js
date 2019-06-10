require('isomorphic-fetch');

var Dropbox = require("dropbox").Dropbox;
var dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });


const { Client, RichEmbed } = require("discord.js");
const client = new Client();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = "!";


const fs = require("fs");
var json = JSON.parse(fs.readFileSync('units.json', 'utf8'));


const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});


let fuResp = [ "Hey! Language..", "It's Hammer Time!", "ლ(ಠ益ಠლ)", "ಠ_ಠ" ];

client.on("ready", () => {
    client.user.setPresence({
        game: {
            name: 'you closely',
            type: "WATCHING"
        }
    });
    
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on("message", msg => {
    if(msg.author.id == "584582575767552001" || msg.author.id == "584637129317941248")
        return;

    if(msg.content.startsWith(PREFIX) && msg.content.length > 4){
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
                    let embed = new RichEmbed();
                    embed.setTitle("Beeb Boop I'm DjamBot");
                    embed.setDescription("`Created with love by my Master, Djamboe`");
                    embed.addField("Command", 
                        "- `!show unit_number`\n" +
                        "- `!show tier list`\n" +
                        "- `!stats unit_number`\n" +
                        "- `!compare unit_number_1 ... unit_number_n`\n" +
                        "- `!help`");
                    embed.setFooter("Any suggestion is welcome...");
                    embed.setColor(0x5B2C6F);
                    msg.channel.send(embed);
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

                            let unitname = "";
                            let addinfo = "";
                            let unitstats = json[args[1]];
                            if(unitstats != null){
                                unitname = unitstats.name;
                                
                                if(unitstats.data.length > 1)
                                    addinfo = "This unit has " + unitstats.data.length + " variants. Type `!stats " + args[1] + "` to show more information."
                            }

                            const embed = new RichEmbed();
                            embed.setTitle("Re:Monster Card" + (unitname != "" ? ": " + unitname : ""));
                            embed.setImage(response.link);
                            embed.setColor(0xFF0000);
                            
                            if(addinfo != "")
                                embed.setDescription(addinfo);

                            embed.setFooter("No. " + args[1]);
                            msg.channel.send(embed);
                        })
                        .catch(function(error) {
                            console.log(error);
                            msg.reply("Sorry, an error occured");
                        });
                }else if(args[0] == "stats"){
                    let unitstats = json[args[1]];
                    if(unitstats != null){
                        let content = 
                        "+-----------------------------------------------------------------+\n" +
                        "• EVO • HP • ATK • DEF • MAG • DEX • EVA • ACT • MV • LCK •\n" +
                        "+-----------------------------------------------------------------+\n";

                        for(x=0; x<unitstats.data.length; x++){
                            content += 
                            "• " +
                            unitstats.data[x].evo + " • " + 
                            unitstats.data[x].hp + " • " + 
                            unitstats.data[x].atk + " • " + 
                            unitstats.data[x].def + " • " + 
                            unitstats.data[x].mag + " • " + 
                            unitstats.data[x].dex + " • " + 
                            unitstats.data[x].eva + " • " + 
                            unitstats.data[x].act + " • " + 
                            unitstats.data[x].mv + " • " + 
                            unitstats.data[x].lck + " •\n" +
                            "+-----------------------------------------------------------------+\n";
                        }
                        let embed = new RichEmbed();
                        embed.setTitle(unitstats.name);
                        embed.setDescription("`" + unitstats.description + "`\n\n" + "`" + content + "`");
                        embed.setFooter("No. " + args[1]);
                        embed.setColor(0x2E86C1);
                        msg.channel.send(embed);
                    }else
                        msg.reply("Data not found, please check your id");
                }else if(args[0] == "compare"){
                    let desc = "";
                    let content = "";

                    for(x=1; x<args.length; x++){
                        let unitstats = json[args[x]];
                        if(unitstats != null){
                            desc += 
                                "• " + args[x] + " " + unitstats.name + "\n";

                            content += 
                                "• " +
                                args[x] + " • " +
                                unitstats.data[0].evo + " • " + 
                                unitstats.data[0].hp + " • " + 
                                unitstats.data[0].atk + " • " + 
                                unitstats.data[0].def + " • " + 
                                unitstats.data[0].mag + " • " + 
                                unitstats.data[0].dex + " • " + 
                                unitstats.data[0].eva + " • " + 
                                unitstats.data[0].act + " • " + 
                                unitstats.data[0].mv + " • " + 
                                unitstats.data[0].lck + " •\n";
                        }
                    }

                    if(content != ""){
                        content = 
                            "`+-----------------------------------------------------------------+\n" +
                            "• NO • EVO • HP • ATK • DEF • MAG • DEX • EVA • ACT • MV • LCK •\n" +
                            "+-----------------------------------------------------------------+\n" +
                            content + 
                            "+-----------------------------------------------------------------+`\n";

                        let embed = new RichEmbed();
                        embed.setTitle("Stats Comparison");
                        embed.setDescription("Comparison between\n" + desc + "\n" + content);
                        embed.setColor(0xF7DC6F);
                        msg.channel.send(embed);
                    }else{
                        msg.reply("Data not found, please check your id");
                    }
                }
                else{
                    msg.reply("I don't understand");
                }
            }catch{
                msg.reply("Sorry, an error occured");
            }
        }else{
            msg.reply("I don't understand");
        }
        //insert to Database
        let QUERY = "INSERT INTO BOT_LOG(USER_ID, COMMAND, DATE_ADDED) VALUES($1, $2, NOW()) RETURNING *";
        let QUERY_VALUES = [ msg.author.username + "#" + msg.author.discriminator, message ];

        pool.query(QUERY, QUERY_VALUES, (err, res) => {        
            if (err) {
                console.log(err.stack);
            } else {
                console.log(res.rows[0]);
            }
        });
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
        
        if(message.indexOf("fuck") !== -1 || message.indexOf("fvck") !== -1 || message.indexOf("f*ck") !== -1){
            //msg.react("👎");
            //msg.reply("Hey! Language..");

            msg.reply(fuResp[Math.floor(Math.random() * fuResp.length)]);
        }

        if(message.indexOf("djamb") !== -1){
            msg.react("350295066599751681");
        }

        if(message.indexOf("hyulton") !== -1){
            msg.react("553598201895190568");
        }

        if(message.indexOf("keikaku") !== -1){
            msg.channel.send("TL Note: keikaku means plans");
        }

        if(message == "sad" || message.indexOf("sad ") !== -1 || message.indexOf(" sad") !== -1){
            msg.channel.send("Alexa, Play Despacito ♪");
        }
    }
})

client.login(DISCORD_TOKEN);

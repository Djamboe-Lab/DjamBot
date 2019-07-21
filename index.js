require('isomorphic-fetch');
const wikia = require("./wikia.js");

var Dropbox = require("dropbox").Dropbox;
var dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });


const { Client, RichEmbed } = require("discord.js");
const client = new Client();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = "!";


const fs = require("fs");
var units_json = JSON.parse(fs.readFileSync('units.json', 'utf8'));
var unitequips_json = JSON.parse(fs.readFileSync('unit_equips.json', 'utf8'));


const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});


let fuResp = [ "Hey! Language..", "It's Hammer Time!", "ლ(ಠ益ಠლ)", "ಠ_ಠ" ];
let thanksList = [ "thank you", "thanks", "ty", "thx", "tq" ];
let thanksEmojiList = [ "👌", "👍", "👏" ];
let smileEmojiList = [ "😀", "😬", "😁", "😂", "😃", "😄", "😆", "😇", "😊", "🙂", "🙃", "😅", "☺", "😋", "😌", "😺", "😸", "😹", "🤣" ];


function AttachIsImage(msgAttach) {
    var url = msgAttach.url;
    return url.indexOf(".png") != -1 || url.indexOf(".jpg") != -1;
}


client.on("ready", () => {
    client.user.setPresence({
        game: {
            name: 'you closely',
            type: "WATCHING"
        }
    });

    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
    if(msg.author.id == "584582575767552001" || msg.author.id == "584637129317941248")
        return;

    if (msg.channel.type == "dm") {
        msg.author.send("I'm not interested with private matter");
        return;
    }

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
                            let unitstats = units_json[args[1]];
                            if(unitstats != null){
                                unitname = unitstats.name;
                                
                                if(unitstats.data.length > 1)
                                    addinfo = "This unit has " + unitstats.data.length + " variants. Type `!stats " + args[1] + "` to show more information."
                            }

                            let unitequips = unitequips_json[args[1]];
                            if(unitequips != null){                                
                                addinfo += "\nThis unit has " + unitequips.length + " equipment" + (unitequips.length > 1 ? "s": "") + ": `";

                                for(x=0; x<unitequips.length; x++){
                                    addinfo += unitequips[x];

                                    if(x != unitequips.length-1)
                                    addinfo += ", ";
                                }

                                addinfo += "`";
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
                    let unitstats = units_json[args[1]];
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
                        
                        wikia.GetImages("Icon_" + unitstats.image + ".png", function(resp){
                            let imgThumb = "";
                            if(resp != "error"){
                                imgThumb = resp;
                            }

                            let embed = new RichEmbed();
                            embed.setTitle(unitstats.name);
                            embed.setDescription("`" + unitstats.description + "`\n\n" + "`" + content + "`");
                            embed.setFooter("No. " + args[1]);
                            embed.setColor(0x2E86C1);

                            if(imgThumb != "")
                                embed.setThumbnail(imgThumb);
                            
                            msg.channel.send(embed);
                        });
                    }else
                        msg.reply("Data not found, please check your id");
                }else if(args[0] == "compare"){
                    let desc = "";
                    let content = "";

                    for(x=1; x<args.length; x++){
                        let unitstats = units_json[args[x]];
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
        
        //tekhien custom
        if(msg.author.id == "233899667958661121" && msg.channel.id == "287985862388482048" && !msg.content.startsWith("t!")){
            //msg.react("🤔");
            return;
        }

        if(message == "┬──┬◡ﾉ(° -°ﾉ)"){
            msg.channel.send("(╯°Д°)╯︵/(.□ . \)");
        }
        else if(message.indexOf("tier list") != -1 && message.indexOf("?") != -1 && message.indexOf("?") > message.indexOf("tier list")){
            msg.reply("Looks like you're looking for tier list. Please check <#300497680990339073> or type `!show tier list` command.");
        }
        
        if(message.indexOf("re-monster.fandom.com") != -1 || message.indexOf("reddit.com/r/goblinreincarnation") != -1){
            msg.react("❤").then(() => msg.react("💛")).then(() => msg.react("💚")).then(() => msg.react("💙")).then(() => msg.react("💜"));
        }
        
        if(message.indexOf("jaiminisbox.com/reader/read/solo-leveling") != -1){
            msg.react("🇭").then(() => msg.react("🇪")).then(() => msg.react("🇺")).then(() => msg.react("🇰")).then(() => msg.react("❔")).then(() => msg.react("❕"));
        }
        
        if(message.indexOf("fuck") != -1 || message.indexOf("fvck") != -1 || message.indexOf("f*ck") != -1 || message.indexOf("fkn") != -1){
            //msg.react("👎");
            //msg.reply("Hey! Language..");

            msg.reply(fuResp[Math.floor(Math.random() * fuResp.length)]);
        }

        if(message.indexOf("djamb") != -1){
            msg.react("350295066599751681");
        }

        if(message.indexOf("hyulton") != -1){
            msg.react("553598201895190568");
        }

        if(message.indexOf("keikaku") != -1){
            msg.channel.send("TL Note: keikaku means plan");
        }

        if(message == "sad" || message.indexOf("sad ") != -1 || message.indexOf(" sad") != -1){
            msg.channel.send("Alexa, Play Despacito ♪");
        }

        //terra welcome
        if(msg.author.id == "172002275412279296" && message.startsWith("welcome")){
            msg.react("299052456250441732");
        }

        if(thanksList.includes(message) || message.indexOf("thank you") != -1 || message.indexOf("thanks") != -1 || message.indexOf("thx") != -1 || message.indexOf("tq") != -1){
            msg.react(thanksEmojiList[Math.floor(Math.random() * thanksEmojiList.length)]);
        }

        //salt mines
        if(msg.channel.id == "384601562984611840" && msg.attachments.size > 0) {
            if (msg.attachments.every(AttachIsImage)){
                msg.react("484903712972865536");
            }
        }

        if(message.indexOf("nani") != -1){
            msg.channel.send("https://www.youtube.com/watch?v=vxKBHX9Datw")
        }

        if(message.indexOf("wtf") != -1){
            msg.react("😱");
        }

        if(message.indexOf("lol") != -1 || message.indexOf("haha") != -1 || message.indexOf("ahah") != -1 || message.indexOf("xd") != -1){
            msg.react(smileEmojiList[Math.floor(Math.random() * smileEmojiList.length)]);
        }
        
        if(msg.author.id == "327359841154760707" && message.startsWith("speak")){
            let guild = client.guilds.get("287871335227457536");
            if(guild){
                let channel = guild.channels.get("287871335227457536");
                if(channel){
                    channel.send(message.substring(5));
                }else
                    console.log("Channel not found!");
            }else
                console.log("Guild not found!");
        }
    }
});

client.login(DISCORD_TOKEN);

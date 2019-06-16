function GetImages(fileName, callback){
    const https = require("https");
    let path = "https://re-monster.fandom.com/api/v1/Search/List?query=File%3A" + fileName;

    const req = https.get(path, res => {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });

        res.on("end", () => {
            let resJSON = JSON.parse(data);

            if(resJSON.exception == null){
                let articleId = resJSON.items[0].id;
                path = "https://re-monster.fandom.com/api/v1/Articles/Details?ids=" + articleId;

                const req2 = https.get(path, res => {
                    data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        resJSON = JSON.parse(data);
                        
                        if(resJSON.items[articleId] != null){
                            let imgPath = resJSON.items[articleId].thumbnail;
                            console.log(imgPath.substring(0, imgPath.indexOf(fileName) + fileName.length));

                            callback(imgPath.substring(0, imgPath.indexOf(fileName) + fileName.length));
                        }else{
                            console.log("Not Found");
                            callback("error");
                        }
                    });
                }).on("error", error => {
                    console.log(error);
                    callback("error");
                });
            }
            else{
                console.log("Not Found");
                callback("error");
            }
        });
    }).on("error", error => {
        console.log(error);
        callback("error");
    });
}

module.exports = {
    GetImages
};
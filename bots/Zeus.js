const axios = require('axios');
const commonFunctions = require("../functions/CommonFunctions");

const BOT_ID = "62fb859bc91b8aa4003340ec";
const BOT_NAME = "Zeus";
console.time(BOT_NAME);

async function start(){
    let lists;
    await axios.get("https://www.api.azonar.fr/lists").then((res) => {
        lists = res.data;
    })
    let index = 0;
    for (const list of lists) {
        index++;
        let manga;
        await axios.get("https://www.api.azonar.fr/mangas/viaID/" + list.manga_id).then((res) => {
            manga = res.data;
        });
        if (list.status_id === 1){
            await axios.put("https://www.api.azonar.fr/lists/read/" + list.user_id, {
                manga_id: manga._id,
                is_read: true
            });
        }else{
            if (list.current_chapter < manga.chapter_number){
                console.log("Not ok");
                await axios.put("https://www.api.azonar.fr/lists/read/" + list.user_id, {
                    manga_id: manga._id,
                    is_read: false
                });
            }else{
                console.log("ok");
                await axios.put("https://www.api.azonar.fr/lists/read/" + list.user_id, {
                    manga_id: manga._id,
                    is_read: true
                });
            }
        }
        await commonFunctions.updateProgress(BOT_ID, ((parseFloat(index.toString()) / parseFloat(lists.length)) * 100).toFixed(1));
    }
    await commonFunctions.updateProgress(BOT_ID, 100);
    console.timeEnd(BOT_NAME)
    return;
}

module.exports.start = start;
module.exports.BOT_ID = BOT_ID;
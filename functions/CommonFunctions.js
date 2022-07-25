const axios = require('axios');

async function initialize(BOT_ID) {
    /*await axios.put("https://www.api.azonar.fr/bots/progressAndStatus/" + BOT_ID, {
        status: 0,
        progress: 0
    }).then(() => {
        console.log("Bot " + BOT_ID + " : Initialization Completed !");
    });*/

    console.log("Bot " + BOT_ID + " : Initialization Completed !");
}

function updateProgress(BOT_ID, progress) {
    switch (progress) {
        case 100:
            /*axios.put("https://www.api.azonar.fr/bots/progressAndStatus/" + BOT_ID, {
                status: 0,
                progress: 100
            }).then(() => {
                console.log("Bot " + BOT_ID + " : Operation Completed !");
            });*/

            console.log("Bot " + BOT_ID + " : Operation Completed !");
            break;
        default:
            /*axios.put("https://www.api.azonar.fr/bots/progressAndStatus/" + BOT_ID, {
                status: 1,
                progress: progress
            }).then(() => {
                console.log("Bot " + BOT_ID + " : " + progress + "%");
            });*/

            console.log("Bot " + BOT_ID + " : " + progress + "%");
            break;
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) &&
        !isNaN(parseFloat(str))
}

function formatName(name) {
    return name.replace(/[^\w\s]/gi, '').toLowerCase();
}

function formatGenres(genresString) {
    return genresString.toLowerCase().split(", ");
}

function getTypeId(type) {
    let type_id = 0;
    switch (type) {
        case "manga":
            type_id = 1;
            break;
        case "novel":
            type_id = 2;
            break;
        case "manhua":
            type_id = 3;
            break;
        case "manhwa":
            type_id = 4;
            break;
    }
    return type_id;
}

async function addManga(name, synopsis, genres, type_id, chapter_numbers, site_id, site_link, cover_link) {
    if (isNumeric(chapter_numbers)) {
        /*await axios.post("https://www.api.azonar.fr/mangas", {
            name: name,
            synopsis: synopsis,
            genres: genres,
            type_id: type_id,
            chapter_number: chapter_numbers,
            site_id: site_id,
            site_link: site_link,
            cover_link: cover_link
        }).then(() => {
            console.log("New Manga Added : " + name);
        });*/

        console.log("New Manga Added : " + name);
    }
}

async function updateManga(manga_id, chapter_numbers, site_id) {
    if (isNumeric(chapter_numbers)) {
        /*await axios.put("https://www.api.azonar.fr/mangas/chapter/" + manga_id, {
            chapter_number: chapter_numbers,
            site_id: site_id
        }).then(() => {
            console.log("New Chapter Added : " + name);
        });*/

        console.log("New Chapter Added : " + name);
    }
}

function calcProgress(step, total, current, botName) {
    let global_progress
    if (step === 1) {
        const js_progress = ((parseFloat(current) / parseFloat(total)) * 100).toFixed(0);
        global_progress = ((parseFloat(js_progress) / 200) * 100).toFixed(1);
        console.log(botName + "> Progress Japscan : " + current + "/" + total + "      " + js_progress + "%");
    } else if (step === 2) {
        const mo_progress = ((parseFloat(current) / parseFloat(total)) * 100).toFixed(0);
        global_progress = (((parseFloat(mo_progress) + 100) / 200) * 100).toFixed(1);
        console.log(botName + "> Progress Mangas Origines : " + current + "/" + total + "      " + mo_progress + "%");
    }
    console.log(botName + "> Progress : " + global_progress + "%");
    return global_progress;
}

module.exports.initialize = initialize;
module.exports.updateProgress = updateProgress;
module.exports.isNumeric = isNumeric;
module.exports.formatName = formatName;
module.exports.formatGenres = formatGenres;
module.exports.getTypeId = getTypeId;
module.exports.addManga = addManga;
module.exports.updateManga = updateManga;
module.exports.calcProgress = calcProgress;
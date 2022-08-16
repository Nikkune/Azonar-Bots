const axios = require('axios');

async function initialize(BOT_ID) {
    await axios.put("https://www.api.azonar.fr/bots/progressAndStatus/" + BOT_ID, {
        status: 0,
        progress: 0
    }).then(() => {
        console.log("Bot " + BOT_ID + " : Initialization Completed !");
    });

    await console.log("Bot " + BOT_ID + " : Initialization Completed !");
}

function updateProgress(BOT_ID, progress) {
    switch (progress) {
        case 100:
            axios.put("https://www.api.azonar.fr/bots/progressAndStatus/" + BOT_ID, {
                status: 0,
                progress: 100
            }).then(() => {
                console.log("Bot " + BOT_ID + " : Operation Completed !");
            });
            break;
        default:
            axios.put("https://www.api.azonar.fr/bots/progressAndStatus/" + BOT_ID, {
                status: 1,
                progress: progress
            }).then(() => {
                console.log("Bot " + BOT_ID + " > " + progress + "%");
            });
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
    const genresEN = ["action", "alien", "friendship", "love", "art", "martial arts", "adventure", "camping", "fight", "comedy", "kitchen", "detective", "doujinshi", "drama", "ecchi", "fantasy", "fantastic", "gore", "harem", "historical", "horror", "isekai", "video game", "josei", "loli", "magic", "mature", "mecha", "medical", "mystery", "post-apocalyptic", "psychological", "reincarnation", "romance", "school", "seinen", "science fiction", "shojo", "shojo ai", "shonen", "shonen ai", "sport", "supernatural", "survival game", "thriller", "tragedy", "slice of life", "love triangle", "school life", "yaoi", "yuri", "zombie", "none"];
    const genresFR = ["action", "alien", "amitié", "amour", "art", "arts martiaux", "aventure", "camping", "combat", "comédie", "cuisine", "détective", "doujinshi", "drame", "ecchi", "fantaisie", "fantastique", "gore", "harem", "historique", "horreur", "isekai", "jeu vidéo", "joséi", "loli", "magie", "mature", "mécha", "médecine", "mystère", "post-apocalyptique", "psychologique", "réincarnation", "romance", "école", "seinen", "science fiction", "shojo", "shojo aï", "shônen", "shônen aï", "sport", "surnaturel", "jeu de survie", "thriller", "tragédie", "tranche de vie", "triangle amoureux", "vie scolaire", "yaoi", "yuri", "zombie", "aucun"];
    const genres = [];
    const genresToFormat = genresString.toLowerCase().split(", ");
    let x = 0;
    while (x !== genresEN.length){
        if (genresToFormat.includes(genresFR[x]) || genresToFormat.includes(genresEN[x])){
            genres.push(genresEN[x])
        }
        x++;
    }
    if (genres.length === 0){
        genres.push("none");
    }
    return genres;
}

function getTypeId(type) {
    let type_id = 0;
    switch (type.toLowerCase()) {
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
        case "webtoon":
            type_id = 5;
            break;
        case "webcomic":
            type_id = 5;
            break;
        case "bande dessinée":
            type_id = 6;
            break;
    }
    return type_id;
}

async function addManga(name, synopsis, genres, type_id, chapter_numbers, site_id, site_link, cover_link) {
    if (isNumeric(chapter_numbers)) {
        await axios.post("https://www.api.azonar.fr/mangas", {
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
        }).catch((errors) => {
            console.log(errors);
        });
    }
}

async function updateManga(manga_id, name, site_link, chapter_numbers, site_id) {
    if (isNumeric(chapter_numbers)) {
        await axios.put("https://www.api.azonar.fr/mangas/chapter/" + manga_id, {
            site_link: site_link,
            chapter_number: chapter_numbers,
            site_id: site_id
        }).then(() => {
            console.log("New Chapter Added : " + name);
        });
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
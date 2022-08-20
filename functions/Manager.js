const Hermes = require("../bots/Hermes");
const Hestia = require("../bots/Hestia");
const Zeus = require("../bots/Zeus");
const commonFunctions = require("./CommonFunctions");
const axios = require("axios");

async function launch(BOT_ID){
    await commonFunctions.initialize(BOT_ID);
    switch (BOT_ID) {
        case Hermes.BOT_ID:
            await Hermes.start();
            break;
        case Hestia.BOT_ID:
            await Hestia.start();
            break;
        case Zeus.BOT_ID:
            await Zeus.start();
            break;
        default:
            console.error("Manager > Bot Didn't Exist !");
            break;
    }
}

function init() {
    commonFunctions.getBotName(Hestia.BOT_ID).then((name) => {
        axios.put("https://www.api.azonar.fr/bots/progressAndStatus/" + Hestia.BOT_ID, {
            status: 0,
            progress: 0
        }).then(() => {
            console.log("Bot " + name + " > Reinitialization Completed !");
        });
    });
    commonFunctions.getBotName(Zeus.BOT_ID).then((name) => {
        axios.put("https://www.api.azonar.fr/bots/progressAndStatus/" + Zeus.BOT_ID, {
            status: 0,
            progress: 0
        }).then(() => {
            console.log("Bot " + name + " > Reinitialization Completed !");
        });
    });
    commonFunctions.getBotName(Hermes.BOT_ID).then((name) => {
        axios.put("https://www.api.azonar.fr/bots/progressAndStatus/" + Hermes.BOT_ID, {
            status: 0,
            progress: 0
        }).then(() => {
            console.log("Bot " + name + " > Reinitialization Completed !");
        });
    });
    console.log("Manager > Initialization Completed !");
}

module.exports.launch = launch;
module.exports.init = init;
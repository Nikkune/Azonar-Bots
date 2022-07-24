const Hermes = require("../bots/Hermes");
const Hestia = require("../bots/Hestia");
const commonFunctions = require("./CommonFunctions");

async function launch(BOT_ID){
    await commonFunctions.initialize(BOT_ID);
    switch (BOT_ID) {
        case Hermes.BOT_ID:
            await Hermes.start();
            break;
        case Hestia.BOT_ID:
            await Hestia.start();
            break;
        default:
            console.error("Manager > Bot Didn't Exist !");
            break;
    }
}

module.exports.launch = launch;
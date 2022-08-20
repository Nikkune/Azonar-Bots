const Hermes = require('./bots/Hermes');
const Hestia = require('./bots/Hestia');
const Zeus = require("./bots/Zeus");
const Manager = require('./functions/Manager');

const {setPuppeteerOptions} = require('./PuppeteerOptions')

const HermesWaitTime = 1000 * 60 * 60 * 24;
const HestiaWaitTime = 1000 * 60 * 60 * 4;
const ZeusWaitTime = 1000 * 60 * 60;

async function enable() {
    setInterval(async () => {
        await Manager.launch(Hermes.BOT_ID);
    }, HermesWaitTime);
    setInterval(async () => {
        await Manager.launch(Hestia.BOT_ID);
    }, HestiaWaitTime);
    setInterval(async () => {
        await Manager.launch(Zeus.BOT_ID);
    }, ZeusWaitTime);

    await Manager.init();

    await Manager.launch(Hestia.BOT_ID);
    await Manager.launch(Zeus.BOT_ID);
    await Manager.launch(Hermes.BOT_ID);
}

setPuppeteerOptions(false, true);

enable().then(() => console.log("Bots are enabled !"))
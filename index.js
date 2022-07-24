const Hermes = require('./bots/Hermes');
const Hestia = require('./bots/Hestia');
const Manager = require('./functions/Manager');

const {setPuppeteerOptions} = require('./PuppeteerOptions')

const HermesWaitTime = 1000 * 60 * 60 * 24;
const HestiaWaitTime = 1000 * 60 * 60 * 4;

async function enable() {
    setInterval(async () => {
        await Manager.launch(Hermes.BOT_ID);
    }, HermesWaitTime);
    setInterval(async () => {
        await Manager.launch(Hestia.BOT_ID);
    }, HestiaWaitTime);

    await Manager.launch(Hestia.BOT_ID);
    await Manager.launch(Hermes);
}

setPuppeteerOptions(false, false);

enable().then(() => console.log("Bots are enabled !"))
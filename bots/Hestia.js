const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const commonFunctions = require('../functions/CommonFunctions');
const {getPuppeteerOptions} = require("../PuppeteerOptions");

const BOT_ID = "62dc2d48ae6498aeaeaa95b9";
const BOT_NAME = "Hestia";
console.time(BOT_NAME);

puppeteer.use(StealthPlugin());

async function start(){
    // noinspection JSCheckFunctionSignatures
    const browser = await puppeteer.launch(getPuppeteerOptions());
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0);



    await browser.close();
    await commonFunctions.updateProgress(BOT_ID,100);
    console.timeEnd(BOT_NAME);
}

module.exports.start = start;
module.exports.BOT_ID = BOT_ID;
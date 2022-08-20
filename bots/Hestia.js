const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const commonFunctions = require('../functions/CommonFunctions');
const {getPuppeteerOptions} = require("../PuppeteerOptions");

const BOT_ID = "62dc2d48ae6498aeaeaa95b9";
const BOT_NAME = "Hestia";
const Nikkune_ID = "62f253bcc45ec5684430d02e";
console.time(BOT_NAME);

puppeteer.use(StealthPlugin());

async function start() {
    let lists;
    await axios.get("https://www.api.azonar.fr/lists/" + Nikkune_ID).then((res) => {
        lists = res.data;
    })
    let index = 0
    for (const lmanga of lists) {
        index++;
        let manga;
        await axios.get("https://www.api.azonar.fr/mangas/viaID/" + lmanga.manga_id).then((res) => {
            manga = res.data;
        });
        // noinspection JSCheckFunctionSignatures
        const browser = await puppeteer.launch(getPuppeteerOptions());
        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(0);

        await page.goto(manga.site_link);

        let chapter_numbers
        let site_id;
        if (manga.site_link.split("/")[2] === "www.japscan.me") {
            site_id = 1;
            chapter_numbers = await page.$eval("#collapse-1", element => element.firstElementChild.lastElementChild.href);
            chapter_numbers = chapter_numbers.split('/')[5];
            if (!commonFunctions.isNumeric(chapter_numbers))
                chapter_numbers = chapter_numbers.split('-')[1];
        } else if (manga.site_link.split("/")[2] === "mangas-origines.fr") {
            site_id = 2;
            try {
                chapter_numbers = await page.$eval("#manga-chapters-holder", element => element.lastElementChild.firstElementChild.firstElementChild.firstElementChild.getElementsByTagName("a")[0].href.split("/")[5].split("-"));

                if (chapter_numbers.length >= 2)
                    if (commonFunctions.isNumeric(chapter_numbers[2]))
                        chapter_numbers = chapter_numbers[1] + "." + chapter_numbers[2];
                    else
                        chapter_numbers = chapter_numbers[1];
                else
                    chapter_numbers = chapter_numbers[1];
            } catch (e) {
                index++;
                continue;
            }
        }

        if (parseFloat(manga.chapter_number) < parseFloat(chapter_numbers))
            await commonFunctions.updateManga(manga._id, manga.name, manga.site_link, chapter_numbers, site_id);

        if (lmanga.current_chapter < chapter_numbers) {
            await axios.put("https://www.api.azonar.fr/lists/read/" + lmanga.user_id, {
                manga_id: manga._id,
                is_read: false
            });
        } else {
            await axios.put("https://www.api.azonar.fr/lists/read/" + lmanga.user_id, {
                manga_id: manga._id,
                is_read: true
            });
        }
        await browser.close();
        await commonFunctions.updateProgress(BOT_ID, ((parseFloat(index.toString()) / parseFloat(lists.length)) * 100).toFixed(1));
    }
    await commonFunctions.updateProgress(BOT_ID, 100);
    console.timeEnd(BOT_NAME);
}

module.exports.start = start;
module.exports.BOT_ID = BOT_ID;
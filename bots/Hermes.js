const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const commonFunctions = require('../functions/CommonFunctions');
const {getPuppeteerOptions} = require("../PuppeteerOptions");

const BOT_ID = "62dc2c77ae6498aeaeaa95b7";
const BOT_NAME = "Hermes";
console.time(BOT_NAME);

puppeteer.use(StealthPlugin());

let mangas_in_database = [];
let mangas_names = [];
let mangas_ids = {};
let mangas_chapter_numbers = {};

async function loadMangas() {
    await axios.get("https://www.api.azonar.fr/mangas").then((res) => mangas_in_database = res.data);

    if (mangas_in_database.length >> 0) {
        for (const mangaDB of mangas_in_database) {
            mangas_names.push(commonFunctions.formatName(mangaDB.name));
            mangas_ids[commonFunctions.formatName(mangaDB.name)] = mangaDB._id;
            mangas_chapter_numbers[commonFunctions.formatName(mangaDB.name)] = mangaDB.chapter_number;
        }
    }
}

async function start() {
    // noinspection JSCheckFunctionSignatures
    const browser = await puppeteer.launch(getPuppeteerOptions());
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    await loadMangas();

    await page.goto("https://www.japscan.ws/mangas/", {waitUntil: "networkidle0"});
    const page_number = await page.$eval(".pagination.d-flex.justify-content-center", element => element.lastElementChild.firstElementChild.textContent);

    let index_js = 1;
    while (index_js <= page_number) {
        await page.goto("https://www.japscan.ws/mangas/" + index_js, {waitUntil: "networkidle0"});
        const mangas_holder = await page.$$(".d-flex.flex-wrap.m-5 div.p-2");

        for (const mangasHolderElement of mangas_holder) {
            const synopsis_link = await mangasHolderElement.evaluate(element => element.firstElementChild.href);

            // noinspection JSCheckFunctionSignatures
            const browserTwo = await puppeteer.launch(getPuppeteerOptions());
            const pageTwo = await browserTwo.newPage();
            await pageTwo.setDefaultNavigationTimeout(0);

            await pageTwo.goto(synopsis_link, {waitUntil: "networkidle0"});

            const main = await pageTwo.$("#main");
            const infos_holder = await main.$$("div.card div.rounded-0.card-body div.d-flex div.m-2 p.mb-2");

            const typeAndName = await main.evaluate(element => element.firstElementChild.firstElementChild.firstElementChild.textContent);
            const type = typeAndName.split(" ")[0];
            const name = typeAndName.substring(type.length + 1);

            if (!mangas_names.includes(commonFunctions.formatName(name))) {
                const type_id = commonFunctions.getTypeId(type);
                const site_link = synopsis_link;

                const cover_link = await main.evaluate(element => element.firstElementChild.firstElementChild.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild.src);
                const synopsis = await main.evaluate(element => element.firstElementChild.firstElementChild.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.textContent);

                let chapter_numbers = await pageTwo.$eval("#collapse-1", element => element.firstElementChild.lastElementChild.href);
                chapter_numbers = chapter_numbers.split('/')[5];
                if (!commonFunctions.isNumeric(chapter_numbers))
                    chapter_numbers = chapter_numbers.split('-')[1];

                let genres = "";
                for (const infosHolderElement of infos_holder) {
                    genres = await infosHolderElement.evaluate(element => element.innerText)
                    if (genres.startsWith("Genre(s):"))
                        break;
                }
                if (!genres.startsWith("Genre(s):"))
                    genres = "none";
                else
                    genres = genres.substring(10);
                genres = commonFunctions.formatGenres(genres);

                await commonFunctions.addManga(name, synopsis, genres, type_id, chapter_numbers, 1, site_link, cover_link);
            } else {
                const manga_id = mangas_ids[commonFunctions.formatName(name)];

                let chapter_numbers = await pageTwo.$eval("#collapse-1", element => element.firstElementChild.lastElementChild.href);
                chapter_numbers = chapter_numbers.split('/')[5];
                if (!commonFunctions.isNumeric(chapter_numbers))
                    chapter_numbers = chapter_numbers.split('-')[1];

                if (mangas_chapter_numbers[commonFunctions.formatName(name)] !== null) {
                    if (mangas_chapter_numbers[commonFunctions.formatName(name)].toString() !== chapter_numbers)
                        await commonFunctions.updateManga(manga_id, chapter_numbers, 1);
                } else {
                    await commonFunctions.updateManga(manga_id, chapter_numbers, 1);
                }
            }
            await browserTwo.close();
        }
        await commonFunctions.updateProgress(BOT_ID, commonFunctions.calculProgress(1,page_number,index_js,"Hermes"));
        index_js++;
    }
    //TODO MangasOrigines
    //TODO MangasOrigines IS UP

    await browser.close();
    await commonFunctions.updateProgress(BOT_ID, 100);
    console.timeEnd(BOT_NAME);
}

module.exports.start = start;
module.exports.BOT_ID = BOT_ID;
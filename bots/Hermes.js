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

    let index_js = 332;
    while (index_js <= page_number) {
        await page.goto("https://www.japscan.ws/mangas/" + index_js, {waitUntil: "networkidle0"});
        const mangas_holder = await page.$$(".d-flex.flex-wrap.m-5 div.p-2");

        for (const mangasHolderElement of mangas_holder) {
            let err = false;

            const synopsis_link = await mangasHolderElement.evaluate(element => element.firstElementChild.href);

            // noinspection JSCheckFunctionSignatures
            const browserTwo = await puppeteer.launch(getPuppeteerOptions());
            const pageTwo = await browserTwo.newPage();
            await pageTwo.setDefaultNavigationTimeout(0);

            await pageTwo.goto(synopsis_link, {waitUntil: "networkidle0"});

            let main = await pageTwo.$("#main");
            while (main === null) {
                await pageTwo.goto(synopsis_link, {waitUntil: "networkidle0"});
                main = await pageTwo.$("#main");
            }
            const infos_holder = await main.$$("div.card div.rounded-0.card-body div.d-flex div.m-2 p.mb-2").catch((er) => {
                if (er) {
                    err = true
                }
            });

            const typeAndName = await main.evaluate(element => element.firstElementChild.firstElementChild.firstElementChild.textContent);
            const type = typeAndName.split(" ")[0];
            const name = typeAndName.substring(type.length + 1);

            if (!mangas_names.includes(commonFunctions.formatName(name))) {
                const type_id = commonFunctions.getTypeId(type.toLowerCase());
                const site_link = synopsis_link;
                let synopsis;

                console.log(synopsis_link);
                const cover_link = await main.evaluate(element => element.firstElementChild.firstElementChild.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.firstElementChild.src);
                if ((await main.evaluate(element => element.firstElementChild.firstElementChild.lastElementChild.previousElementSibling.textContent)).includes("Synopsis:"))
                    synopsis = await main.evaluate(element => element.firstElementChild.firstElementChild.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.textContent);
                else synopsis = "A Venir..."
                console.log(synopsis);

                let chapter_numbers = await pageTwo.$eval("#collapse-1", element => element.firstElementChild.lastElementChild.href);
                chapter_numbers = chapter_numbers.split('/')[5];
                if (!commonFunctions.isNumeric(chapter_numbers))
                    chapter_numbers = chapter_numbers.split('-')[1];
                console.log(chapter_numbers);

                let genres = "";
                if (!err) {
                    for (const infosHolderElement of infos_holder) {
                        genres = await infosHolderElement.evaluate(element => element.innerText)
                        if (genres.startsWith("Genre(s):"))
                            break;
                    }
                    if (!genres.startsWith("Genre(s):"))
                        genres = "none";
                    else
                        genres = genres.substring(10);
                } else
                    genres = "none";
                genres = commonFunctions.formatGenres(genres);
                console.log(genres);

                await commonFunctions.addManga(name, synopsis, genres, type_id, chapter_numbers, 1, site_link, cover_link);
            } else {
                const manga_id = mangas_ids[commonFunctions.formatName(name)];
                const site_link = synopsis_link;

                let chapter_numbers = await pageTwo.$eval("#collapse-1", element => element.firstElementChild.lastElementChild.href);
                chapter_numbers = chapter_numbers.split('/')[5];
                if (!commonFunctions.isNumeric(chapter_numbers))
                    chapter_numbers = chapter_numbers.split('-')[1];
                if (parseFloat(chapter_numbers) === 0)
                    chapter_numbers = "1";

                if (mangas_chapter_numbers[commonFunctions.formatName(name)] !== null) {
                    if (mangas_chapter_numbers[commonFunctions.formatName(name)].toString() !== chapter_numbers)
                        await commonFunctions.updateManga(manga_id, name, site_link, chapter_numbers, 1);
                } else {
                    await commonFunctions.updateManga(manga_id, name, site_link, chapter_numbers, 1);
                }
            }
            await browserTwo.close();
        }
        await commonFunctions.updateProgress(BOT_ID, commonFunctions.calcProgress(1, page_number, index_js, "Hermes"));
        index_js++;
    }

    await loadMangas();

    let mangasOriginesIsUp = true;

    await page.goto("https://mangas-origines.fr/catalogues/?m_orderby=alphabet", {waitUntil: "networkidle0"});
    await page.waitForSelector(".fc-button.fc-cta-consent.fc-primary-button")
    await page.click(".fc-button.fc-cta-consent.fc-primary-button");

    const click_number = Math.ceil((await page.$eval("div.c-page__content div.tab-wrap", element => element.firstElementChild.firstElementChild.innerText)).match(/\d+/g).join('') / 12);

    let click = 0;
    while (click < click_number) {
        await page.waitForTimeout(2000);
        const button = await page.$('#navigation-ajax');
        mangasOriginesIsUp = click >= 20;
        if (!await button.evaluate(element => element.classList.contains("show-loading"))) {
            try {
                await page.click('#navigation-ajax');
                click++;
                console.log(click);
            } catch (e) {
                click = click_number;
            }
        } else {
            click = click_number;
        }
    }

    if (mangasOriginesIsUp) {
        const all_mangas_infos = await page.$$(".item-summary");

        let manga = 0;
        const number_of_manga = all_mangas_infos.length + manga;

        for (const manga_info of all_mangas_infos) {
            let err = false;

            const synopsis_link = await manga_info.evaluate(element => element.firstElementChild.firstElementChild.lastElementChild.href);

            console.log(synopsis_link);
            // noinspection JSCheckFunctionSignatures
            const browserTwo = await puppeteer.launch(getPuppeteerOptions());
            const pageTwo = await browserTwo.newPage();
            await pageTwo.setDefaultNavigationTimeout(0);

            await pageTwo.goto(synopsis_link, {waitUntil: "networkidle2"});
            await pageTwo.waitForSelector(".fc-button.fc-cta-consent.fc-primary-button").catch((e) => {
                if (e) {
                    err = true
                }
            });
            if (err) {
                manga++;
                await browserTwo.close()
                continue;
            }

            await pageTwo.click(".fc-button.fc-cta-consent.fc-primary-button");

            const name = await pageTwo.$eval('div.post-title', element => element.lastElementChild.innerText);

            if (!mangas_names.includes(commonFunctions.formatName(name))) {
                const main = await pageTwo.$('div.tab-summary');
                const infos_holder = await main.$$("div.summary_content_wrap div.summary_content div.post-content div.post-content_item");

                const site_link = synopsis_link;

                const synopsis = await main.evaluate(element => element.lastElementChild.firstElementChild.firstElementChild.lastElementChild.firstElementChild.innerText);
                const cover_link = await pageTwo.$eval(".tab-summary", element => element.firstElementChild.firstElementChild.firstElementChild.src);

                let genres = "";
                for (const infosHolderElement of infos_holder) {
                    genres = await infosHolderElement.evaluate(element => element.firstElementChild.firstElementChild.innerText);
                    if (genres.startsWith(" Genre(s)")) {
                        genres = await infosHolderElement.evaluate(element => element.lastElementChild.firstElementChild.innerText);
                        break;
                    } else genres = "none";
                }
                genres = commonFunctions.formatGenres(genres);
                if (genres.includes("hentai")) {
                    manga++;
                    await browserTwo.close();
                    continue;
                }

                const exists = await pageTwo.$eval("#manga-chapters-holder", () => true).catch(() => false);
                let chapter_numbers = 0;
                if (exists) {
                    try {
                        chapter_numbers = await pageTwo.$eval("#manga-chapters-holder", element => element.lastElementChild.firstElementChild.firstElementChild.firstElementChild.getElementsByTagName("a")[0].href.split("/")[5].split("-"));

                        if (chapter_numbers.length >= 2)
                            if (commonFunctions.isNumeric(chapter_numbers[2]))
                                chapter_numbers = chapter_numbers[1] + "." + chapter_numbers[2];
                            else
                                chapter_numbers = chapter_numbers[1];
                        else
                            chapter_numbers = chapter_numbers[1];
                    } catch (e) {
                        manga++;
                        await pageTwo.close();
                        await browserTwo.close();
                        continue;
                    }
                } else {
                    manga++;
                    await browserTwo.close();
                    continue;
                }

                let type = "";
                let type_id = 0;
                for (const infosHolderElement of infos_holder) {
                    type = await infosHolderElement.evaluate(element => element.firstElementChild.firstElementChild.innerText);
                    if (type.startsWith(" Type")) {
                        type = (await infosHolderElement.evaluate(element => element.lastElementChild.innerText)).toLowerCase().split(", ");
                        type_id = commonFunctions.getTypeId(type.toLowerCase());
                        if (type_id === 0)
                            type_id = 1;
                    } else type = "none";
                }

                await commonFunctions.addManga(name, synopsis, genres, type_id, chapter_numbers, 2, site_link, cover_link);
            } else {
                const manga_id = mangas_ids[commonFunctions.formatName(name)];
                const site_link = synopsis_link;

                const exists = await pageTwo.$eval("#manga-chapters-holder", () => true).catch(() => false);

                let new_chapter_number = 0;
                if (exists) {
                    try {
                        new_chapter_number = await pageTwo.$eval("#manga-chapters-holder", element => element.lastElementChild.firstElementChild.firstElementChild.firstElementChild.getElementsByTagName("a")[0].href.split("/")[5].split("-"));

                        if (new_chapter_number.length >= 2)
                            if (commonFunctions.isNumeric(new_chapter_number[2]))
                                new_chapter_number = new_chapter_number[1] + "." + new_chapter_number[2];
                            else
                                new_chapter_number = new_chapter_number[1];
                        else
                            new_chapter_number = new_chapter_number[1];
                    } catch (e) {
                        manga++;
                        await pageTwo.close();
                        await browserTwo.close();
                    }
                } else
                    new_chapter_number = 1;

                if (mangas_chapter_numbers[commonFunctions.formatName(name)] !== null) {
                    if (mangas_chapter_numbers[commonFunctions.formatName(name)].toString() !== new_chapter_number)
                        await commonFunctions.updateManga(manga_id, name, site_link, new_chapter_number, 2);
                } else {
                    await commonFunctions.updateManga(manga_id, name, site_link, new_chapter_number, 2);
                }
            }
            await browserTwo.close();
            await commonFunctions.updateProgress(BOT_ID, commonFunctions.calcProgress(2, number_of_manga, manga, "Hermes"));
            manga++;
        }
    }

    await browser.close();
    await commonFunctions.updateProgress(BOT_ID, 100);
    console.timeEnd(BOT_NAME);
}

start()

module.exports.start = start;
module.exports.BOT_ID = BOT_ID;
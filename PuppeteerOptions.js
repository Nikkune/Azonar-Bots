let puppeteerOptions = {
    headless: true
}

function setPuppeteerOptions(linux, headless) {
    if (linux) {
        puppeteerOptions = {
            headless: headless,
            executablePath: '/usr/bin/chromium'
        }
    } else {
        puppeteerOptions = {
            headless: headless
        }
    }
}

function getPuppeteerOptions() {
    return puppeteerOptions;
}

module.exports.setPuppeteerOptions = setPuppeteerOptions;
module.exports.getPuppeteerOptions = getPuppeteerOptions;
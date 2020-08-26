const puppeteer = require('puppeteer');

const config = require('./config.json')

async function start() {
    console.log('Starting...')

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.airline4.net/');

    // LOGIN
    await page.click('*[data-target="#loginModal"]')
    await page.type('#lEmail', config.auth.email)
    await page.type('#lPass', config.auth.password)
    await page.click('#btnLogin')

    await sleep(10000);

    // IN-GAME
    await page.click('*[style="top:125px;"]')

    console.log('Starting to check!')

    interval = setInterval(async () => {

        var fuelPrice = await page.evaluate(() => document.querySelector("#fuelMain > div > div:nth-child(1) > span.text-danger > b").textContent)
        var fuelPriceReplace = fuelPrice.replace('$ ', '').replace(',', '')
        var capacityMissing = await page.evaluate(() => document.querySelector("#remCapacity").textContent)
        var capacityMissingReplace = capacityMissing.replace(',', '')

        await page.type('#amountInput', capacityMissingReplace)

        if (capacityMissingReplace <= 0) {
            console.log('Your tank is full, closing the program!')
            clearInterval(interval)
            return await browser.close()
        }

        if (fuelPriceReplace <= config.price) {
            await page.click("#fuelMain > div > div.col-sm-12.p-2 > div > button.btn.btn-danger.btn-xs.btn-block.w-100")
            console.log(`${capacityMissing}Lbs of fuel was purchased for $${fuelPriceReplace}! (Missing Capacity: ${capacityMissing}Lbs | Price: ${fuelPrice})`)
            clearInterval(interval)
            return await browser.close()
        } else {
            console.log(`Waiting for the price to come down! (Current Price: $${fuelPriceReplace}, Price set: $${config.price})`);
        }

    }, config.check_interval_in_minutes * 60000);

}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

start();
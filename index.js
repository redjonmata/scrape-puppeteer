const puppeteer = require('puppeteer');

(async function main() {
    try {
        var arr = []
        const browser = await puppeteer.launch();
        const [page] = await browser.pages();
        await page.goto('https://www.shqiperia.com/shqiperia/qytete');

        const missingCities = ['Pogradeci', 'Tirana', 'Peshkopia', 'Gjakova', 'Prishtina', 'Prizreni', 'Tetova', 'Kurbini']

        const elementHandles = await page.$x('//div[@class="qytete"]//li//h1/a');
        const propertyJsHandles = await Promise.all(
            elementHandles.map(handle => handle.getProperty('href'))
        );
        const hrefs = await Promise.all(
            propertyJsHandles.map(handle => handle.jsonValue())
        );

        for (let i = 0; i < hrefs.length; i++) {
            const url = hrefs[i];
            await page.goto(`${url}`);

            try {
                const image = await page.$eval(('#qender > div.renditje_artikull > a > img[src]'),node => node.src)
                const title = await page.$eval(('#qender > div.renditje_artikull > h1'),node => node.textContent)

                var completeDescription = '';
                if (missingCities.includes(title)) {
                    completeDescription = await page.$eval(('#qender > div.renditje_artikull > div:nth-child(4)'), node => node.textContent)
                } else {
                    const descriptions = await page.$x('//*[@id="qender"]/div[1]/p[.//text()]')
                    const descriptionss = await Promise.all(
                        descriptions.map(handle => handle.getProperty('innerText'))
                    )

                    const paragraphs = await Promise.all(
                        descriptionss.map(handle => handle.jsonValue())
                    )

                    paragraphs.forEach(item => {
                        completeDescription  = completeDescription + " " + item
                    })
                }

                var obj = {}

                obj['image'] = image
                obj['title'] = title
                obj['description'] = completeDescription

                arr.push(obj)

            } catch (err) {
                console.log(err)
            }
        }

        console.log(JSON.stringify(arr))
        await browser.close();
    } catch (err) {
        console.error(err);
    }
})();
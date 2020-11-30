const Client = require("./classes").Client;

let today = new Date();
let time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();

let mySitemap = `{"_id":"${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"a","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
let token = 'kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8';

(async () => {

    let scrapingTest = new Client(token);
    let sitemapInfo = await scrapingTest.createSitemap(mySitemap);
    let scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfo.data.id)

    let doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.data.id);

    while(doingScraping.data.status !== "finished"){

        doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.data.id);
        console.log(doingScraping.data.status)
        await sleep(2000)

    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    let scrapedJson = await scrapingTest.getJson(scrapingJobInfo.data.id);

    let strLines = scrapedJson.split("\n");
    let currentHighest = [0,0];  // index 0 -> real money , index 1 -> index of highest
    let current = 0;

    for(let i = 0; i < strLines.length - 1; i++){
        current = parseInt(JSON.parse(strLines[i]).product_price.replace("$", ""));

        if (current > currentHighest[0]){
            currentHighest[0] = current;
            currentHighest[1] = i;
        }
    };

    console.log(`the most expensive product is ${JSON.parse(strLines[currentHighest[1]]).product_name} and its price is ${JSON.parse(strLines[currentHighest[1]]).product_price}`);

})();

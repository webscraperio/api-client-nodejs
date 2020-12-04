import {Client} from "./apiClientClasses";

const today = new Date();
const time: string = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;

const mySitemap: string = `{"_id":"${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"a","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
const token: string = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";

(async () => {

	const scrapingTest = new Client(token);

	const sitemapInfoResonse = await scrapingTest.createSitemap(mySitemap);
	const scrapingJobInfoResponse = await scrapingTest.createScrapingJob(sitemapInfoResonse.id);
	let doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfoResponse.id);
	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
	while (doingScraping.status !== "finished") {

		doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfoResponse.id);
		// tslint:disable-next-line:no-console
		console.log(doingScraping.status);
		await sleep(2000);

	}
	const scrapedJsonResponse = await scrapingTest.getJson(scrapingJobInfoResponse.id);

	const strLines = scrapedJsonResponse.getJobInfo.split("\n");
	const currentHighest = [0, 0];  // index 0 -> real money , index 1 -> index of highest
	let current: number = 0;

	for (let i = 0; i < strLines.length - 1; i++) {
		// tslint:disable-next-line:radix
		current = parseInt(JSON.parse(strLines[i]).product_price.replace("$", ""));

		if (current > currentHighest[0]) {
			currentHighest[0] = current;
			currentHighest[1] = i;
		}
	}

	// tslint:disable-next-line:no-console
	console.log(`the most expensive product is ${JSON.parse(strLines[currentHighest[1]]).product_name} and its price is ${JSON.parse(strLines[currentHighest[1]]).product_price}`);

})();

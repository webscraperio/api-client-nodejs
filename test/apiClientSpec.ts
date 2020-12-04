import {expect} from "chai";
import {Client} from "../src/apiClientClasses";
import {ICreateScrapingJobResponse} from "../src/interfaces/ICreateScrapingJobResponse";
import {ICreateSiteMapResponse} from "../src/interfaces/ICreateSiteMapResponse";
import {IGetScrapingJobResponse} from "../src/interfaces/IGetScrapingJobResponse";
import {IGetJsonResponse} from "../src/interfaces/IGetJsonResponse";

const today = new Date();
const time: string = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;

const mySitemap = `{"_id":"${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"a","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
const token = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";

let sitemapInfoData: ICreateSiteMapResponse;
let scrapingJobInfo: ICreateScrapingJobResponse;
let doingScraping: IGetScrapingJobResponse;
let scrapedJson: IGetJsonResponse;

const scrapingTest = new Client(token);

describe("API Client", () => {

	it("should import a sitemap", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		expect(sitemapInfoData.id).to.not.be.undefined;

	});

	it("should create a scraping job", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		expect(scrapingJobInfo.id).to.not.be.undefined;

	});

	it("should wait for the scraping job to end", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
		doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
		while (doingScraping.status !== "finished") {
			doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(2000);
		}
		expect(doingScraping.status).to.not.be.undefined;
		expect(doingScraping.status).to.equal("finished");

	});
	/*
		it("gets scraping job", async () => {
			doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			expect(doingScraping.status).to.not.be.undefined;
		});
	*/
	it("should get scraped json", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
		doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
		while (doingScraping.status !== "finished") {
			doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(2000);
		}
		scrapedJson = await scrapingTest.getJson(scrapingJobInfo.id);
		expect(scrapedJson).to.not.be.undefined;
	});
	/*
		it("should get the most valuable laptop", () => {

			const strLines: string[] = scrapedJson.getJobInfo.split("\n"); // can not read "split"
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
			expect(currentHighest[0]).to.be.equal(1799.00);
		});
	*/
});

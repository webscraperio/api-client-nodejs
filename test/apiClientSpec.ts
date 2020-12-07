import {expect} from "chai";
import {Client} from "../src/apiClientClasses";
import {sleep} from "./sleepFunction";
import {ICreateScrapingJobResponse} from "../src/interfaces/ICreateScrapingJobResponse";
import {ICreateSiteMapResponse} from "../src/interfaces/ICreateSiteMapResponse";
import {IGetScrapingJobResponse} from "../src/interfaces/IGetScrapingJobResponse";
import {IGetJsonResponse} from "../src/interfaces/IGetJsonResponse";
import {IDeleteSitemap} from "../src/interfaces/IDeleteSitemap";

const token = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";

let mySitemap: string;
let sitemapInfoData: ICreateSiteMapResponse;
let scrapingJobInfo: ICreateScrapingJobResponse;
let doingScraping: IGetScrapingJobResponse;
let scrapedJson: IGetJsonResponse;
let deleteSitemap: IDeleteSitemap;

describe("API Client", () => {

	beforeEach(() => {
		const time = Date.now();
		mySitemap = `{"_id":"${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"a","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
	});

	afterEach(async () => {
		const scrapingTest = new Client(token);
		deleteSitemap = await scrapingTest.deleteSitemap(sitemapInfoData.id);
		expect(deleteSitemap.success).to.be.equal(true);
	});

	it("should import a sitemap", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		expect(sitemapInfoData.id).to.not.be.undefined;
	});

	it("should create a scraping job", async () => {
		const scrapingTest = new Client(token);

		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		expect(scrapingJobInfo.id).to.not.be.undefined;
	});

	it("should wait for the scraping job to end", async () => {
		const scrapingTest = new Client(token);

		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);

		doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && doingScraping.status !== "finished") {
			doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(5000);
		}

		expect(doingScraping.status).to.not.be.undefined;
		expect(doingScraping.status).to.equal("finished");
	});

	it("should get scraped json", async () => {
		const scrapingTest = new Client(token);

		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.id);

		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && doingScraping.status !== "finished") {
			doingScraping = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(5000);
		}
		scrapedJson = await scrapingTest.getJson(scrapingJobInfo.id);
		expect(scrapedJson).to.not.be.undefined;
	});

});

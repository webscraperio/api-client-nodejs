import {expect} from "chai";
import {Client} from "../src/apiClientClasses";
import {sleep} from "./sleepFunction";
import fs = require("fs");
import {ICreateScrapingJobResponse} from "../src/interfaces/ICreateScrapingJobResponse";
import {ICreateSitemapResponse} from "../src/interfaces/ICreateSitemapResponse";
import {IGetScrapingJobResponse} from "../src/interfaces/IGetScrapingJobResponse";
import {IGetSitemapResponse} from "../src/interfaces/IGetSitemapResponse";
import {IGetAccountInfoResponse} from "../src/interfaces/IGetAccountInfoResponse";
import {IGetSitemapsResponse} from "../src/interfaces/IGetSitemapsResponse";
import {IGetScrapingJobsResponse} from "../src/interfaces/IGetScrapingJobsResponse";
import {IGetProblematicUrlsResponse} from "../src/interfaces/IGetProblematicUrlsResponse";

const token = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";
const scrapingTest = new Client(token);
let mySitemap: string;
let sitemapInfoData: ICreateSitemapResponse;

describe("API Client", () => {

	beforeEach(() => {
		const time = Date.now();
		mySitemap = `{"_id":"${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"abc","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
	});

	afterEach(async () => {
		if (sitemapInfoData) {
			const deleteSitemapInfo: string = await scrapingTest.deleteSitemap(sitemapInfoData.id);
			expect(deleteSitemapInfo).to.be.equal("ok");
		}
		sitemapInfoData = undefined;
	});

	it("should create a sitemap", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		expect(sitemapInfoData.id).to.not.be.undefined;
	});

	it("should get a sitemap", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const getSitemapInfo: IGetSitemapResponse = await scrapingTest.getSitemap(sitemapInfoData.id);
		expect(getSitemapInfo.id).to.not.be.undefined;
	});

	it("should get sitemaps", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const sitemaps:IGetSitemapsResponse[] = await scrapingTest.getSitemaps(); // optional param. page(def -> 1)
		expect(sitemaps.length).to.be.greaterThan(0);
		expect(sitemaps.find(e => e.id === sitemapInfoData.id)).to.be.ok;
	});

	it("should update the sitemap", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const updateSitemapInfo: string = await scrapingTest.updateSitemap(sitemapInfoData.id, mySitemap);
		expect(updateSitemapInfo).to.equal("ok");
	});

	it("should delete the sitemap", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const deleteSitemapInfo: string = await scrapingTest.deleteSitemap(sitemapInfoData.id);
		expect(deleteSitemapInfo).to.equal("ok");
		sitemapInfoData = undefined;
	});

	it("should create a scraping job", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const scrapingJobInfo: ICreateScrapingJobResponse = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		expect(scrapingJobInfo.id).to.not.be.undefined;
	});

	it("should get a scraping job", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const scrapingJobInfo: ICreateScrapingJobResponse = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		const getScrapingJobInfo: IGetScrapingJobResponse = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
		expect(getScrapingJobInfo.id).to.equal(scrapingJobInfo.id);
	});

	it("should get a scraping job ENDED", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const scrapingJobInfo: ICreateScrapingJobResponse = await scrapingTest.createScrapingJob(sitemapInfoData.id);

		let getScrapingJobInfo: IGetScrapingJobResponse = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobInfo.status !== "finished") {
			getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(2000);
		}

		expect(getScrapingJobInfo.status).to.not.be.undefined;
		expect(getScrapingJobInfo.status).to.equal("finished");
	});

	it("should get scraping jobs", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const scrapingJobInfo: ICreateScrapingJobResponse = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		const scrapingJobs:IGetScrapingJobsResponse[] = await scrapingTest.getScrapingJobs(); // optional param. sitemapId, page(default -> 1)
		expect(scrapingJobs.length).to.be.greaterThan(0);
		expect(scrapingJobs.find(e => e.id === scrapingJobInfo.id)).to.be.ok;
	});

	it("should download scraped data in json format", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const scrapingJobInfo: ICreateScrapingJobResponse = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		let getScrapingJobInfo: IGetScrapingJobResponse = await scrapingTest.getScrapingJob(scrapingJobInfo.id);

		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobInfo.status !== "finished") {
			getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(5000);
		}

		const outputfile: string = "outputfile.json";

		await scrapingTest.getJSON(scrapingJobInfo.id, outputfile);
		expect(fs.existsSync(`src/tmp/${outputfile}`)).to.be.ok;
		expect(fs.readFileSync(`src/tmp/${outputfile}`)).to.not.be.undefined;
		fs.unlinkSync(`src/tmp/${outputfile}`);
		expect(fs.existsSync(`src/tmp/${outputfile}`)).to.not.be.true;
	});

	it("should download scraped data in CSV format", async () => {

		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const scrapingJobInfo: ICreateScrapingJobResponse = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		let getScrapingJobInfo: IGetScrapingJobResponse = await scrapingTest.getScrapingJob(scrapingJobInfo.id);

		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobInfo.status !== "finished") {
			getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(5000);
		}

		const outputfile: string = "outputfile.csv";

		await scrapingTest.getCSV(scrapingJobInfo.id, outputfile);
		expect(fs.existsSync(`src/tmp/${outputfile}`)).to.be.ok;
		expect(fs.readFileSync(`src/tmp/${outputfile}`)).to.not.be.undefined;
		fs.unlinkSync(`src/tmp/${outputfile}`);
		expect(fs.existsSync(`src/tmp/${outputfile}`)).to.not.be.true;
	});

	it("should get scraping job problematic Urls", async () => {
		const time = Date.now();
		const problematicSitemap: string = `{
			"_id":"${time}",
			"startUrl":[
				"https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
				"https://webscraper.io/test-sites/e-commerce/static/computers/tablets"
			],
			"selectors":[
				{
					"id":"selector-test",
					"type":"SelectorText",
					"parentSelectors":["_root"],
					"selector":"body:contains(\\"Computers / Tablets\\") .page-header",
					"multiple":true,
					"regex":"",
					"delay":0
				}
			]
		}`;

		sitemapInfoData = await scrapingTest.createSitemap(problematicSitemap);
		const scrapingJobInfo: ICreateScrapingJobResponse = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		let getScrapingJobInfo: IGetScrapingJobResponse = await scrapingTest.getScrapingJob(scrapingJobInfo.id);

		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobInfo.status !== "shelved") {
			getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(5000);
		}

		const problematicUrls: IGetProblematicUrlsResponse[] = await scrapingTest.getProblematicUrls(3291935,1); // scraping job id - 3291935
		expect(problematicUrls.length).to.be.greaterThan(0);
	});

	it("should delete the scraping job", async () => {
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		const scrapingJobInfo: ICreateScrapingJobResponse = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		const deleteScrapingJob: string = await scrapingTest.deleteScrapingJob(scrapingJobInfo.id);
		expect(deleteScrapingJob).to.equal("ok");
	});

	it("should return account info", async () => {
		const accountInfo: IGetAccountInfoResponse = await scrapingTest.getAccountInfo();
		expect(accountInfo.email).to.not.be.undefined;
	});
});

import {expect} from "chai";
import {Client} from "../../src/Client";
import {ICreateSitemapResponse} from "../../src/interfaces/ICreateSitemapResponse";
import {IGetSitemapResponse} from "../../src/interfaces/IGetSitemapResponse";
import {ICreateScrapingJobResponse} from "../../src/interfaces/ICreateScrapingJobResponse";
import {IGetScrapingJobResponse} from "../../src/interfaces/IGetScrapingJobResponse";
import {IGetAccountInfoResponse} from "../../src/interfaces/IGetAccountInfoResponse";
import {IScrapingJobConfig} from "../../src/interfaces/IScrapingJobConfig";
import {driver} from "../../src/driverEnum";
import {sleep} from "../../src/Sleep";
import {IGetProblematicUrlsResponse} from "../../src/interfaces/IGetProblematicUrlsResponse";
import fs = require("fs");

const apiToken: string = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";

const client = new Client({
	token: apiToken,
	useBackoffSleep: true,
});

let sitemaps: ICreateSitemapResponse[] = [];
let scrapingJobs: ICreateScrapingJobResponse[] = [];

// create directory
if (!fs.existsSync("./data")) {
	fs.mkdirSync("./data");
}

async function createSitemap(): Promise<void> {

	const sitemap = `{"_id":"api-test-${Date.now()}","startUrl":["https://webscraper.io/test-sites/e-commerce/static/computers/tablets"],"selectors":[{"id":"selector-test","parentSelectors":["_root"],"type":"SelectorText","selector":"body:contains(\\"Computers / Tablets\\") .page-header","multiple":false,"delay":0,"regex":""}]}`;
	const response: ICreateSitemapResponse = await client.createSitemap(sitemap);
	sitemaps.push(response);
}

async function createScrapingJob(withFailingUrl: boolean = false): Promise<void> {

	await createSitemap();
	const scrapingJobConfig: IScrapingJobConfig = {
		sitemap_id: sitemaps[0].id,
		driver: driver.fulljs,
		page_load_delay: 2000,
		request_interval: 2000,
		proxy: 1,
	};

	if (withFailingUrl) {
		scrapingJobConfig.start_urls = [
			"https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
			"https://webscraper.io/test-sites/e-commerce/static/computers/tablets",
		];
	}

	const response = await client.createScrapingJob(scrapingJobConfig);
	scrapingJobs.push(response);
}

describe("API Client", () => {

	afterEach(async () => {

		for (const value of scrapingJobs) {
			await client.deleteScrapingJob(value.id);
		}
		scrapingJobs = [];

		for (const value of sitemaps) {
			await client.deleteSitemap(value.id);
		}
		sitemaps = [];
	});

	it("should create a sitemap", async () => {

		const sitemap = `{"_id":"api-test-${Date.now()}","startUrl":["https://webscraper.io/"],"selectors":[{"id":"product_name","type":"SelectorText","parentSelectors":["_root"],"selector":"abc","multiple":false,"regex":"","delay":0}]}`;
		const response: ICreateSitemapResponse = await client.createSitemap(sitemap);
		sitemaps.push(response);
		expect(response.id).to.not.be.undefined;
	});

	it("should get a sitemap", async () => {

		await createSitemap();
		const getSitemapResponse: IGetSitemapResponse = await client.getSitemap(sitemaps[0].id);
		expect(getSitemapResponse.id).to.be.equal(sitemaps[0].id);
		expect(getSitemapResponse.name).to.not.be.undefined;
		expect(getSitemapResponse.sitemap).to.not.be.undefined;
	});

	it("should get sitemaps", async () => {

		await createSitemap();
		await createSitemap();
		const iterator = await client.getSitemaps();
		const allSitemaps = [];
		for await(const sitemap of iterator) {
			allSitemaps.push(sitemap);
		}
		expect(allSitemaps.length).to.be.greaterThan(1);
	});

	it("should update the sitemap", async () => {

		await createSitemap();
		const newSitemap = `{"_id":"api-test-${Date.now()}","startUrl":["https://webscraper.io/"],"selectors":[{"id":"product_name","type":"SelectorText","parentSelectors":["_root"],"selector":"abc","multiple":false,"regex":"","delay":0}]}`;
		const updateSitemapResponse: string = await client.updateSitemap(sitemaps[0].id, newSitemap);
		expect(updateSitemapResponse).to.be.equal("ok");
	});

	it("should delete the sitemap", async () => {

		await createSitemap();
		const deleteSitemapResponse: string = await client.deleteSitemap(sitemaps[0].id);
		expect(deleteSitemapResponse).to.be.equal("ok");
		sitemaps = [];
	});

	it("should create a scraping job", async () => {

		await createSitemap();
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: sitemaps[0].id,
			driver: driver.fulljs,
			page_load_delay: 2000,
			request_interval: 2000,
			proxy: 1,
		};
		const createScrapingJobResponse = await client.createScrapingJob(scrapingJobConfig);
		expect(createScrapingJobResponse.id).to.not.be.undefined;
	});

	it("should get a scraping job", async () => {

		await createScrapingJob();
		const getScrapingJobResponse: IGetScrapingJobResponse = await client.getScrapingJob(scrapingJobs[0].id);
		expect(getScrapingJobResponse.id).to.equal(scrapingJobs[0].id);
		expect(getScrapingJobResponse.sitemap_id).to.equal(sitemaps[0].id);
		expect(getScrapingJobResponse.test_run).to.equal(0);
		expect(getScrapingJobResponse.sitemap_name).to.not.be.undefined;
		expect(getScrapingJobResponse.request_interval).to.equal(2000);
		expect(getScrapingJobResponse.page_load_delay).to.equal(2000);
		expect(getScrapingJobResponse.driver).to.equal("fulljs");
		expect(getScrapingJobResponse.scheduled).to.equal(0);
	});

	it("should get scraping jobs", async () => {

		await createScrapingJob();
		await createScrapingJob();
		const iterator = await client.getScrapingJobs();
		const allScrapingJobs = [];
		for await(const record of iterator) {
			allScrapingJobs.push(record);
		}
		expect(allScrapingJobs.length).to.be.greaterThan(1);
	});

	it("should get scraping jobs from specific sitemap", async () => {

		await createScrapingJob();
		const iterator = await client.getScrapingJobs({
			sitemap_id: sitemaps[0].id,
		});
		const allScrapingJobs = [];
		for await(const record of iterator) {
			allScrapingJobs.push(record);
		}
		expect(allScrapingJobs[0].id).to.be.equal(scrapingJobs[0].id);
		expect(allScrapingJobs.length).to.be.equal(1);
	});

	it.skip("should download scraped data in json format", async () => {

		const outputFile: string = "./data/outputfile.json";
		await createScrapingJob();
		let getScrapingJob: IGetScrapingJobResponse = await client.getScrapingJob(scrapingJobs[0].id);

		while (getScrapingJob.status !== "finished") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJobs[0].id);
		}

		await client.downloadScrapingJobJSON(scrapingJobs[0].id, outputFile);
		expect(fs.existsSync(outputFile)).to.be.ok;
		fs.unlinkSync(outputFile);
		expect(fs.existsSync(outputFile)).to.not.be.true;
	});

	it.skip("should download scraped data in CSV format", async () => {

		const outputFile: string = "./data/outputfile.csv";
		await createScrapingJob();
		let getScrapingJob: IGetScrapingJobResponse = await client.getScrapingJob(scrapingJobs[0].id);

		while (getScrapingJob.status !== "finished") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJobs[0].id);
		}

		await client.downloadScrapingJobCSV(scrapingJobs[0].id, outputFile);
		expect(fs.existsSync(outputFile)).to.be.ok;
		fs.unlinkSync(outputFile);
		expect(fs.existsSync(outputFile)).to.not.be.true;
	});

	it.skip("should get scraping job problematic Urls", async () => {

		await createScrapingJob(true);

		let getScrapingJob: IGetScrapingJobResponse = await client.getScrapingJob(scrapingJobs[0].id);
		while (getScrapingJob.status !== "shelved") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJobs[0].id);
		}

		const iterator = await client.getProblematicUrls(scrapingJobs[0].id);
		const problematicUrls: IGetProblematicUrlsResponse[] = [];

		for await(const record of iterator) {
			problematicUrls.push(record);
		}

		expect(problematicUrls).to.be.deep.equal([{
			url: "https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
			type: "empty",
		}]);
		scrapingJobs = [];
	});

	it("should delete the scraping job", async () => {

		await createScrapingJob();
		const deleteScrapingJobResponse: string = await client.deleteScrapingJob(scrapingJobs[0].id);
		expect(deleteScrapingJobResponse).to.equal("ok");
		scrapingJobs = [];
	});

	it("should return account info", async () => {

		const accountInfoResponse: IGetAccountInfoResponse = await client.getAccountInfo();
		expect(accountInfoResponse.page_credits).to.be.greaterThan(0);
	});
});

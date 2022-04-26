import {expect} from "chai";
import {Client} from "../../src/Client";
import {JsonReader} from "../../src/reader/JsonReader";
import {ICreateSitemapResponse} from "../../src/interfaces/ICreateSitemapResponse";
import {ICreateScrapingJobResponse} from "../../src/interfaces/ICreateScrapingJobResponse";
import {IScrapingJobConfig} from "../../src/interfaces/IScrapingJobConfig";
import {driver} from "../../src/driverEnum";
import {sleep} from "../../src/Sleep";
import fs = require("fs");
import {IGetProblematicUrlsResponse} from "../../src/interfaces/IGetProblematicUrlsResponse";

const apiToken: string = "YOUR_API_TOKEN";

const client = new Client({
	token: apiToken,
	useBackoffSleep: true,
});

const schedulerConfig = {
	"cron_minute": "*/10",
	"cron_hour": "*",
	"cron_day": "*",
	"cron_month": "*",
	"cron_weekday": "*",
	"request_interval": 2000,
	"page_load_delay": 2000,
	"cron_timezone": "Europe/Riga",
	"driver": "fast",
	"proxy": 0,
};

let sitemaps: ICreateSitemapResponse[] = [];
let scrapingJobs: ICreateScrapingJobResponse[] = [];

async function createSitemap(): Promise<ICreateSitemapResponse> {

	const sitemap = `{"_id":"api-test-${Date.now()}","startUrl":["https://webscraper.io/test-sites/e-commerce/static/computers/tablets"],"selectors":[{"id":"selector-test","parentSelectors":["_root"],"type":"SelectorText","selector":"body:contains(\\"Computers / Tablets\\") .page-header","multiple":true,"delay":0,"regex":""}]}`;
	const sitemapData = await client.createSitemap(sitemap);
	sitemaps.push(sitemapData);

	return sitemapData;
}

async function createScrapingJob(withFailingUrl: boolean = false): Promise<ICreateScrapingJobResponse> {

	await createSitemap();
	const scrapingJobConfig: IScrapingJobConfig = {
		sitemap_id: sitemaps[sitemaps.length - 1].id,
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
	return response;
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

		const sitemap = `{"_id":"api-test-${Date.now()}","startUrl":["https://webscraper.io/"],"selectors":[{"id":"product_name","type":"SelectorText","parentSelectors":["_root"],"selector":"abc","multiple":true,"regex":"","delay":0}]}`;
		const response = await client.createSitemap(sitemap);
		sitemaps.push(response);
		expect(response.id).to.not.be.undefined;
	});

	it("should get a sitemap", async () => {

		const sitemap = await createSitemap();
		const getSitemapResponse = await client.getSitemap(sitemap.id);
		expect(getSitemapResponse.id).to.be.equal(sitemap.id);
		expect(getSitemapResponse.name).to.not.be.undefined;
		expect(getSitemapResponse.sitemap).to.not.be.undefined;
	});

	it("should get sitemaps", async () => {

		await createSitemap();
		await createSitemap();
		const generator = client.getSitemaps();
		const allSitemaps = await generator.getAllRecords();
		expect(allSitemaps.length).to.be.greaterThan(1);
	});

	it("should get all sitemaps and fetch one by one", async () => {

		await createSitemap();
		await createSitemap();
		const generator = client.getSitemaps();
		const allSitemaps = [];
		for await(const record of generator.fetchRecords()) {
			allSitemaps.push(record);
		}
		expect(allSitemaps.length).to.be.greaterThan(1);
	});

	it("should update the sitemap", async () => {

		const sitemap = await createSitemap();
		const newSitemap = `{"_id":"api-test-${Date.now()}","startUrl":["https://webscraper.io/"],"selectors":[{"id":"product_name","type":"SelectorText","parentSelectors":["_root"],"selector":"abc","multiple":true,"regex":"","delay":0}]}`;
		const updateSitemapResponse = await client.updateSitemap(sitemap.id, newSitemap);
		expect(updateSitemapResponse).to.be.equal("ok");
	});

	it("should delete the sitemap", async () => {

		const sitemap = await createSitemap();
		const deleteSitemapResponse = await client.deleteSitemap(sitemap.id);
		expect(deleteSitemapResponse).to.be.equal("ok");
		sitemaps = [];
	});

	it("should create a scraping job", async () => {

		const sitemap = await createSitemap();
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: sitemap.id,
			driver: driver.fulljs,
			page_load_delay: 2000,
			request_interval: 2000,
			proxy: 1,
		};
		const createScrapingJobResponse = await client.createScrapingJob(scrapingJobConfig);
		expect(createScrapingJobResponse.id).to.not.be.undefined;
	});

	it("should get a scraping job", async () => {

		const scrapingJob = await createScrapingJob();
		const getScrapingJobResponse = await client.getScrapingJob(scrapingJob.id);
		expect(getScrapingJobResponse.id).to.equal(scrapingJob.id);
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
		const generator = client.getScrapingJobs();
		const allScrapingJobs = await generator.getAllRecords();
		expect(allScrapingJobs.length).to.be.greaterThan(1);
	});

	it("should get all scraping jobs and fetch one by one", async () => {

		await createSitemap();
		await createSitemap();
		const generator = client.getScrapingJobs();
		const allScrapingJobs = [];
		for await(const record of generator.fetchRecords()) {
			allScrapingJobs.push(record);
		}
		expect(allScrapingJobs.length).to.be.greaterThan(1);
	});

	it("should get scraping jobs from specific sitemap", async () => {

		const scrapingJob = await createScrapingJob();
		const generator = client.getScrapingJobs({
			sitemap_id: sitemaps[0].id,
		});
		const allScrapingJobs = await generator.getAllRecords();
		expect(allScrapingJobs[0].id).to.be.equal(scrapingJob.id);
		expect(allScrapingJobs.length).to.be.equal(1);
	});

	it("should get scraping jobs from specific sitemap and fetch one by one", async () => {

		const scrapingJob = await createScrapingJob();
		const generator = client.getScrapingJobs({
			sitemap_id: sitemaps[0].id,
		});
		const allScrapingJobs = [];
		for await(const record of generator.fetchRecords()) {
			allScrapingJobs.push(record);
		}
		expect(allScrapingJobs[0].id).to.be.equal(scrapingJob.id);
		expect(allScrapingJobs.length).to.be.equal(1);
	});

	it("should download scraped data in json format", async () => {

		const outputFile: string = "/tmp/outputfile.json";
		const scrapingJob = await createScrapingJob();
		let getScrapingJob = await client.getScrapingJob(scrapingJob.id);

		while (getScrapingJob.status !== "finished") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJob.id);
		}

		await client.downloadScrapingJobJSON(scrapingJob.id, outputFile);

		const reader = new JsonReader(outputFile);
		const jsonLines = await reader.toArray();
		expect(jsonLines.length).to.be.greaterThan(0);

		expect(fs.existsSync(outputFile)).to.be.ok;
		fs.unlinkSync(outputFile);
		expect(fs.existsSync(outputFile)).to.not.be.true;
	});

	it("should download scraped data in CSV format", async () => {

		const outputFile: string = "/tmp/outputfile.csv";
		const scrapingJob = await createScrapingJob();
		let getScrapingJob = await client.getScrapingJob(scrapingJob.id);

		while (getScrapingJob.status !== "finished") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJob.id);
		}

		await client.downloadScrapingJobCSV(scrapingJob.id, outputFile);
		expect(fs.existsSync(outputFile)).to.be.ok;
		fs.unlinkSync(outputFile);
		expect(fs.existsSync(outputFile)).to.not.be.true;
	});

	it("should get scraping job problematic Urls", async () => {

		const scrapingJob = await createScrapingJob(true);

		let getScrapingJob = await client.getScrapingJob(scrapingJob.id);
		while (getScrapingJob.status !== "finished") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJob.id);
		}

		const generator = client.getProblematicUrls(scrapingJob.id);
		const problematicUrls = await generator.getAllRecords();
		expect(problematicUrls).to.be.deep.equal([{
			url: "https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
			type: "empty",
		}]);
		scrapingJobs = [];
	});

	it("should get scraping job problematic Urls and fetch one by one", async () => {

		const scrapingJob = await createScrapingJob(true);

		let getScrapingJob = await client.getScrapingJob(scrapingJob.id);
		while (getScrapingJob.status !== "finished") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJob.id);
		}

		const generator = client.getProblematicUrls(scrapingJob.id);
		const problematicUrls: IGetProblematicUrlsResponse[] = [];
		for await(const record of generator.fetchRecords()) {
			problematicUrls.push(record);
		}
		expect(problematicUrls).to.be.deep.equal([{
			url: "https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
			type: "empty",
		}]);
		scrapingJobs = [];
	});

	it("should delete the scraping job", async () => {

		const scrapingJob = await createScrapingJob();
		const deleteScrapingJobResponse: string = await client.deleteScrapingJob(scrapingJob.id);
		expect(deleteScrapingJobResponse).to.equal("ok");
		scrapingJobs = [];
	});

	it("should return account info", async () => {

		const accountInfoResponse = await client.getAccountInfo();
		expect(accountInfoResponse.page_credits).to.not.be.undefined;
	});

	it("should not get specific data quality for just created scraping job", async () => {

		const scrapingJob = await createScrapingJob();
		const expectedError: string = 'Error: Web Scraper API Exception: {"success":false,"validationErrors":{"scraping_job_id":["Data quality check not available yet, scraping job not finished"]}}';
		try {
			await client.getScrapingJobDataQuality(scrapingJob.id);
		} catch (e) {
			expect(e.toString()).to.equal(expectedError);
		}
	});

	it("should enable sitemap scheduler", async () => {

		const sitemap = await createSitemap();
		const result = await client.enableSitemapScheduler(sitemap.id, schedulerConfig);
		expect(result).to.eq("ok");
	});

	it("should disable sitemap scheduler", async () => {

		const sitemap = await createSitemap();
		const result = await client.disableSitemapScheduler(sitemap.id);
		expect(result).to.eq("ok");
	});

	it("should get enabled sitemap scheduler", async () => {

		const sitemap = await createSitemap();
		const expectedConfig = {...schedulerConfig, ...{scheduler_enabled: true}};
		await client.enableSitemapScheduler(sitemap.id, schedulerConfig);
		const resultConfig = await client.getSitemapScheduler(sitemap.id);
		expect(resultConfig).to.be.deep.equal(expectedConfig);
	});
});

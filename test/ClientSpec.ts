import {expect} from "chai";
import {Client} from "../src/Client";
import {ICreateSitemapResponse} from "../src/interfaces/ICreateSitemapResponse";
import {IGetSitemapResponse} from "../src/interfaces/IGetSitemapResponse";
import {ICreateScrapingJobResponse} from "../src/interfaces/ICreateScrapingJobResponse";
import {IGetScrapingJobResponse} from "../src/interfaces/IGetScrapingJobResponse";
import {IGetAccountInfoResponse} from "../src/interfaces/IGetAccountInfoResponse";
import {IScrapingJobConfig} from "../src/interfaces/IScrapingJobConfig";
import {driver} from "../src/driverEnum";
import fs = require("fs");

const apiToken: string = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";

const client = new Client({
	token: apiToken,
	useBackoffSleep: true,
});

let sitemap: string;
let createSitemapResponse: ICreateSitemapResponse;
// check if path exists
if (!fs.existsSync("./data")) {
	fs.mkdirSync("./data");
}

describe("API Client", () => {

	beforeEach(() => {
		const time = Date.now();
		sitemap = `{"_id":"${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"abc","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
	});

	afterEach(async () => {
		if (createSitemapResponse) {
			const deleteAfterEachSitemapResponse: string = await client.deleteSitemap(createSitemapResponse.id);
			expect(deleteAfterEachSitemapResponse).to.be.equal("ok");
		}
		createSitemapResponse = undefined;
	});

	it("should create a sitemap", async () => {
		createSitemapResponse = await client.createSitemap(sitemap);
		expect(createSitemapResponse.id).to.not.be.undefined;
	});

	it("should get a sitemap", async () => {
		createSitemapResponse = await client.createSitemap(sitemap);
		const getSitemapResponse: IGetSitemapResponse = await client.getSitemap(createSitemapResponse.id);
		expect(getSitemapResponse.id).to.be.equal(createSitemapResponse.id);
		expect(getSitemapResponse.sitemap).to.be.eql(sitemap);
	});

	it("should get sitemaps with pagination", async () => {
		const iterator: any = await client.getSitemaps();
		const sitemaps: any[] = [];
		for await(const record of iterator) {
			sitemaps.push(record);
		}
		expect(sitemaps.length).to.be.greaterThan(100);
	});

	it("should update the sitemap", async () => {
		createSitemapResponse = await client.createSitemap(sitemap);

		const jsonSitemap = JSON.parse(sitemap);
		jsonSitemap.startUrl = ["https://changed-id-for-update.com"];
		const updatedSitemap = JSON.stringify(jsonSitemap);
		const updateSitemapResponse: string = await client.updateSitemap(createSitemapResponse.id, updatedSitemap);
		expect(updateSitemapResponse).to.be.equal("ok");

		const getNewSitemapResponse: IGetSitemapResponse = await client.getSitemap(createSitemapResponse.id);
		expect(getNewSitemapResponse.id).to.be.equal(createSitemapResponse.id);
		expect(getNewSitemapResponse.sitemap).to.be.eql(updatedSitemap);
	});

	it("should delete the sitemap", async () => {
		createSitemapResponse = await client.createSitemap(sitemap);
		const deleteSitemapResponse: string = await client.deleteSitemap(createSitemapResponse.id);
		expect(deleteSitemapResponse).to.be.equal("ok");
		const expectedError: string = "{\"success\":false,\"error\":\"An error occured\"}";
		const fullExpectedError: string = `Error: Web Scraper API Exception: ${expectedError}`;
		let errorThrown: boolean = false;
		try {
			await client.getSitemap(createSitemapResponse.id);
		} catch (e) {
			expect(fullExpectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
		createSitemapResponse = undefined;
	});
	for (let i = 0; i < 2000; i++) {
		it("should create a scraping job", async () => {
			createSitemapResponse = await client.createSitemap(sitemap);

			const scrapingJobConfig: IScrapingJobConfig = {
				sitemap_id: createSitemapResponse.id,
				driver: driver.fulljs,
				page_load_delay: 2000,
				request_interval: 2000,
			};
			const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResponse.id, scrapingJobConfig);
			expect(createScrapingJobResponse.id).to.not.be.undefined;
		});
	}
	it("should get a scraping job", async () => {
		createSitemapResponse = await client.createSitemap(sitemap);
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: createSitemapResponse.id,
			driver: driver.fulljs,
			page_load_delay: 2000,
			request_interval: 2000,
		};
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResponse.id, scrapingJobConfig);
		const getScrapingJobResponse: IGetScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
		expect(getScrapingJobResponse.id).to.equal(createScrapingJobResponse.id);
		expect(getScrapingJobResponse.sitemap_id).to.equal(createSitemapResponse.id);
		expect(getScrapingJobResponse.test_run).to.equal(0);
		expect(getScrapingJobResponse.sitemap_name).to.equal(JSON.parse(sitemap)._id);
		expect(getScrapingJobResponse.request_interval).to.equal(2000);
		expect(getScrapingJobResponse.page_load_delay).to.equal(2000);
		expect(getScrapingJobResponse.driver).to.equal("fulljs");
		expect(getScrapingJobResponse.scheduled).to.equal(0);
	});

	it("should get scraping jobs with pagination", async () => {
		createSitemapResponse = await client.createSitemap(sitemap);
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: createSitemapResponse.id,
			driver: driver.fulljs,
			page_load_delay: 2000,
			request_interval: 2000,
		};
		await client.createScrapingJob(createSitemapResponse.id, scrapingJobConfig);
		const iterator = await client.getScrapingJobs();
		const scrapingJobs: any[] = [];

		for await(const record of iterator) {
			scrapingJobs.push(record);
		}

		expect(scrapingJobs.length).to.be.greaterThan(100);
	});

	it("should get scraping jobs from specific sitemap", async () => {
		createSitemapResponse = await client.createSitemap(sitemap);
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: createSitemapResponse.id,
			driver: driver.fulljs,
			page_load_delay: 2000,
			request_interval: 2000,
		};
		await client.createScrapingJob(createSitemapResponse.id, scrapingJobConfig);
		const iterator = await client.getScrapingJobs({
			sitemap_id: 434871,
		}); // sitemapId 434871 ---> one job with id - 3620533
		const scrapingJobs: any[] = [];

		for await(const record of iterator) {
			scrapingJobs.push(record);
		}
		expect(scrapingJobs[0].id).to.be.equal(3620533);
		expect(scrapingJobs.length).to.be.equal(1);
	});

	it("should download scraped data in json format", async () => {
		const outputfile: string = "./data/outputfile.json";

		const expectedOutputFie: string = '{"web-scraper-order":"1611315699-1","web-scraper-start-url":"https:\\/\\/webscraper.io\\/test-sites\\/e-commerce\\/allinone","product":"MSI GL62M 7REX2"}\n{"web-scraper-order":"1611315699-2","web-scraper-start-url":"https:\\/\\/webscraper.io\\/test-sites\\/e-commerce\\/allinone","product":"MSI GL62VR 7RFX"}\n{"web-scraper-order":"1611315699-3","web-scraper-start-url":"https:\\/\\/webscraper.io\\/test-sites\\/e-commerce\\/allinone","product":"Acer Aspire 3 A3..."}\n';

		await client.downloadScrapingJobJSON(3472328, outputfile); // 3402771 throws error //3472328 for test
		expect(fs.existsSync(outputfile)).to.be.ok;
		expect(expectedOutputFie).to.be.eql((fs.readFileSync(outputfile, "utf8")));
		fs.unlinkSync(outputfile);
		expect(fs.existsSync(outputfile)).to.not.be.true;
	});

	it("should download scraped data in CSV format", async () => {
		const outputfile: string = "./data/outputfile.csv";

		const expectedOutputFie: string = '﻿web-scraper-order,web-scraper-start-url,product\r\n"1611315699-1","https://webscraper.io/test-sites/e-commerce/allinone","MSI GL62M 7REX2"\r\n"1611315699-2","https://webscraper.io/test-sites/e-commerce/allinone","MSI GL62VR 7RFX"\r\n"1611315699-3","https://webscraper.io/test-sites/e-commerce/allinone","Acer Aspire 3 A3..."\r\n';

		await client.downloadScrapingJobCSV(3472328, outputfile); // 3402771 throws error //3472328 for test
		expect(fs.existsSync(outputfile)).to.be.ok;
		expect(expectedOutputFie).to.be.eql((fs.readFileSync(outputfile, "utf8")));
		fs.unlinkSync(outputfile);
		expect(fs.existsSync(outputfile)).to.not.be.true;
	});

	it("should get scraping job problematic Urls", async () => {

		const iterator = await client.getProblematicUrls(3446233);
		const problematicUrls: any[] = [];

		for await(const record of iterator) {
			problematicUrls.push(record);
		}

		const expectedData = {
			url: "https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
			type: "empty",
		};

		expect(problematicUrls[0]).to.be.eql(expectedData);
	});

	it("should delete the scraping job", async () => {
		createSitemapResponse = await client.createSitemap(sitemap);
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: createSitemapResponse.id,
			driver: driver.fulljs,
			page_load_delay: 2000,
			request_interval: 2000,
		};
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResponse.id, scrapingJobConfig);
		const deleteScrapingJobResponse: string = await client.deleteScrapingJob(createScrapingJobResponse.id);
		expect(deleteScrapingJobResponse).to.equal("ok");
		const expectedError: string = "{\"success\":false,\"error\":\"An error occured\"}";
		const fullExpectedError: string = `Error: Web Scraper API Exception: ${expectedError}`;
		let errorThrown: boolean = false;
		try {
			await client.getScrapingJob(createScrapingJobResponse.id);
		} catch (e) {
			expect(fullExpectedError).to.be.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
	});

	it("should return account info", async () => {
		const accountInfoResponse: IGetAccountInfoResponse = await client.getAccountInfo();
		expect(accountInfoResponse.page_credits).to.be.greaterThan(0);
	});
});

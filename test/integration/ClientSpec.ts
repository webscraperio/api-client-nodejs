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
import fs = require("fs");

const apiToken: string = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";
// 7NppApvVzHZkO7dZBcdKrSfKqkPausZWszfy6x1zmZK5VSj3dQ3SwZQTImgx for tests
// kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8 original

const client = new Client({
	token: apiToken,
	useBackoffSleep: true,
});

let sitemap: string;
let sitemaps: ICreateSitemapResponse[] = [];
let scrapingJobs: ICreateScrapingJobResponse[] = [];
// check if path exists
if (!fs.existsSync("./data")) {
	fs.mkdirSync("./data");
}

function writeUniqueSitemap(): void {
	const time = Date.now();
	sitemap = `{"_id":"test-${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"abc","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
}

async function createSitemap(ownSitemap?: string): Promise<void> {
	if (!ownSitemap) {
		writeUniqueSitemap();
		ownSitemap = sitemap;
	}
	const response: ICreateSitemapResponse = await client.createSitemap(ownSitemap);
	sitemaps.push(response);
}

async function createScrapingJob(ownSitemap?: string): Promise<void> {
	if (!ownSitemap) {
		writeUniqueSitemap();
		ownSitemap = sitemap;
	}
	const sitemapResponse: ICreateSitemapResponse = await client.createSitemap(ownSitemap);
	sitemaps.push(sitemapResponse);

	const scrapingJobConfig: IScrapingJobConfig = {
		sitemap_id: sitemapResponse.id,
		driver: driver.fulljs,
		page_load_delay: 2000,
		request_interval: 2000,
		proxy: 1,
	};
	const response = await client.createScrapingJob(scrapingJobConfig);
	scrapingJobs.push(response);
}

describe("API Client", () => {

	afterEach(async () => {
		for (const value of sitemaps) {
			const deleteAfterEachSitemapResponse: string = await client.deleteSitemap(value.id);
			expect(deleteAfterEachSitemapResponse).to.be.equal("ok");
		}
		sitemaps = [];
		for (const value of scrapingJobs) {
			const deleteAfterEachScrapingJobResponse: string = await client.deleteScrapingJob(value.id);
			expect(deleteAfterEachScrapingJobResponse).to.be.equal("ok");
		}
		scrapingJobs = [];
		expect(sitemaps.length + scrapingJobs.length).to.be.equal(0);
	});

	it("should create a sitemap", async () => {
		writeUniqueSitemap();
		const response: ICreateSitemapResponse = await client.createSitemap(sitemap);
		sitemaps.push(response);
		expect(response.id).to.not.be.undefined;
	});

	it("should get a sitemap", async () => {
		await createSitemap();
		const getSitemapResponse: IGetSitemapResponse = await client.getSitemap(sitemaps[0].id);
		expect(getSitemapResponse.id).to.be.equal(sitemaps[0].id);
		expect(getSitemapResponse.sitemap).to.be.eql(sitemap);
	});

	it("should get sitemaps", async () => {
		await createSitemap();
		await createSitemap();
		const iterator = await client.getSitemaps();
		const all_sitemaps = [];
		for await(const record of iterator) {
			all_sitemaps.push(record);
		}
		expect(all_sitemaps.length).to.be.greaterThan(1);
	});

	it("should update the sitemap", async () => {
		await createSitemap();
		const newSitemap = JSON.parse(sitemap);
		newSitemap.startUrl = ["https://webscraper.io"];
		const updatedSitemap = JSON.stringify(newSitemap);
		const updateSitemapResponse: string = await client.updateSitemap(sitemaps[0].id, updatedSitemap);
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
		expect(getScrapingJobResponse.sitemap_name).to.equal(JSON.parse(sitemap)._id);
		expect(getScrapingJobResponse.request_interval).to.equal(2000);
		expect(getScrapingJobResponse.page_load_delay).to.equal(2000);
		expect(getScrapingJobResponse.driver).to.equal("fulljs");
		expect(getScrapingJobResponse.scheduled).to.equal(0);
	});

	it("should get scraping jobs", async () => {
		await createScrapingJob();
		await createScrapingJob();
		const iterator = await client.getScrapingJobs();
		const all_scrapingJobs = [];
		for await(const record of iterator) {
			all_scrapingJobs.push(record);
		}
		expect(all_scrapingJobs.length).to.be.greaterThan(1);
	});

	it("should get scraping jobs from specific sitemap", async () => {
		await createScrapingJob();
		const iterator = await client.getScrapingJobs({
			sitemap_id: sitemaps[0].id,
		});
		const all_scrapingJobs = [];
		for await(const record of iterator) {
			all_scrapingJobs.push(record);
		}
		expect(all_scrapingJobs[0].id).to.be.equal(scrapingJobs[0].id);
		expect(all_scrapingJobs.length).to.be.equal(1);
	});

	// skip
	it.skip("should download scraped data in json format", async () => {
		const outputfile: string = "./data/outputfile.json";
		await createScrapingJob();
		let getScrapingJob: IGetScrapingJobResponse = await client.getScrapingJob(scrapingJobs[0].id);

		while (getScrapingJob.status !== "finished") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJobs[0].id);
		}

		await client.downloadScrapingJobJSON(scrapingJobs[0].id, outputfile);
		expect(fs.existsSync(outputfile)).to.be.ok;
		fs.unlinkSync(outputfile);
		expect(fs.existsSync(outputfile)).to.not.be.true;
		scrapingJobs = []; // we are going to delete the sitemap, "finished" scraped jobs will automatically be deleted
	});

	// skip
	it.skip("should download scraped data in CSV format", async () => {
		const outputfile: string = "./data/outputfile.csv";
		await createScrapingJob();
		let getScrapingJob: IGetScrapingJobResponse = await client.getScrapingJob(scrapingJobs[0].id);

		while (getScrapingJob.status !== "finished") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJobs[0].id);
		}

		await client.downloadScrapingJobCSV(scrapingJobs[0].id, outputfile);
		expect(fs.existsSync(outputfile)).to.be.ok;
		fs.unlinkSync(outputfile);
		expect(fs.existsSync(outputfile)).to.not.be.true;
		scrapingJobs = []; // we are going to delete the sitemap, "finished" scraped jobs will automatically be deleted
	});

	// skip
	it.skip("should get scraping job problematic Urls", async () => {
		const time = Date.now();
		const problem_sitemap = {
			_id: time,
			startUrl: [
				"https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
				"https://webscraper.io/test-sites/e-commerce/static/computers/tablets",
			],
			selectors: [
				{
					id: "selector-test",
					type: "SelectorText",
					parentSelectors: ["_root"],
					selector: "body:contains(\"Computers / Tablets\") .page-header",
					multiple: true,
					regex: "",
					delay: 0,
				},
			],
		};

		await createScrapingJob(JSON.stringify(problem_sitemap));

		let getScrapingJob: IGetScrapingJobResponse = await client.getScrapingJob(scrapingJobs[0].id);

		while (getScrapingJob.status !== "shelved") {
			await sleep(10000);
			getScrapingJob = await client.getScrapingJob(scrapingJobs[0].id);
		}

		const iterator = await client.getProblematicUrls(scrapingJobs[0].id);
		const problematicUrls: any[] = [];

		for await(const record of iterator) {
			problematicUrls.push(record);
		}

		const expectedData = {
			url: "https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
			type: "empty",
		};
		expect(problematicUrls[0]).to.be.eql(expectedData);
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

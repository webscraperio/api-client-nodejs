import {expect} from "chai";
import {Client} from "../src/Client";
import {ICreateSitemapResponse} from "../src/interfaces/ICreateSitemapResponse";
import {IGetSitemapResponse} from "../src/interfaces/IGetSitemapResponse";
import {ICreateScrapingJobResponse} from "../src/interfaces/ICreateScrapingJobResponse";
import {IGetScrapingJobResponse} from "../src/interfaces/IGetScrapingJobResponse";
import {IGetAccountInfoResponse} from "../src/interfaces/IGetAccountInfoResponse";
import {IScrapingJobConfig} from "../src/interfaces/IScrapingJobConfig";
import fs = require("fs");

const apiToken: string = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";

const client = new Client({
	token: apiToken,
	baseUri: "https://api.webscraper.io/api/v1/",
});

let sitemap: string;
let createSitemapResonse: ICreateSitemapResponse;
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
		if (createSitemapResonse) {
			const deleteAfterEachSitemapResponse: string = await client.deleteSitemap(createSitemapResonse.id);
			expect(deleteAfterEachSitemapResponse).to.be.equal("ok");
		}
		createSitemapResonse = undefined;
	});

	it("should create a sitemap", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		expect(createSitemapResonse.id).to.not.be.undefined;
	});

	it("should get a sitemap", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const getSitemapResponse: IGetSitemapResponse = await client.getSitemap(createSitemapResonse.id);
		expect(getSitemapResponse.id).to.be.equal(createSitemapResonse.id);
	});

	it("should get sitemaps with pagination", async () => {
		const iterator: any = await client.getSitemaps();
		const sitemaps: any[] = [];
		for await(const record of iterator) {
			sitemaps.push(record);
		}

		expect(sitemaps.length).to.be.greaterThan(100);
	});

	// it("should get sitemaps with Manual pagination", async () => {
	// 	createSitemapResonse = await client.createSitemap(sitemap);
	//
	// 	let totalRecordsFound = 0;
	// 	const iterator = await client.getSitemaps();
	// 	let page = 1;
	// 	do {
	// 		const records = await iterator.getPageData(page);
	// 		totalRecordsFound += records.length;
	// 		page++;
	// 	} while (page <= await iterator.getLastPage());
	//
	// 	// for await(const record of iterator.getPageData(page)) {
	// 	// 	totalRecordsFound += record.length;
	// 	// }
	//
	// 	const recordCountFromIterator = iterator.array.length;
	//
	// 	expect(recordCountFromIterator).to.be.equal(totalRecordsFound);
	// });

	it("should update the sitemap", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const updateSitemapResponse: string = await client.updateSitemap(createSitemapResonse.id, sitemap);
		expect(updateSitemapResponse).to.be.equal("ok");
	});

	it("should delete the sitemap", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const deleteSitemapResponse: string = await client.deleteSitemap(createSitemapResonse.id);
		expect(deleteSitemapResponse).to.be.equal("ok");
		createSitemapResonse = undefined;
	});

	it("should create a scraping job", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);

		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: createSitemapResonse.id,
			driver: "fulljs",
			page_load_delay: 2000,
			request_interval: 2000,
		};
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id, scrapingJobConfig);
		expect(createScrapingJobResponse.id).to.not.be.undefined;
	});

	it("should get a scraping job", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: createSitemapResonse.id,
			driver: "fulljs",
			page_load_delay: 2000,
			request_interval: 2000,
		};
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id, scrapingJobConfig);
		const getScrapingJobResponse: IGetScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
		expect(getScrapingJobResponse.id).to.equal(createScrapingJobResponse.id);
	});

	it("should get scraping jobs with pagination", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: createSitemapResonse.id,
			driver: "fulljs",
			page_load_delay: 2000,
			request_interval: 2000,
		};
		await client.createScrapingJob(createSitemapResonse.id, scrapingJobConfig);
		const iterator = await client.getScrapingJobs(); // sitemapId 415221 ---> one job with id - 3443576
		const scrapingJobs: any[] = [];

		for await(const record of iterator) {
			scrapingJobs.push(record);
		}

		expect(scrapingJobs.length).to.be.greaterThan(100);
	});

	it("should get scraping jobs from specific sitemap", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: createSitemapResonse.id,
			driver: "fulljs",
			page_load_delay: 2000,
			request_interval: 2000,
		};
		await client.createScrapingJob(createSitemapResonse.id, scrapingJobConfig);
		const iterator = await client.getScrapingJobs(415221); // sitemapId 415221 ---> one job with id - 3443576
		const scrapingJobs: any[] = [];

		for await(const record of iterator) {
			scrapingJobs.push(record);
		}

		expect(scrapingJobs.length).to.be.equal(1);
	});

	it("should download scraped data in json format", async () => {
		// createSitemapResonse = await client.createSitemap(sitemap);
		// const scrapingJobConfig: IScrapingJobConfig = {
		// 	sitemap_id: createSitemapResonse.id,
		// 	driver: "fulljs",
		// 	page_load_delay: 2000,
		// 	request_interval: 2000,
		// };
		// const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id, scrapingJobConfig);
		// let getScrapingJobResponse: IGetScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
		//
		// const startTime = Date.now();
		// while (startTime + 60000 > Date.now() && getScrapingJobResponse.status !== "finished") {
		// 	getScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
		// 	await sleep(5000);
		// }

		const outputfile: string = "./data/outputfile.json";

		await client.downloadScrapingJobJSON(3446674, outputfile); // 3402771 throws error //3446674 legit
		expect(fs.existsSync(outputfile)).to.be.ok;
		expect(fs.readFileSync(outputfile)).to.not.be.undefined;
		fs.unlinkSync(outputfile);
		expect(fs.existsSync(outputfile)).to.not.be.true;
	});

	it("should download scraped data in CSV format", async () => {
		// 	createSitemapResonse = await client.createSitemap(sitemap);
		// 	const scrapingJobConfig: IScrapingJobConfig = {
		// 		sitemap_id: createSitemapResonse.id,
		// 		driver: "fulljs",
		// 		page_load_delay: 2000,
		// 		request_interval: 2000,
		// 	};
		// 	const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id, scrapingJobConfig);
		// 	let getScrapingJobResponse: IGetScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
		//
		// 	const startTime = Date.now();
		// 	while (startTime + 60000 > Date.now() && getScrapingJobResponse.status !== "finished") {
		// 		getScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
		// 		await sleep(5000);
		// 	}
		const outputfile: string = "./data/outputfile.csv";

		await client.downloadScrapingJobCSV(3446674, outputfile); // 3402771 throws error //3446674 legit
		expect(fs.existsSync(outputfile)).to.be.ok;
		expect(fs.readFileSync(outputfile)).to.not.be.undefined;
		fs.unlinkSync(outputfile);
		expect(fs.existsSync(outputfile)).to.not.be.true;
	});

	it("should get scraping job problematic Urls", async () => {

		const iterator = await client.getProblematicUrls(3446233);
		const problematicUrls: any[] = [];

		for await(const record of iterator) {
			problematicUrls.push(record);
		}

		expect(problematicUrls.length).to.be.greaterThan(0);
	});

	it("should delete the scraping job", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const scrapingJobConfig: IScrapingJobConfig = {
			sitemap_id: createSitemapResonse.id,
			driver: "fulljs",
			page_load_delay: 2000,
			request_interval: 2000,
		};
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id, scrapingJobConfig);
		const deleteScrapingJobResponse: string = await client.deleteScrapingJob(createScrapingJobResponse.id);
		expect(deleteScrapingJobResponse).to.equal("ok");
	});

	it("should return account info", async () => {
		const accountInfoResponse: IGetAccountInfoResponse = await client.getAccountInfo();
		expect(accountInfoResponse.email).to.not.be.undefined;
	});
});

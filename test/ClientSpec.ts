import {expect} from "chai";
import {Client} from "../src/Client";
import {ICreateSitemapResponse} from "../src/interfaces/ICreateSitemapResponse";
import {IGetSitemapResponse} from "../src/interfaces/IGetSitemapResponse";
import {ICreateScrapingJobResponse} from "../src/interfaces/ICreateScrapingJobResponse";
import {IGetScrapingJobResponse} from "../src/interfaces/IGetScrapingJobResponse";
import {IGetAccountInfoResponse} from "../src/interfaces/IGetAccountInfoResponse";
import fs = require("fs");
import {sleep} from "./sleepFunction";
import {IGetSitemapsResponse} from "../src/interfaces/IGetSitemapsResponse";
import {IGetScrapingJobsResponse} from "../src/interfaces/IGetScrapingJobsResponse";
import {IGetProblematicUrlsResponse} from "../src/interfaces/IGetProblematicUrlsResponse";

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

	it("should get sitemaps", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const sitemaps:IGetSitemapsResponse[] = await client.getSitemaps(); // optional param. page(def -> 1)
		expect(sitemaps.length).to.be.greaterThan(0);
		expect(sitemaps.find(e => e.id === createSitemapResonse.id)).to.be.ok;
	});

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
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id);
		expect(createScrapingJobResponse.id).to.not.be.undefined;
	});

	it("should get a scraping job", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id);
		const getScrapingJobResponse: IGetScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
		expect(getScrapingJobResponse.id).to.equal(createScrapingJobResponse.id);
	});

	it("should get scraping jobs", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id);
		const scrapingJobs: IGetScrapingJobsResponse[] = await client.getScrapingJobs(); // optional param. sitemapId, page(default -> 1)
		expect(scrapingJobs.length).to.be.greaterThan(0);
		expect(scrapingJobs.find(e => e.id === createScrapingJobResponse.id)).to.be.ok;
	});

	it("should download scraped data in json format", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id);
		let getScrapingJobResponse: IGetScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);

		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobResponse.status !== "finished") {
			getScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
			await sleep(5000);
		}

		const outputfile: string = "./data/outputfile.json";

		await client.getJSON(3402771, outputfile);
		expect(fs.existsSync(outputfile)).to.be.ok;
		expect(fs.readFileSync(outputfile)).to.not.be.undefined;
		fs.unlinkSync(outputfile);
		expect(fs.existsSync(outputfile)).to.not.be.true;
	});

	it("should download scraped data in CSV format", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id);
		let getScrapingJobResponse: IGetScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);

		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobResponse.status !== "finished") {
			getScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
			await sleep(5000);
		}

		const outputfile: string = "./data/outputfile.csv";

		await client.getCSV(getScrapingJobResponse.id, outputfile);
		expect(fs.existsSync(outputfile)).to.be.ok;
		expect(fs.readFileSync(outputfile)).to.not.be.undefined;
		fs.unlinkSync(outputfile);
		expect(fs.existsSync(outputfile)).to.not.be.true;
	});

	// it("should get scraping job problematic Urls", async () => {
	// 	// const time = Date.now();
	// 	// const problematicSitemap: string = `{
	// 	// 				"_id":"${time}",
	// 	// 				"startUrl":[
	// 	// 					"https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
	// 	// 					"https://webscraper.io/test-sites/e-commerce/static/computers/tablets"
	// 	// 				],
	// 	// 				"selectors":[
	// 	// 					{
	// 	// 						"id":"selector-test",
	// 	// 						"type":"SelectorText",
	// 	// 						"parentSelectors":["_root"],
	// 	// 						"selector":"body:contains(\\"Computers / Tablets\\") .page-header",
	// 	// 						"multiple":true,
	// 	// 						"regex":"",
	// 	// 						"delay":0
	// 	// 					}
	// 	// 				]
	// 	// 			}`;
	// 	//
	// 	// createSitemapResonse = await client.createSitemap(problematicSitemap);
	// 	// const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id);
	// 	// let getScrapingJobResponse: IGetScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
	// 	//
	// 	// const startTime = Date.now();
	// 	// while (startTime + 60000 > Date.now() && getScrapingJobResponse.status !== "shelved") {
	// 	// 	getScrapingJobResponse = await client.getScrapingJob(createScrapingJobResponse.id);
	// 	// 	await sleep(5000);
	// 	// }
	//
	// 	const problematicUrls: IGetProblematicUrlsResponse[] = await client.getProblematicUrls(getScrapingJobResponse.id);
	// 	expect(problematicUrls.length).to.be.greaterThan(0);
	// });

	it("should delete the scraping job", async () => {
		createSitemapResonse = await client.createSitemap(sitemap);
		const createScrapingJobResponse: ICreateScrapingJobResponse = await client.createScrapingJob(createSitemapResonse.id);
		const deleteScrapingJobResponse: string = await client.deleteScrapingJob(createScrapingJobResponse.id);
		expect(deleteScrapingJobResponse).to.equal("ok");
	});

	it("should return account info", async () => {
		const accountInfoResponse: IGetAccountInfoResponse = await client.getAccountInfo();
		expect(accountInfoResponse.email).to.not.be.undefined;
	});
});

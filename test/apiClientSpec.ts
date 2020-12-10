import {expect} from "chai";
import * as csv from "async-csv";
// import fs = require('fs');
import {Client} from "../src/apiClientClasses";
import {sleep} from "./sleepFunction";
import {ICreateScrapingJobResponse} from "../src/interfaces/ICreateScrapingJobResponse";
import {ICreateSiteMapResponse} from "../src/interfaces/ICreateSiteMapResponse";
import {IGetScrapingJobResponse} from "../src/interfaces/IGetScrapingJobResponse";
import {IUpdateSiteMapResponse} from "../src/interfaces/IUpdateSiteMapResponse";
import {IGetJsonResponse} from "../src/interfaces/IGetJsonResponse";
import {IDeleteSitemap} from "../src/interfaces/IDeleteSitemap";
import {IGetSiteMapResponse} from "../src/interfaces/IGetSiteMapResponse";
import {IDeleteScrapingJobResponse} from "../src/interfaces/IDeleteScrapingJobResponse";
import {IGetAccountInfoResponse} from "../src/interfaces/IGetAccountInfoResponse";
import {IGetSiteMapsResponse} from "../src/interfaces/IGetSiteMapsResponse";
import {IGetScrapingJobsResponse} from "../src/interfaces/IGetScrapingJobsResponse";
import {IGetCSVResponse} from "../src/interfaces/IGetCSVResponse";
import {IGetScrapingJobProblResponse} from "../src/interfaces/IGetScrapingJobProblResponse";

const token = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";

let mySitemap: string;
let sitemapInfoData: ICreateSiteMapResponse;
let getSitemapInfo: IGetSiteMapResponse;
let getSitemapsInfo: IGetSiteMapsResponse[];
let updateSitemapInfo: IUpdateSiteMapResponse;
let deleteSitemapInfo: IDeleteSitemap;
let scrapingJobInfo: ICreateScrapingJobResponse;
let getScrapingJobInfo: IGetScrapingJobResponse;
let getScrapingJobsInfo: IGetScrapingJobsResponse[];
let scrapedJson: IGetJsonResponse;
let scrapedCSV: IGetCSVResponse;
let getScrapingJobProblURLInfo: IGetScrapingJobProblResponse[];
let deleteScrapingJob: IDeleteScrapingJobResponse;
let accountInfo: IGetAccountInfoResponse;

describe("API Client", () => {

	beforeEach(() => {
		const time = Date.now();
		mySitemap = `{"_id":"${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"a","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
	});

	afterEach(async () => {
		if(sitemapInfoData.id) {
			const scrapingTest = new Client(token);
			deleteSitemapInfo = await scrapingTest.deleteSitemap(sitemapInfoData.id);
			expect(deleteSitemapInfo.success).to.be.equal(true);
		}
		sitemapInfoData = undefined;
	});

	// TESTED
	it("should create a sitemap", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		expect(sitemapInfoData.id).to.not.be.undefined;
	});

	// TESTED
	it("should get a sitemap", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		getSitemapInfo = await scrapingTest.getSitemap(sitemapInfoData.id);
		expect(getSitemapInfo.id).to.not.be.undefined;
	});

	// TESTED
	// params - page missing
	it("should get sitemaps", async () => {
		const scrapingTest = new Client(token);

		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);

		getSitemapsInfo = await scrapingTest.getSitemaps();
		getSitemapsInfo.forEach(elem => expect(elem.id).to.not.be.undefined)
		getSitemapsInfo.forEach(elem => expect(elem).to.have.deep.members([{id: sitemapInfoData.id}, {name: mySitemap}]))
	});

	// TESTED
	it("should update the sitemap", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		updateSitemapInfo = await scrapingTest.updateSitemap(sitemapInfoData.id, mySitemap);
		expect(updateSitemapInfo.data).to.not.be.undefined;
	});

	// TESTED
	it("should delete the sitemap", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		deleteSitemapInfo = await scrapingTest.deleteSitemap(sitemapInfoData.id);
		expect(deleteSitemapInfo.data).to.not.be.undefined;
		sitemapInfoData = undefined;
	});

	// TESTED
	it("should create a scraping job", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		expect(scrapingJobInfo.id).to.not.be.undefined;
	});

	// TESTED
	it("should get a scraping job", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
		expect(getScrapingJobInfo.status).to.not.be.undefined;
	});

	// TESTED
	it("should get a scraping job ENDED", async () => {
			const scrapingTest = new Client(token);

			sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
			scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);

			getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			const startTime = Date.now();
			while (startTime + 60000 > Date.now() && getScrapingJobInfo.status !== "finished") {
				getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
				await sleep(2000);
			}

			expect(getScrapingJobInfo.status).to.not.be.undefined;
			expect(getScrapingJobInfo.status).to.equal("finished");
		});

	// TESTED <--- problem with afterEach
	// params page and sitemap missing
	it("should get scraping jobs", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);

		getScrapingJobsInfo = await scrapingTest.getScrapingJobs()

		getScrapingJobsInfo.forEach(elem => expect(elem.id).to.not.be.undefined);

		let expectedID = getScrapingJobsInfo.find(obj => obj.id === scrapingJobInfo.id);

		expect(expectedID).to.not.be.undefined;

	});

	// TESTED
	it("should download scraped data in json format", async () => {
		const scrapingTest = new Client(token);

		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);

		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobInfo.status !== "finished") {
			getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(5000);
		}
		scrapedJson = await scrapingTest.getJson(scrapingJobInfo.id);
		expect(scrapedJson).to.not.be.undefined;
	});

	// TESTED
	it("should download scraped data in CSV format", async () => {
		const scrapingTest = new Client(token);

		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);

		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobInfo.status !== "finished") {
			getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(5000);
		}

		scrapedCSV = await scrapingTest.getCSV(scrapingJobInfo.id);
		let scrapedCSVstring: string = scrapedCSV.toString();
		let parsedScrapedCSV = await csv.parse(scrapedCSVstring);

		// parsedScrapedCSV.forEach(elem => expect(elem).to.not.be.undefined)
		// parsedScrapedCSV is an array with csv elements.

		expect(parsedScrapedCSV.length).to.be.ok;
	});

	// TESTED
	// params page missing
	it("should get scraping job problematic Urls", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);

		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobInfo.status !== "finished") {
			getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(5000);
		}

		getScrapingJobProblURLInfo = await scrapingTest.getScrapingJobProbUrl(scrapingJobInfo.id);

		getScrapingJobProblURLInfo.forEach(elem => expect(elem.url).to.not.be.undefined);
	});

	// TESTED
	it("should delete the scraping job", async () => {
		const scrapingTest = new Client(token);
		sitemapInfoData = await scrapingTest.createSitemap(mySitemap);
		scrapingJobInfo = await scrapingTest.createScrapingJob(sitemapInfoData.id);
		getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
/*
		const startTime = Date.now();
		while (startTime + 60000 > Date.now() && getScrapingJobInfo.status !== "finished") {
			getScrapingJobInfo = await scrapingTest.getScrapingJob(scrapingJobInfo.id);
			await sleep(5000);
		}
*/
		deleteScrapingJob = await scrapingTest.deleteScrapingJob(scrapingJobInfo.id);
		expect(deleteScrapingJob.data).to.not.be.undefined;
	});

	// TESTED
	it("should return account info", async () => {
		const scrapingTest = new Client(token);
		accountInfo = await scrapingTest.getAccountInfo();
		expect(accountInfo.email).to.not.be.undefined;
	});
});

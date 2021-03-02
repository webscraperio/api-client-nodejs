import * as chai from "chai";
import {expect} from "chai";
import {Client} from "../../src/Client";
import {HttpClient} from "../../src/HttpClient";
import * as spies from "chai-spies";
import {IRequestOptions} from "../../src/interfaces/IRequestOptions";
import * as fs from "fs";
import * as nock from "nock";

chai.use(spies);

describe("Mock HttpClient", () => {

	let client: Client;
	let httpClient: HttpClient;

	beforeEach(() => {
		client = new Client({
			token: "123",
		});
		httpClient = new HttpClient({
			token: "123",
			useBackoffSleep: true,
		});

		// @ts-ignore
		client.httpClient = httpClient;
	});

	it("should throw an error when downloading scraped data in json format", async () => {
		const outputfile: string = "./data/outputfile.json";
		const expectedError: string = "{\"success\":false,\"error\":\"An error occured\"}";
		const fullExpectedError: string = `Error: Web Scraper API Exception: ${expectedError}`;
		let errorThrown: boolean = false;

		chai.spy.on(httpClient, "dataDownloadRequest", (options: IRequestOptions) => {
			return new Promise((resolve, reject) => {
				reject({
					response: {statusCode: 404},
					responseData: '{"success":false,"error":"An error occured"}',
				});
			});
		});

		try {
			await client.downloadScrapingJobJSON(123, outputfile);
		} catch (e) {
			expect(fullExpectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
		expect(fs.existsSync(outputfile)).to.not.be.true;
	});

	it("should throw an error when downloading scraped data in CSV format", async () => {
		const outputfile: string = "./data/outputfile.csv";
		const expectedError: string = "{\"success\":false,\"error\":\"An error occured\"}";
		const fullExpectedError: string = `Error: Web Scraper API Exception: ${expectedError}`;
		let errorThrown: boolean = false;

		chai.spy.on(httpClient, "dataDownloadRequest", (options: IRequestOptions) => {
			return new Promise((resolve, reject) => {
				reject({
					response: {statusCode: 404},
					responseData: '{"success":false,"error":"An error occured"}',
				});
			});
		});

		try {
			await client.downloadScrapingJobCSV(123, outputfile);
		} catch (e) {
			expect(fullExpectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
		expect(fs.existsSync(outputfile)).to.not.be.true;
	});

	it("should throw an error when creating a sitemap", async () => {
		const expectedError: string = "{\"success\":false,\"validationErrors\":{\"sitemap_object\":[\"Sitemap has a suspicious attribute somewhere.\"],\"sitemap_object.startUrl\":[\"The sitemap object.start url field is required.\"]}}";
		const fullExpectedError: string = `Error: Web Scraper API Exception: ${expectedError}`;
		let errorThrown: boolean = false;

		chai.spy.on(httpClient, "regularRequest", (options: IRequestOptions) => {
			return new Promise((resolve, reject) => {
				reject({
					response: {statusCode: 404},
					responseData: '{"success":false,"validationErrors":{"sitemap_object":["Sitemap has a suspicious attribute somewhere."],"sitemap_object.startUrl":["The sitemap object.start url field is required."]}}',
				});
			});
		});

		try {
			await client.createSitemap("sitemap");
		} catch (e) {
			expect(fullExpectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
	});

	it("should throw an error when accessing regular request error event", async () => {
		const fullExpectedError: string = "TypeError: Cannot read property 'statusCode' of undefined";
		let errorThrown: boolean = false;

		const scope = nock("https://api.webscraper.io")
			.get("/api/v1/sitemap?api_token=123")
			.replyWithError("error should be thrown");

		try {
			await client.createSitemap("sitemap");
		} catch (e) {
			expect(fullExpectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
	});

	it("should throw an error when accessing download request error event", async () => {
		const fullExpectedError: string = "TypeError: Cannot read property 'statusCode' of undefined";
		let errorThrown: boolean = false;
		const scope = nock("https://api.webscraper.io")
			.get("/api/v1/scraping-job/12345/json?api_token=123")
			.replyWithError("error should be thrown");

		try {
			await client.downloadScrapingJobJSON(12345, "testFileFail");
		} catch (e) {
			expect(fullExpectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
	});
// -----------------------------------------------------

	it("should use backoff sleep", async () => {
		let errorThrown: boolean = false;
		const responses: any[] = [
			new Promise((resolve, reject) => {
				reject({
					response: {
						statusCode: 429,
						headers: {"retry-after": 1},
					},
					responseData: "{success: true}",
				});
			}),
			new Promise((resolve, reject) => {
				resolve({
					response: {
						statusCode: 200,
					},
					responseData: '{"success":true,"data":"hey"}',
				});
			}),
		];
		let index: number = -1;
		chai.spy.on(httpClient, "regularRequest", (options: IRequestOptions) => {
			index++;
			return responses[index];
		});

		try {
			await client.createSitemap("sitemap");
		} catch (e) {
			errorThrown = true;
		}
		expect(errorThrown).to.be.false;
	});
});

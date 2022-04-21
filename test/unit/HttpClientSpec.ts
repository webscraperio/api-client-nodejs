import * as chai from "chai";
import {expect} from "chai";
import {HttpClient} from "../../src/HttpClient";
import * as spies from "chai-spies";
import {IRequestOptions} from "../../src/interfaces/IRequestOptions";
import * as nock from "nock";
import {ICreateSitemapResponse} from "../../src/interfaces/ICreateSitemapResponse";
import {IWebScraperResponse} from "../../src/interfaces/IWebScraperResponse";
import * as fs from "fs";
import {IGetSitemapResponse} from "../../src/interfaces/IGetSitemapResponse";

chai.use(spies);

describe("Mock HttpClient", () => {

	let httpClient: HttpClient;

	beforeEach(() => {
		httpClient = new HttpClient({
			token: "123",
			useBackoffSleep: true,
		});
	});

	it("should make get function", async () => {

		chai.spy.on(httpClient, "request", (options: IRequestOptions) => {
			return {success: true, data: {id: 12345}};
		});
		const response: IWebScraperResponse<IGetSitemapResponse> = await httpClient.get("myTestUrl");
		expect(response.data.id).to.be.equal(12345);
	});

	it("should make post function", async () => {

		chai.spy.on(httpClient, "request", (options: IRequestOptions) => {
			return {success: true, data: {id: 12345}};
		});
		const response: IWebScraperResponse<ICreateSitemapResponse> = await httpClient.post("myTestUrl", "sitemapData");
		expect(response.data.id).to.be.equal(12345);
	});

	it("should make put function", async () => {

		chai.spy.on(httpClient, "request", (options: IRequestOptions) => {
			return {success: true, data: "ok"};
		});
		const response: IWebScraperResponse<string> = await httpClient.put("myTestUrl", "sitemapData");
		expect(response.data).to.be.equal("ok");
	});

	it("should make delete function", async () => {

		chai.spy.on(httpClient, "request", (options: IRequestOptions) => {
			return {success: true, data: "ok"};
		});
		const response: IWebScraperResponse<string> = await httpClient.delete("myTestUrl");
		expect(response.data).to.be.equal("ok");
	});

	it("should make regularRequest from request", async () => {

		chai.spy.on(httpClient, "regularRequest", (options: IRequestOptions) => {
			return new Promise((resolve, reject) => {
				resolve({success: true, data: {id: 12345}});
			});
		});
		const response: IWebScraperResponse<ICreateSitemapResponse> = await httpClient.request({
			url: "myTestUrl",
			method: "POST",
		});
		expect(response.data.id).to.be.equal(12345);
	});

	it("should make dataDownloadRequest from request", async () => {

		const outputFile: string = "/tmp/outputfile.json";
		chai.spy.on(httpClient, "dataDownloadRequest", (options: IRequestOptions) => {
			return new Promise((resolve, reject) => {
				resolve('{hello: "WebScraperTest"}');
			});
		});
		const response = await httpClient.request({
			url: "myTestUrl",
			method: "GET",
			saveTo: outputFile,
		});
		expect(response).to.be.eql('{hello: "WebScraperTest"}');
	});

	it("should throw a Web Scraper API Exception error", async () => {

		chai.spy.on(httpClient, "regularRequest", (options: IRequestOptions) => {
			return new Promise((resolve, reject) => {
				reject({
					response: {statusCode: 404},
					responseData: '{"success":false,"error":"An error occurred"}',
				});
			});
		});

		let errorThrown: boolean = false;
		const expectedError: string = 'Error: Web Scraper API Exception: {\"success\":false,\"error\":\"An error occurred\"}';
		try {
			await httpClient.request({
				url: "myTestUrl",
				method: "POST",
				query: {
					sitemap_id: 1,
				},
			});
		} catch (e) {
			expect(expectedError).to.equal(e.toString());
			errorThrown = true;
		}

		expect(errorThrown).to.be.true;
	});

	it("should throw a Web Scraper API Exception error when all attempts have been used", async () => {

		chai.spy.on(httpClient, "regularRequest", (options: IRequestOptions) => {
			return new Promise((resolve, reject) => {
				reject({
					response: {
						statusCode: 429,
						headers: {"retry-after": 1},
					},
					responseData: '{"success":false,"error":"An error occurred"}',
				});
			});
		});

		let errorThrown: boolean = false;
		const expectedError: string = 'Error: Web Scraper API Exception: {\"success\":false,\"error\":\"An error occurred\"}';
		try {
			await httpClient.request({
				url: "myTestUrl",
				method: "POST",
			});
		} catch (e) {
			expect(expectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
	});

	it("should throw an Error when accessing regularRequest error event", async () => {

		const expectedError = {
			code: "EAI_AGAIN",
			errno: "EAI_AGAIN",
			host: "api.webscraper.io",
			hostname: "api.webscraper.io",
			port: 443,
			syscall: "getaddrinfo",
		};
		nock("https://api.webscraper.io")
			.post("/api/v1/sitemap?api_token=123")
			.replyWithError(expectedError);

		let errorThrown: boolean = false;
		try {
			await httpClient.request({
				url: "sitemap",
				method: "POST",
			});
		} catch (e) {
			expect(expectedError).to.be.eql(e);
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
	});

	it("should save download data in file", async () => {

		const outputFile: string = "/tmp/outputfile.json";
		nock("https://api.webscraper.io")
			.get("/api/v1/scraping-job/12345/json?api_token=123")
			.reply(200, {hello: "WebScraper"});

		await httpClient.request({
			url: "scraping-job/12345/json",
			method: "GET",
			saveTo: outputFile,
		});

		expect(fs.existsSync(outputFile)).to.be.ok;
		expect(fs.readFileSync(outputFile, "utf-8")).to.be.eql('{"hello":"WebScraper"}');
		fs.unlinkSync(outputFile);
		expect(fs.existsSync(outputFile)).to.not.be.true;
	});

	it("should return response data", async () => {

		nock("https://api.webscraper.io")
			.post("/api/v1/sitemap/12345?api_token=123&sitemap_id=1")
			.reply(200, {success: true, data: {id: 12345}});

		const response: IWebScraperResponse<ICreateSitemapResponse> = await httpClient.request({
			url: "sitemap/12345",
			method: "POST",
			query: {
				sitemap_id: 1,
			},
		});
		expect(response).to.be.eql({success: true, data: {id: 12345}});
	});

	it("should throw an Error when accessing dataDownloadRequest error event", async () => {

		const expectedError = {
			code: "EAI_AGAIN",
			errno: "EAI_AGAIN",
			host: "api.webscraper.io",
			hostname: "api.webscraper.io",
			port: 443,
			syscall: "getaddrinfo",
		};
		const outputFile: string = "/tmp/outputfile.json";
		nock("https://api.webscraper.io")
			.get("/api/v1/scraping-job/12345/json?api_token=123")
			.replyWithError(expectedError);

		let errorThrown: boolean = false;
		try {
			await httpClient.request({
				url: "scraping-job/12345/json",
				method: "GET",
				saveTo: outputFile,
			});
		} catch (e) {
			expect(expectedError).to.be.eql(e);
			errorThrown = true;
		}

		expect(fs.existsSync(outputFile)).to.not.be.true;
		expect(errorThrown).to.be.true;
	});

	it("should use backoff sleep", async () => {

		const responses: any[] = [
			new Promise((resolve, reject) => {
				reject({
					response: {
						statusCode: 429,
						headers: {"retry-after": 1},
					},
					responseData: "{success: false}",
				});
			}),
			new Promise((resolve, reject) => {
				resolve({
					response: {
						statusCode: 200,
					},
					responseData: '{"success":true,"data":"testData"}',
				});
			}),
		];

		let index: number = 0;
		chai.spy.on(httpClient, "regularRequest", (options: IRequestOptions) => {
			return responses[index++];
		});

		await httpClient.request({
			url: "myTestUrl",
			method: "POST",
		});

		// @ts-ignore
		expect(httpClient.regularRequest).to.have.been.called.exactly(2);
	});

	it("should not use backoff sleep", async () => {

		httpClient = new HttpClient({
			token: "123",
			useBackoffSleep: false,
		});

		chai.spy.on(httpClient, "regularRequest", (options: IRequestOptions) => {
			return new Promise((resolve, reject) => {
				reject({
					response: {
						statusCode: 429,
						headers: {"retry-after": 1},
					},
					responseData: "{success: false}",
				});
			});
		});

		let errorThrown: boolean = false;
		try {
			await httpClient.request({
				url: "myTestUrl",
				method: "POST",
			});
		} catch (e) {
			errorThrown = true;
		}

		// @ts-ignore
		expect(httpClient.regularRequest).to.have.been.called.exactly(1);
		expect(errorThrown).to.be.true;
	});

	it("should not wait on retry-after when using backoff sleep", async () => {

		const responses: any[] = [
			new Promise((resolve, reject) => {
				reject({
					response: {
						statusCode: 429,
						headers: {},
					},
					responseData: "{success: false}",
				});
			}),
			new Promise((resolve, reject) => {
				resolve({
					response: {
						statusCode: 200,
					},
					responseData: '{"success":true,"data":"testData"}',
				});
			}),
		];

		let index: number = 0;
		chai.spy.on(httpClient, "regularRequest", (options: IRequestOptions) => {
			return responses[index++];
		});

		let slept = false;
		setTimeout(() => {
			slept = true;
		}, 800);
		await httpClient.request({
			url: "myTestUrl",
			method: "POST",
		});

		// @ts-ignore
		expect(httpClient.regularRequest).to.have.been.called.exactly(2);
		expect(slept).to.be.false;
	});

	it("should make regularRequest promise reject due to success false", async () => {

		nock("https://api.webscraper.io")
			.post("/api/v1/sitemap/12345?api_token=123")
			.reply(401, {success: false, error: "An error occurred"});

		let errorThrown: boolean = false;
		const expectedError: string = 'Error: Web Scraper API Exception: {\"success\":false,\"error\":\"An error occurred\"}';
		try {
			await httpClient.request({
				url: "sitemap/12345",
				method: "POST",
				data: "sitemapData",
			});
		} catch (e) {
			expect(expectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
	});

	it("should make dataDownloadRequest promise reject due to success false", async () => {

		const outputFile: string = "/tmp/outputfile.json";
		nock("https://api.webscraper.io")
			.get("/api/v1/scraping-job/12345/json?api_token=123")
			.reply(404, {success: false, error: "An error occurred"});

		let errorThrown: boolean = false;
		const expectedError: string = 'Error: Web Scraper API Exception: {\"success\":false,\"error\":\"An error occurred\"}';
		try {
			await httpClient.request({
				url: "scraping-job/12345/json",
				method: "GET",
				saveTo: outputFile,
			});
		} catch (e) {
			expect(expectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
		expect(fs.existsSync(outputFile)).to.not.be.true;
	});
});

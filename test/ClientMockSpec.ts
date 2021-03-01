import { expect } from "chai";
import * as chai from "chai";
import {Client} from "../src/Client";
import {HttpClient} from "../src/HttpClient";
import * as spies from "chai-spies";
import {IRequestOptions} from "../src/interfaces/IRequestOptions";
chai.use(spies);

describe("Client", () => {

	let  client:Client;
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

	it("should get sitemaps with pagination", async () => {

		chai.spy.on(httpClient, "request", async (options: IRequestOptions) => {

			const responseSitemaps = [
				{
					"id": 123,
					"name": "webscraper-io-landing",
				},
				{
					"id": 123,
					"name": "webscraper-io-landing2",
				},
			];

			if (options.query.page === 1) {
				return {
					success: true,
					data: responseSitemaps,
					current_page: 1,
					last_page: 2,
					total: 2,
					per_page: 2,
				};
			} else if (options.query.page === 2) {
				return {
					success: true,
					data: responseSitemaps,
					current_page: 2,
					last_page: 2,
					total: 2,
					per_page: 2,
				};
			}
		});

		const iterator: any = await client.getSitemaps();
		const sitemaps: any[] = [];
		for await(const record of iterator) {
			sitemaps.push(record);
		}
		expect(httpClient.request).to.have.been.called.exactly(2);
		expect(sitemaps.length).to.be.equal(4);
	});
});

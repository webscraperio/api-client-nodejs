import * as chai from "chai";
import {expect} from "chai";
import {beforeEach} from "mocha";
import {PaginationGenerator} from "../../src/PaginationGenerator";
import {IGetSitemapsResponse} from "../../src/interfaces/IGetSitemapsResponse";
import {HttpClient} from "../../src/HttpClient";
import * as spies from "chai-spies";
import {IRequestOptions} from "../../src/interfaces/IRequestOptions";

let generator: PaginationGenerator<IGetSitemapsResponse>;

// generate two pages of sitemaps
const responseSitemaps: IGetSitemapsResponse[][] = [[], []];

for (let i = 0; i < 100; i++) {
	responseSitemaps[0].push({
		"id": 123,
		"name": `webscraper-io-landing${i}`,
	});
}
for (let k = 0; k < 20; k++) {
	responseSitemaps[1].push({
		"id": 123,
		"name": `webscraper-io-landing${99 + k}`,
	});
}

chai.use(spies);

describe("Pagination generator", () => {

	let httpClient: HttpClient;

	beforeEach(() => {
		httpClient = new HttpClient({
			token: "123",
			useBackoffSleep: true,
		});

		chai.spy.on(httpClient, "request", async (options: IRequestOptions) => {

			if (options.query.page === 1) {
				return {
					success: true,
					data: responseSitemaps[0],
					current_page: 1,
					last_page: 2,
					total: 120,
					per_page: 100,
				};
			} else if (options.query.page === 2) {
				return {
					success: true,
					data: responseSitemaps[1],
					current_page: 2,
					last_page: 2,
					total: 120,
					per_page: 100,
				};
			}
		});
		generator = new PaginationGenerator(httpClient, "myTestUrl");
	});

	it("should return fetched data", async () => {
		const data = await generator.getAllRecords();
		expect(data.length).to.be.equal(120);
	});

	it("should iterate through generator with next()", async () => {
		// tslint:disable:no-string-literal
		await generator["fetchRecords"]().next();
		await generator["fetchRecords"]().next();
		const thirdSitemap = await generator["fetchRecords"]().next();
		expect(thirdSitemap.value).to.be.eql(responseSitemaps[0][2]);
	});
});

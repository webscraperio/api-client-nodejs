import * as chai from "chai";
import {expect} from "chai";
import {beforeEach} from "mocha";
import {PaginationIterator} from "../../src/PaginationIterator";
import {IGetSitemapsResponse} from "../../src/interfaces/IGetSitemapsResponse";
import {HttpClient} from "../../src/HttpClient";
import * as spies from "chai-spies";
import {IRequestOptions} from "../../src/interfaces/IRequestOptions";

let iterator: PaginationIterator<IGetSitemapsResponse>;
const expectedFirstRecord: { done: boolean, value?: { id: number, name: string } } = {
	done: false,
	value: {
		id: 123,
		name: "webscraper-io-landing0",
	},
};

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

describe("Pagination iterator", () => {

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
					total: 2,
					per_page: 100,
				};
			} else if (options.query.page === 2) {
				return {
					success: true,
					data: responseSitemaps[1],
					current_page: 2,
					last_page: 2,
					total: 2,
					per_page: 100,
				};
			}
		});
		iterator = new PaginationIterator(httpClient, "myTestUrl");
	});

	it("should return next position ", async () => {
		const firstRecord: { done: boolean, value?: { id: number, name: string } } = await iterator.next();
		expect(firstRecord).to.be.eql(expectedFirstRecord);
	});

	it("should return page data", async () => {
		const pageData = await iterator.getPageData(1);
		expect(pageData[0]).to.be.eql(expectedFirstRecord.value);
		expect(pageData.length).to.be.equal(100);
	});

	it("should return current position", async () => {
		const currentRecord = await iterator.current();
		expect(currentRecord).to.be.eql(expectedFirstRecord.value);
	});

	it("should return key", async () => {
		let k = 0;
		for await (const records of iterator) {
			if (k++ === 113)
				break;

		}
		const key = await iterator.key();
		expect(key).to.be.equal(114);
	});

	it("should return last page number", async () => {
		const lastPage = await iterator.getLastPage();
		expect(lastPage).to.be.equal(2);
	});

	it("should return current position as 0 because of rewind ", async () => {
		for await (const record of iterator) { const a = 1;}
		expect(iterator.position).to.be.equal(20);
		// @ts-ignore
		expect(iterator.page).to.be.equal(2);
		await iterator.rewind();
		expect(iterator.position).to.be.equal(0);
		// @ts-ignore
		expect(iterator.page).to.be.equal(1);
		const currentRecord = await iterator.current();
		expect(currentRecord).to.be.eql(expectedFirstRecord.value);
	});

	it("should not allow to get_page_data of the same page", async () => {
		const firstArray = await iterator.getPageData(1);
		const secondArray = await iterator.getPageData(1);
		expect(httpClient.request).to.have.been.called.exactly(1);
		expect(firstArray).to.deep.equal(secondArray);
	});

	it("should make data fetched true", async () => {
		await iterator.getLastPage();
		// @ts-ignore
		expect(iterator.dataFetched).to.be.true;

		await iterator.getLastPage();
		expect(httpClient.request).to.have.been.called.exactly(1);
	});
});

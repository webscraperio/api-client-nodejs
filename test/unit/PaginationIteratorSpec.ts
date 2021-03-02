import {Client} from "../../src/Client";
import {expect} from "chai";
import {beforeEach} from "mocha";
import {PaginationIterator} from "../../src/PaginationIterator";
import {IGetSitemapsResponse} from "../../src/interfaces/IGetSitemapsResponse";
import {ICreateSitemapResponse} from "../../src/interfaces/ICreateSitemapResponse";

const apiToken: string = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";
let iterator: PaginationIterator<IGetSitemapsResponse>;
const client = new Client({
	token: apiToken,
});
let sitemap: string;
const sitemaps: ICreateSitemapResponse[] = [];

async function createSitemap(): Promise<void> {
	const response: ICreateSitemapResponse = await client.createSitemap(sitemap);
	sitemaps.push(response);
}

let expectedFirstRecord: { done: boolean, value?: { id: number, name: string } };

describe("Pagination iterator", () => {
	beforeEach(async () => {
		iterator = await client.getSitemaps();
		expectedFirstRecord = await iterator.next();
		await iterator.rewind();
	});

	it("should return next position ", async () => {
		const firstRecord: { done: boolean, value?: { id: number, name: string } } = await iterator.next();
		expect(firstRecord).to.be.eql(expectedFirstRecord);
	});

	it("should return page data", async () => {
		const pageData = await iterator.getPageData(1);
		expect(pageData[0]).to.be.eql(expectedFirstRecord.value);
		expect(pageData.length).to.be.greaterThan(0);
	});

	it("should return current position", async () => {
		const currentRecord = await iterator.current();
		expect(currentRecord).to.be.eql(expectedFirstRecord.value);
	});

	it("should return key", async () => {
		// not sure about this test
		let k = 0;
		for await (const records of iterator) {
			if (k++ === 110)
				break;

		}
		const key = await iterator.key();
		expect(key).to.be.equal(111);
	});

	it("should return last page number", async () => {
		const lastPage = await iterator.getLastPage();
		expect(lastPage).to.be.greaterThan(0);
	});

	it("should return current position as 0 because of rewind ", async () => {
		for await (const record of iterator) { const a = 1;}
		const lastPage = await iterator.getLastPage();
		expect(iterator.position).to.be.equal(iterator.total - (lastPage - 1) * 100);
		await iterator.rewind();
		expect(iterator.position).to.be.equal(0);
		const currentRecord = await iterator.current();
		expect(currentRecord).to.be.eql(expectedFirstRecord.value);
	});

	it("should not allow to get_page_data of the same page", async () => {
		const firstArray = await iterator.getPageData(1);
		const secondArray = await iterator.getPageData(1);

		expect(firstArray).to.deep.equal(secondArray);
	});
	/*
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

	 */
});

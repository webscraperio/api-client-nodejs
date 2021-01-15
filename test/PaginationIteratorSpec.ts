import {Client} from "../src/Client";
import {expect} from "chai";
import {beforeEach} from "mocha";
import {PaginationIterator} from "../src/PaginationIterator";
import {IGetSitemapsResponse} from "../src/interfaces/IGetSitemapsResponse";

const apiToken: string = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";
let iterator: PaginationIterator<IGetSitemapsResponse>;
const client = new Client({
	token: apiToken,
	baseUri: "https://api.webscraper.io/api/v1/",
});

const expectedFirstRecord = {
	done: false,
	value: {
		id: 415221,
		name: "1610955394444",
	},
};

describe("Pagination iterator", () => {

	beforeEach(async () => {
		iterator = await client.getSitemaps();
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
		let i = 0;
		for await (const records of iterator) {
			if (i++ === 110)
				break;

		}
		const key = await iterator.key();
		expect(key).to.be.equal(111);
	});

	it("should return last page number", async () => {
		const lastPage = await iterator.getLastPage();
		expect(lastPage).to.be.equal(2);
	});

	it("should return current position as 0 because of rewind ", async () => {
		for await (const record of iterator) { const a = 1;}
		expect(iterator.position).to.be.equal(27);
		await iterator.rewind();
		expect(iterator.position).to.be.equal(0);
		const currentRecord = await iterator.current();
		expect(currentRecord).to.be.eql(expectedFirstRecord.value);
	});
});

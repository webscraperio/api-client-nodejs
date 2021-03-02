import {expect} from "chai";
import {Client} from "../../src/Client";
import {ICreateSitemapResponse} from "../../src/interfaces/ICreateSitemapResponse";
import {IGetSitemapResponse} from "../../src/interfaces/IGetSitemapResponse";

const apiToken: string = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";

const client = new Client({
	token: apiToken,
	useBackoffSleep: true,
});

let sitemap: string;
let createSitemapResponse: ICreateSitemapResponse;

describe("API Client", () => {

	afterEach(async () => {
		if (createSitemapResponse) {
			const deleteAfterEachSitemapResponse: string = await client.deleteSitemap(createSitemapResponse.id);
			expect(deleteAfterEachSitemapResponse).to.be.equal("ok");
		}
		createSitemapResponse = undefined;
	});

	it("should throw an error when creating a sitemap", async () => {
		const time = Date.now();
		sitemap = `{"_id":"${time}","sta[thisisamistake]rtUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"abc","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
		let errorThrown: boolean = false;
		const expectedError: string = "{\"success\":false,\"validationErrors\":{\"sitemap_object\":[\"Sitemap has a suspicious attribute somewhere.\"],\"sitemap_object.startUrl\":[\"The sitemap object.start url field is required.\"]}}";
		const fullExpectedError: string = `Error: Web Scraper API Exception: ${expectedError}`;
		try {
			await client.createSitemap(sitemap);
		} catch (e) {
			expect(fullExpectedError).to.equal(e.toString());
			errorThrown = true;
		}
		expect(errorThrown).to.be.true;
	});

	// skip
	it.skip("should not throw an error, use backoffSleep system to finish all requests", async () => {
		const time = Date.now();
		sitemap = `{"_id":"${time}","startUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"abc","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
		createSitemapResponse = await client.createSitemap(sitemap);
		let getSitemapResponse: IGetSitemapResponse;
		let errorThrown: boolean = false;
		try {
			for (let i = 0; i < 205; i++) {
				getSitemapResponse = await client.getSitemap(createSitemapResponse.id);
			}
		} catch (e) {
			errorThrown = true;
		}
		expect(errorThrown).to.be.false;
		expect(getSitemapResponse.id).to.be.equal(createSitemapResponse.id);
		expect(getSitemapResponse.sitemap).to.be.eql(sitemap);
	});
});

import {expect} from "chai";
import {Client} from "../src/Client";
import {ICreateSitemapResponse} from "../src/interfaces/ICreateSitemapResponse";

const apiToken: string = "kb3GZMBfRovH69RIDiHWB4GiDeg3bRgEdhDMYLJ9bcGY9PoMXl9Xf5ip4ro8";

const client = new Client({
	token: apiToken,
	baseUri: "https://api.webscraper.io/api/v1/",
});

let sitemap: string;
let createSitemapResonse: ICreateSitemapResponse;

describe("API Client", () => {

	beforeEach(() => {
		const time = Date.now();
		sitemap = `{"_id":"${time}","sta[thisisamistake]rtUrl":["https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"],"selectors":[{"id":"element","type":"SelectorElement","parentSelectors":["_root"],"selector":"div.col-sm-4","multiple":true,"delay":0},{"id":"product_name","type":"SelectorText","parentSelectors":["element"],"selector":"abc","multiple":false,"regex":"","delay":0},{"id":"product_price","type":"SelectorText","parentSelectors":["element"],"selector":"h4.pull-right","multiple":false,"regex":"","delay":0}]}`;
	});

	afterEach(async () => {
		if (createSitemapResonse) {
			const deleteAfterEachSitemapResponse: string = await client.deleteSitemap(createSitemapResonse.id);
			expect(deleteAfterEachSitemapResponse).to.be.equal("ok");
		}
		createSitemapResonse = undefined;
	});

	it("should throw an error when creating a sitemap", async () => {
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

});

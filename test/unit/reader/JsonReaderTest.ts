import {JsonReader} from "../../../src/reader/JsonReader";
import {expect} from "chai";
import fs = require("fs");

// create directory
if (!fs.existsSync("./tmp")) {
	fs.mkdirSync("./tmp");
}

describe("Json file reader", () => {

	it("should fetch rows", async () => {

		const outputFile = "./tmp/outputfile.json";
		const data = '{ "hello": "WebScraper"}\n{ "hello": "newLine"}\n{ "hello": "anotherNewLine"}';
		fs.writeFileSync(outputFile, data);

		const rowsExpected = [{hello: "WebScraper"}, {hello: "newLine"}, {hello: "anotherNewLine"}];
		const reader: any = new JsonReader(outputFile);
		const rows = await reader.toArray();

		expect(rows).to.be.eql(rowsExpected);
		fs.unlinkSync(outputFile);
		expect(fs.existsSync(outputFile)).to.not.be.true;
	});

	it("should fetch empty file", async () => {

		const outputFile = "./tmp/outputfile.json";
		const data = "";
		fs.writeFileSync(outputFile, data);

		const rowsExpected: any[] = [];
		const reader = new JsonReader(outputFile);
		const rows = await reader.toArray();

		expect(rows).to.be.eql(rowsExpected);
		fs.unlinkSync(outputFile);
		expect(fs.existsSync(outputFile)).to.not.be.true;
	});

});

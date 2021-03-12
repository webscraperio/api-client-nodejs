import * as fs from "fs";
import * as readline from "readline";

export class JsonReader {

	private filePath: string;

	constructor(filePath: string) {
		this.filePath = filePath;
	}

	// tslint:disable-next-line:no-async-without-await
	private async* fetchRows<T>(): AsyncGenerator<T> {
		const filePath = this.filePath;
		const fileStream = fs.createReadStream(filePath);
		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity,
		});
		for await (const line of rl) {
			const lineObj = JSON.parse(line);
			yield lineObj;
		}
		rl.close();
	}

	public async toArray<T>(): Promise<T[]> {
		const rows = [];
		for await (const line of this.fetchRows<T>()) {
			rows.push(line);
		}
		return rows;
	}
}

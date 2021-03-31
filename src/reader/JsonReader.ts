import * as fs from "fs";
import * as readline from "readline";
import {Interface} from "readline";

export class JsonReader {
	private readonly rl: Interface;

	constructor(filePath: string) {
		const fileStream = fs.createReadStream(filePath);
		this.rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity,
		});
	}

	// tslint:disable-next-line:no-async-without-await
	public async* fetchRows<T>(): AsyncGenerator<T> {
		for await (const line of this.rl) {
			const lineObj = JSON.parse(line);
			yield lineObj;
		}
		this.rl.close();
	}

	public async toArray<T>(): Promise<T[]> {
		const rows = [];
		for await (const line of this.fetchRows<T>()) {
			rows.push(line);
		}
		return rows;
	}
}

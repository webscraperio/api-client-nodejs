import http = require("https");
import url = require("url");
import {IOptions} from "./interfaces/IOptions";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import * as fs from "fs";

export class HttpClient {

	private token: string;

	private baseUri: string;

	constructor(options: IOptions) {
		this.token = options.token;
		this.baseUri = options.baseUri;

		// 	$this->useBackoffSleep = isset($options['use_backoff_sleep']) ? $options['use_backoff_sleep'] : true;
		// this.useBackoffSleep = true;

		// if(isset(options.base_uri) && options.base_uri) {
		// 	baseUri = options.base_uri;
		// }

		// šeit jātaisa http clients kurā būs nodejs
	}

	private async request<TDataStyle>(method: string, uri: string, data?: string): Promise<IWebScraperResponse<TDataStyle>> {

		const response: IWebScraperResponse<TDataStyle> = await this.requestRaw(method, uri, data);

		if (!response.success) {
			throw Error;
		}
		const degbug = 1;
		return response;
	}

	public async get<TDataStyle>(uri: string): Promise<IWebScraperResponse<TDataStyle>> {
		const response: IWebScraperResponse<TDataStyle> = await this.request("GET", uri);
		return response;
	}

	public async post<TDataStyle>(uri: string, data: string): Promise<IWebScraperResponse<TDataStyle>> {
		const response: IWebScraperResponse<TDataStyle> = await this.request("POST", uri, data);
		return response;
	}

	public async put<TDataStyle>(uri: string, data: string): Promise<IWebScraperResponse<TDataStyle>> {
		const response: IWebScraperResponse<TDataStyle> = await this.request("PUT", uri, data);
		return response;
	}

	public async delete<TDataStyle>(uri: string): Promise<IWebScraperResponse<TDataStyle>> {
		const response: IWebScraperResponse<TDataStyle> = await this.request("DELETE", uri);
		return response;
	}

	// Promise<IWebScraperResponse<TDataStyle>>
	public requestRaw<TDataStyle>(method: any, uri: string, data?: any): Promise<IWebScraperResponse<TDataStyle>> {
		const ggeg = 1;
		const usedMethod = method;
		let usedHeaders;
		let Data = data;

		if (data === undefined) {
			usedHeaders = {
				"Accept": "application/json, text/javascript, */*",
				"User-Agent": "WebScraper.io PHP SDK v1.0",
				// "Content-disposition": "attachment; filename=./data/outputfile.json",
				// "Content-Type": "application//json",
			};
			Data = "";
		} else {
			usedHeaders = {
				"Accept": "application/json, text/javascript, */*",
				"User-Agent": "WebScraper.io PHP SDK v1.0",
				"Content-Type": "application//json",
				// "Accept-Encoding": "gzip",
				"Content-Length": Buffer.byteLength(Data),
				// "Content-disposition": "attachment; filename=./data/outputfile.json",
			};
		}

		const requestUrl = url.parse(url.format({
			protocol: "https",
			hostname: "api.webscraper.io",
			pathname: `/api/v1/${uri}`,
			query: {
				api_token: this.token,
			},
		}));

		const options = {
			hostname: requestUrl.hostname,
			timeout: 600.0, // 5
			path: requestUrl.path,
			method: usedMethod,
			headers: usedHeaders,
		};

		return new Promise(resolve => {

			// 	const req = http.request(options, res => {
			// 		const fefef = 1;
			// 		if (res.statusCode !== 200) {
			// 			throw Error;
			// 		}
			//
			// 		const file = fs.createWriteStream("./data/outputfile.json");
			// 		res.pipe(file);
			// 		// res.setEncoding("utf8");
			// 		const body = "";
			// 		//
			// 		// res.on("data", (chunk) => {
			// 		// 	body += chunk;
			// 		// });
			// 		//
			// 		// res.on("end", () => {
			// 		//
			// 		//
			// 		// 	fs.writeFile("./data/outputfile.json", body, () => {
			// 		// 		if (Error) throw Error;
			// 		// 	});
			// 		//
			// 		// 	resolve(JSON.parse(body));
			// 	});
			// 	// req.write(Data);
			// 	req.end();
			// });

			const file = fs.createWriteStream("./data/outputfile.json");
			const request = http.get(options, (response) => {
				response.pipe(file);
			});

		}

	}
import http = require("https");
import url = require("url");
import {IOptions} from "./interfaces/IOptions";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import * as fs from "fs";
import {WriteStream} from "fs";

interface IRequestRawOptions {
	url: string;
	method: string;
	saveTo?: string;
	data?: any;
}

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

		const response: IWebScraperResponse<TDataStyle> = await this.requestRaw({
			url: uri,
			method,
			data,
		});

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

	public requestRaw<TDataStyle>(requestOptions: IRequestRawOptions): Promise<IWebScraperResponse<TDataStyle>> {

		const uri = requestOptions.url;
		const usedMethod = requestOptions.method;

		let usedHeaders; // : { [s: string]: string}

		if (requestOptions.data) {
			usedHeaders = {
				"Accept": "application/json, text/javascript, */*",
				"User-Agent": "WebScraper.io PHP SDK v1.0",
				"Content-Type": "application//json",
				"Content-Length": Buffer.byteLength(requestOptions.data),
			};
		} else {
			usedHeaders = {
				"Accept": "application/json, text/javascript, */*",
				"User-Agent": "WebScraper.io PHP SDK v1.0",
			};
			requestOptions.data = "";
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

		return new Promise( (resolve, reject )=> {

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

			let file:  WriteStream;
			if (requestOptions.saveTo) {
				file = fs.createWriteStream(requestOptions.saveTo);
			}
			const request = http.request(options, (response) => {

				if (requestOptions.saveTo) {

					response.pipe(file);

					file.on("finish", () => {
						file.close();
						resolve(undefined);
					});

				} else {

					let responseData: string = "";

					response.setEncoding("utf8");
					response.on("data", (chunk) => {
						responseData += chunk;
					});

					response.on("end", () => {

						const dataObj = JSON.parse(responseData);

						resolve(dataObj);

						const a  = 1;
					});
				}
			});
			request.write(requestOptions.data);
			request.end();
		});

	}
}
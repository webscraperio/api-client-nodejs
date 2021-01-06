import https = require("https");
import url = require("url");

import {IOptions} from "./interfaces/IOptions";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import getError = Mocha.utils.getError;
import * as querystring from "querystring";

export class HttpClient {

	private token: string;

	private baseUri: string;

	constructor(options: IOptions) {
		this.token = options.token;
		this.baseUri =  options.baseUri;

		// 	$this->useBackoffSleep = isset($options['use_backoff_sleep']) ? $options['use_backoff_sleep'] : true;
		// this.useBackoffSleep = true;

		// if(isset(options.base_uri) && options.base_uri) {
		// 	baseUri = options.base_uri;
		// }

		// šeit jātaisa http clients kurā būs nodejs
	}

	private async request<TDataStyle>(method: string, uri: string, data?: string): Promise<IWebScraperResponse<TDataStyle>> {

		const response:IWebScraperResponse<TDataStyle> = await this.requestRaw(method, uri, data);
		if (!response.success) {
			throw Error;
		}
		const degbug = 1;
		return response;
	}

	// public get<TDataStyle>(uri: string): IWebScraperResponse<TDataStyle> {
	// 	const response: IWebScraperResponse<TDataStyle> = this.request("GET", uri);
	// 	return response;
	// }

	public async get<TDataStyle>(uri: string): Promise<IWebScraperResponse<TDataStyle>> {
		const response: IWebScraperResponse<TDataStyle> = await this.request("GET", uri);
		return response;
	}

	public post(uri: string, data: string): void {
		const response =  this.request("POST", uri, data);
	}

	public put(uri: string, data : string): void {
		const response =  this.request("PUT", uri, data);
	}

	public delete(uri: string): void {
		const response =  this.request("DELETE", uri);
	}

	public requestRaw<TDataStyle>(method: any, uri: string, data?: any ): Promise<IWebScraperResponse<TDataStyle>> {

		const usedMethod = method;
		let usedHeaders;
		let Data = data;

		if (data === undefined) {
			usedHeaders	= {
				"Accept": "application/json, text/javascript, */*",
				"User-Agent": "WebScraper.io PHP SDK v1.0",
			};
			Data = "";
			} else {
				usedHeaders	= {
					"Accept": "application/json, text/javascript, */*",
					"User-Agent": "WebScraper.io PHP SDK v1.0",
					"Content-Type": "application//json",
					"Content-Length": Buffer.byteLength(Data),
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
			timeout: 5.0,
			path: requestUrl.path,
			method: usedMethod,
			headers: usedHeaders,
		};

			return new Promise(resolve => {
				const req = https.request(options, res => {
					res.setEncoding("utf8");
				});

				req.on("response", response => {
					let body = "";
					response.on("data", chunk => {
						body += chunk;
					});
					response.on("end",  () => {
						resolve(JSON.parse(body));
					});
				});
				req.end();
			} );
	}

}
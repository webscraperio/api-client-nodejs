import http = require("https");
import url = require("url");
import {IOptions} from "./interfaces/IOptions";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import {IRequestOptions} from "./interfaces/IRequestOptions";
import * as fs from "fs";
import {sleep} from "./Sleep";

interface IHttpRequestOptions {
	hostname: string;
	timeout: number;
	path: string;
	method: string;
	headers: { [s: string]: string | number };
}

export class HttpClient {

	private token: string;

	private baseUri: string;

	private useBackoffSleep: boolean;

	constructor(options: IOptions) {
		this.token = options.token;
		this.baseUri = options.baseUri;
		this.useBackoffSleep = !!options.useBackoffSleep;
	}

	public async request<TData>(requestOptions: IRequestOptions): Promise<IWebScraperResponse<TData>> {

		try {
			const response: IWebScraperResponse<TData> = await this.requestRaw({
				method: requestOptions.method,
				url: requestOptions.url,
				data: requestOptions.data,
				query: requestOptions.query,
			});
			return response;
		} catch (e) {
			throw new Error(`Web Scraper API Exception: ${e}`);
		}
	}

	public async get<TData>(uri: string): Promise<IWebScraperResponse<TData>> {
		const response: IWebScraperResponse<TData> = await this.request({
			url: uri,
			method: "GET",
		});
		return response;
	}

	public async post<TData>(uri: string, data: string): Promise<IWebScraperResponse<TData>> {
		const response: IWebScraperResponse<TData> = await this.request({
			url: uri,
			method: "POST",
			data,
		});
		return response;
	}

	public async put<TData>(uri: string, data: string): Promise<IWebScraperResponse<TData>> {
		const response: IWebScraperResponse<TData> = await this.request({
			url: uri,
			method: "PUT",
			data,
		});
		return response;
	}

	public async delete<TData>(uri: string): Promise<IWebScraperResponse<TData>> {
		const response: IWebScraperResponse<TData> = await this.request({
			url: uri,
			method: "DELETE",
		});
		return response;
	}

	public async requestRaw<TData>(options: IRequestOptions): Promise<IWebScraperResponse<TData>> {

		let headers: { [s: string]: string | number } = {
			"Accept": "application/json, text/javascript, */*",
			"User-Agent": "WebScraper.io PHP SDK v1.0",
		};

		if (options.data) {
			headers = {
				...headers,
				"Content-Type": "application//json",
				"Content-Length": Buffer.byteLength(options.data),
			};
		}

		let query = {
			api_token: this.token,
		};

		if (options.query) {
			query = {
				...query,
				...options.query,
			};
		}

		const requestUrl = url.parse(url.format({
			protocol: "https",
			hostname: "api.webscraper.io",
			pathname: `/api/v1/${options.url}`,
			query,
		}));

		const requestOptions = {
			hostname: requestUrl.hostname,
			timeout: 600.0,
			path: requestUrl.path,
			method: options.method,
			headers,
		};

		const response = await this.backOffRequest(requestOptions, options);

		if (response && response.success !== true) {
			throw (response);
		}

		return response;
	}

	public async backOffRequest<TData>(requestOptions: IHttpRequestOptions, options: IRequestOptions): Promise<any> {
		const allowedAttempts = this.useBackoffSleep ? 3 : 1;
		let attempt = 1;
		let file: fs.WriteStream;

		do {
			try {
				return await new Promise((resolve, reject) => {
						if (options.saveTo) {
							file = fs.createWriteStream(options.saveTo);
						}
						const request = http.request(requestOptions, (response) => {

							let responseData: string = "";
							response.on("data", (chunk) => {
								responseData += chunk;
							});

							response.on("end", () => {
								let dataObj: IWebScraperResponse<TData>;
								try {
									dataObj = JSON.parse(responseData);
									if (!dataObj.success) {
										reject({response, responseData});
									}
								} catch {
									if (options.saveTo) {
										file.write(responseData);
										file.end();
									}
								}
								resolve(dataObj);
							});
						});
						if (options.data) {
							request.write(options.data);
						}
						request.on("error", (e) => {
							if (options.saveTo) {
								file.end();
							}
							reject(e);
						});
						request.end();
					}
				);
			} catch (e) {
				const statusCode = e.response.statusCode;
				if (attempt === allowedAttempts || statusCode !== 429) {
					throw (e.responseData);
				}
				const retry = e.response.headers["retry-after"];
				if (retry) {
					await sleep((retry * 1000) + 1000);
				}
			}
			attempt++;
		} while (attempt <= allowedAttempts);
	}
}
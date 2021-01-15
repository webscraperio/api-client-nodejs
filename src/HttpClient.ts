import http = require("https");
import url = require("url");
import {IOptions} from "./interfaces/IOptions";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import {IRequestOptions} from "./interfaces/IRequestOptions";
import * as fs from "fs";

export class HttpClient {

	private token: string;

	private baseUri: string;

	constructor(options: IOptions) {
		this.token = options.token;
		this.baseUri = options.baseUri;
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

	public requestRaw<TData>(options: IRequestOptions): Promise<IWebScraperResponse<TData>> {

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

		return new Promise((resolve, reject) => {

				const request = http.request(requestOptions, (response) => {
					if (options.saveTo) {
						const file = fs.createWriteStream(options.saveTo);

						response.pipe(file);

						file.on("finish", () => {
							file.close();
						});

					}

					let responseData: string = "";

					response.on("data", (chunk) => {
						responseData += chunk;
					});

					response.on("end", () => {
						let dataObj: IWebScraperResponse<TData>;
						try {
							dataObj = JSON.parse(responseData);
							if (!dataObj.success)
								reject(responseData);
						} catch {
							resolve(undefined);
						}
						resolve(dataObj);
					});
				});
				if (options.data) {
					request.write(options.data);
				}
				request.on("error", (e) => {
					reject(e);
				});
				request.end();
			}
		);

	}
}
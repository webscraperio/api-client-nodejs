import http = require("https");
import url = require("url");
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import {IRequestOptions} from "./interfaces/IRequestOptions";
import * as fs from "fs";
import {sleep} from "./Sleep";
import {IHttpRequestOptions} from "./interfaces/IHttpRequestOptions";
import {IClientOptions} from "./interfaces/IClientOptions";

export class HttpClient {

	private token: string;

	private useBackoffSleep: boolean;

	constructor(options: IClientOptions) {
		this.token = options.token;
		this.useBackoffSleep = options.useBackoffSleep === false ? false : true;
	}

	public async request<TData>(options: IRequestOptions): Promise<IWebScraperResponse<TData>> {
		for (let attempt = 1; attempt <= this.allowedAttempts(); attempt++) {
			try {
				if (options.saveTo) {
					return await this.dataDownloadRequest(options);
				} else {
					return await this.regularRequest(options);
				}
			} catch (e) {
				const statusCode = e.response.statusCode;
				if (attempt === this.allowedAttempts() || statusCode !== 429) {
					throw new Error(`Web Scraper API Exception: ${e.responseData}`);
				}
				const retry = e.response.headers["retry-after"];
				if (retry) {
					await sleep((retry * 1000) + 1000);
				}
			}
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

	private async regularRequest<TData>(options: IRequestOptions): Promise<IWebScraperResponse<TData>> {
		return new Promise((resolve, reject) => {
			const request = http.request(this.getRequestOptions(options), (response) => {
				let responseData: string = "";
				response.on("data", (chunk) => {
					responseData += chunk;
				});

				response.on("end", () => {
					const dataObj: IWebScraperResponse<TData> = JSON.parse(responseData);
					if (!dataObj.success) {
						reject({response, responseData});
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
		});
	}

	private async dataDownloadRequest<TData>(options: IRequestOptions): Promise<IWebScraperResponse<TData>> {
		return new Promise((resolve, reject) => {
			let file: fs.WriteStream;
			file = fs.createWriteStream(options.saveTo);
			const request = http.request(this.getRequestOptions(options), (response) => {

				response.pipe(file);

				response.on("end", () => {
					file.close();
					if (response.statusCode !== 200 && options.saveTo) {
						const responseData = fs.readFileSync(options.saveTo, "utf8");
						fs.unlinkSync(options.saveTo);
						reject({response, responseData});
					}
					resolve(undefined);
				});
			});
			request.on("error", (e) => {
				file.close();
				fs.unlinkSync(options.saveTo);
				reject(e);
			});
			request.end();
		});
	}

	private getRequestOptions(options: IRequestOptions): IHttpRequestOptions {
		let headers: { [s: string]: string | number } = {
			"Accept": "application/json, text/javascript, */*",
			"User-Agent": "WebScraper.io NodeJS SDK v1.0", // "WebScraper.io PHP SDK v1.0
		};

		if (options.data) {
			headers = {
				...headers,
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(options.data),
			};
		}
		const requestUrl = url.parse(url.format({
			protocol: "https",
			hostname: "api.webscraper.io",
			pathname: `/api/v1/${options.url}`,
			query: {
				api_token: this.token,
				...options.query,
			},
		}));
		return {
			hostname: requestUrl.hostname,
			timeout: 600.0,
			path: requestUrl.path,
			method: options.method,
			headers,
		};
	}

	private allowedAttempts(): number {
		return this.useBackoffSleep ? 3 : 1;
	}
}

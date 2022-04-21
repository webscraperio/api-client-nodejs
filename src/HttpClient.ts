import http = require("https");
import {WebScraperResponse} from "./interfaces/WebScraperResponse";
import {RequestOptions} from "./interfaces/RequestOptions";
import * as fs from "fs";
import {sleep} from "./Sleep";
import {HttpRequestOptions} from "./interfaces/HttpRequestOptions";
import {ClientOptions} from "./interfaces/ClientOptions";
import {RequestOptionsQuery} from "./interfaces/RequestOptionsQuery";

export class HttpClient {

	private readonly token: string;

	private readonly useBackoffSleep: boolean;

	constructor(options: ClientOptions) {

		this.token = options.token;
		this.useBackoffSleep = options.useBackoffSleep !== false;
	}

	public async request<TData>(options: RequestOptions): Promise<WebScraperResponse<TData>> {

		for (let attempt = 1; attempt <= this.allowedAttempts(); attempt++) {
			try {
				if (options.saveTo) {
					return await this.dataDownloadRequest(options);
				} else {
					return await this.regularRequest(options);
				}
			} catch (e) {
				if (!e.response) {
					throw e;
				}
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

	public async get<TData>(uri: string): Promise<WebScraperResponse<TData>> {

		return this.request({
			url: uri,
			method: "GET",
		});
	}

	public async post<TData>(uri: string, data?: string): Promise<WebScraperResponse<TData>> {

		return this.request({
			url: uri,
			method: "POST",
			data,
		});
	}

	public async put<TData>(uri: string, data: string): Promise<WebScraperResponse<TData>> {

		return this.request({
			url: uri,
			method: "PUT",
			data,
		});
	}

	public async delete<TData>(uri: string): Promise<WebScraperResponse<TData>> {

		return this.request({
			url: uri,
			method: "DELETE",
		});
	}

	private async regularRequest<TData>(options: RequestOptions): Promise<WebScraperResponse<TData>> {

		return new Promise((resolve, reject) => {
			const request = http.request(this.getRequestOptions(options), (response) => {
				let responseData: string = "";
				response.on("data", (chunk) => {
					responseData += chunk;
				});

				response.on("end", () => {
					const dataObj: WebScraperResponse<TData> = JSON.parse(responseData);
					if (!dataObj.success) {
						return reject({response, responseData});
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

	private async dataDownloadRequest<TData>(options: RequestOptions): Promise<WebScraperResponse<TData>> {

		return new Promise((resolve, reject) => {
			let file: fs.WriteStream;
			file = fs.createWriteStream(options.saveTo);
			const request = http.request(this.getRequestOptions(options), (response) => {
				response
					.pipe(file)
					.on("finish", () => {
						file.close();
						if (response.statusCode !== 200 && options.saveTo) {
							const responseData = fs.readFileSync(options.saveTo, "utf8");
							if (fs.existsSync(options.saveTo)) {
								fs.unlinkSync(options.saveTo);
							}
							return reject({response, responseData});
						}
						resolve(undefined);
					})
					.on("error", (error) => {
						file.close();
						if (fs.existsSync(options.saveTo)) {
							fs.unlinkSync(options.saveTo);
						}
						reject({response, error});
					});
			});
			request.on("error", (e) => {
				file.close();
				if (fs.existsSync(options.saveTo)) {
					fs.unlinkSync(options.saveTo);
				}
				reject(e);
			});
			request.end();
		});
	}

	private getRequestOptions(options: RequestOptions): HttpRequestOptions {

		let headers: { [s: string]: string | number } = {
			"Accept": "application/json, text/javascript, */*",
			"User-Agent": "WebScraper.io NodeJS SDK v1.0",
		};

		if (options.data) {
			headers = {
				...headers,
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(options.data),
			};
		}

		const requestUrl = new URL(`https://api.webscraper.io/api/v1/${options.url}`);
		if (options.query) {
			Object.keys(options.query).forEach((key: keyof RequestOptionsQuery) => {
				requestUrl.searchParams.append(key, options.query[key] as unknown as string);
			});
		}
		requestUrl.searchParams.append("api_token", this.token);
		const path = requestUrl.pathname + requestUrl.search;

		return {
			hostname: requestUrl.hostname,
			timeout: 600.0,
			path,
			method: options.method,
			headers,
		};
	}

	private allowedAttempts(): number {

		return this.useBackoffSleep ? 3 : 1;
	}
}

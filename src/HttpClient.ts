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
			const response: IWebScraperResponse<TData> = await this.requestRaw(requestOptions);
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

		const callback = options.saveTo ? this.dataDownloadRequest.bind(this) : this.regularRequest.bind(this);
		const response: IWebScraperResponse<TData> = await this.backOffRequest(callback, options);

		if (response && response.success !== true) {
			throw (response);
		}

		return response;
	}

	public async backOffRequest<TData>(request: (options: IRequestOptions) => Promise<IWebScraperResponse<TData>>, options: IRequestOptions): Promise<any> {
		const allowedAttempts = this.useBackoffSleep ? 3 : 1;
		let attempt = 1;

		do {
			try {
				return await request(options);
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
					if (response.statusCode !== 200 && options.saveTo) {
						const responseData = (fs.readFileSync(options.saveTo, "utf8"));
						fs.unlinkSync(options.saveTo);
						reject({response, responseData});
					}
					file.close();
					resolve(undefined);
				});
			});
			request.on("error", (e) => {
				file.close();
				reject(e);
			});
			request.end();
		});
	}

	private getRequestOptions(options: IRequestOptions): IHttpRequestOptions {
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
}
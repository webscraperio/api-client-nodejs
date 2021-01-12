import http = require("https");
import url = require("url");
import {IOptions} from "./interfaces/IOptions";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import * as fs from "fs";
import {WriteStream} from "fs";
import {IRequestOptions} from "./interfaces/IRequestOptions";

export class HttpClient {

	private token: string;

	private baseUri: string;

	constructor(options: IOptions) {
		this.token = options.token;
		this.baseUri = options.baseUri;
	}

	public async get<TDataStyle>(uri: string): Promise<IWebScraperResponse<TDataStyle>> {
		const response: IWebScraperResponse<TDataStyle> = await this.request(({
			url: uri,
			method: "GET",
		}));
		return response;
	}

	public async post<TDataStyle>(uri: string, data: string): Promise<IWebScraperResponse<TDataStyle>> {
		const response: IWebScraperResponse<TDataStyle> = await this.request(({
			url: uri,
			method: "POST",
			data,
		}));
		return response;
	}

	public async put<TDataStyle>(uri: string, data: string): Promise<IWebScraperResponse<TDataStyle>> {
		const response: IWebScraperResponse<TDataStyle> = await this.request(({
			url: uri,
			method: "PUT",
			data,
		}));
		return response;
	}

	public async delete<TDataStyle>(uri: string): Promise<IWebScraperResponse<TDataStyle>> {
		const response: IWebScraperResponse<TDataStyle> = await this.request(({
			url: uri,
			method: "DELETE",
		}));
		return response;
	}

	public request<TDataStyle>(requestOptions: IRequestOptions): Promise<IWebScraperResponse<TDataStyle>> {

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

		let usedQuery;

		if (requestOptions.query) {
			usedQuery = {
				api_token: this.token,
				page: requestOptions.query.page,
				sitemap_id: requestOptions.query.sitemap_id,
			};
		} else {
			usedQuery = {
				api_token: this.token,
			};
		}

		const requestUrl = url.parse(url.format({
			protocol: "https",
			hostname: "api.webscraper.io",
			pathname: `/api/v1/${uri}`,
			query: usedQuery,
		}));

		const options = {
			hostname: requestUrl.hostname,
			timeout: 600.0, // 5
			path: requestUrl.path,
			method: usedMethod,
			headers: usedHeaders,
		};

		return new Promise( (resolve, reject )=> {

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

						const dataObj: IWebScraperResponse<TDataStyle> = JSON.parse(responseData);
						if (!dataObj.success) {
							throw Error;
						}
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
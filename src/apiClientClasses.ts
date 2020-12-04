import * as request from "request-promise-native";
import {ICreateScrapingJobResponse} from "./interfaces/ICreateScrapingJobResponse";
import {ICreateSiteMapResponse} from "./interfaces/ICreateSiteMapResponse";
import {IGetScrapingJobResponse} from "./interfaces/IGetScrapingJobResponse";
import {IGetJsonResponse} from "./interfaces/IGetJsonResponse";
import {IDeleteSitemap} from "./interfaces/IDeleteSitemap";

export class Client {
	public token: string;

	constructor(token: string) {
		this.token = token;
	}

	public async createSitemap(mySitemap: string): Promise<ICreateSiteMapResponse> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemap?api_token=${this.token}`,
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.parse(mySitemap),
			json: true,
		});
		return response.data;
	}

	public async createScrapingJob(sitemapId: number): Promise<ICreateScrapingJobResponse> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/scraping-job?api_token=${this.token}`,
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: {
				"sitemap_id": sitemapId,
				"driver": "fulljs",
				"page_load_delay": 2000,
				"request_interval": 2000,
			},
			json: true,
		});

		return response.data;
	}

	public async getScrapingJob(scrapingJobId: number): Promise<IGetScrapingJobResponse> {

		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}?api_token=${this.token}`, {json: true}, (err, res, body) => {
			return body;
		});

		return response.data;
	}

	public async getJson(scrapingJobId: number): Promise<IGetJsonResponse> {
		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/json?api_token=${this.token}`, {json: true}, (err, res, body) => {
			return body;
		});
		return response;
	}

	public async deleteSitemap(sitemapId: number): Promise<IDeleteSitemap> {
		const response = await request(`https://api.webscraper.io/api/v1/sitemap/${sitemapId}?api_token=${this.token}`, {json: true}, (err, res, body) => {
			return body;
		});
		return response;
	}
}

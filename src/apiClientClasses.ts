import * as request from "request-promise-native";
import {ICreateScrapingJobResponse} from "./interfaces/ICreateScrapingJobResponse";
import {ICreateSitemapResponse} from "./interfaces/ICreateSitemapResponse";
import {IGetScrapingJobResponse} from "./interfaces/IGetScrapingJobResponse";
import {IGetAccountInfoResponse} from "./interfaces/IGetAccountInfoResponse";
import {IGetSitemapsResponse} from "./interfaces/IGetSitemapsResponse";
import {IGetSitemapResponse} from "./interfaces/IGetSitemapResponse";
import {IGetScrapingJobsResponse} from "./interfaces/IGetScrapingJobsResponse";
import {IGetProblematicUrlsResponse} from "./interfaces/IGetProblematicUrlsResponse";
import {IPaginationResponse} from "./interfaces/IPaginationResponse";
import fs = require("fs");

export class Client {
	public token: string;

	constructor(token: string) {
		this.token = token;
	}

	public async createSitemap(mySitemap: string): Promise<ICreateSitemapResponse> {
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

	public async getSitemap(sitemapId: number): Promise<IGetSitemapResponse> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemap/${sitemapId}?api_token=${this.token}`,
			method: "GET",
			json: true,
		});
		return response.data;
	}

	public async getSitemaps(page: number = 1): Promise <IGetSitemapsResponse[]> {

		const array: IGetSitemapsResponse[] = [];

		let response = await request({
			url: `https://api.webscraper.io/api/v1/sitemaps?api_token=${this.token}&page=${page}`,
			method: "GET",
			json: true,
		}) as IPaginationResponse<IGetSitemapsResponse[]>;

		response.data.forEach(e => array.push(e));
		if (page < response.last_page) {
			page++;
			while (page <= response.last_page) {
				response = await request({
					url: `https://api.webscraper.io/api/v1/sitemaps?api_token=${this.token}&page=${page}`,
					method: "GET",
					json: true,
				}) as IPaginationResponse<IGetSitemapsResponse[]>;
				response.data.forEach(e => array.push(e));
				page++;
			}
		}

		return array;
	}

	public async updateSitemap(sitemapId: number, mySitemap: string): Promise<string> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemap/${sitemapId}?api_token=${this.token}`,
			method: "PUT",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.parse(mySitemap),
			json: true,
		});
		return response.data;
	}

	public async deleteSitemap(sitemapId: number): Promise<string> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemap/${sitemapId}?api_token=${this.token}`,
			method: "DELETE",
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

	public async getScrapingJobs(sitemapId?: number, page: number = 1): Promise<IGetScrapingJobsResponse[]> {

		const array: IGetScrapingJobsResponse[] = [];

		let response = await request({
			url: `https://api.webscraper.io/api/v1/scraping-jobs?api_token=${this.token}&page=${page}&sitemap_id=${sitemapId}`,
			method: "GET",
			json: true,
		}) as IPaginationResponse<IGetScrapingJobsResponse[]>;

		response.data.forEach(e => array.push(e));
		if (page < response.last_page) {
			page++;
			while (page <= response.last_page) {
				response = await request({
					url: `https://api.webscraper.io/api/v1/scraping-jobs?api_token=${this.token}&page=${page}&sitemap_id=${sitemapId}`,
					method: "GET",
					json: true,
				}) as IPaginationResponse<IGetScrapingJobsResponse[]>;
				response.data.forEach(e => array.push(e));
				page++;
			}
		}

		return array;
	}

	public async getJSON(scrapingJobId: number, outputfile: string): Promise<void> {
		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/json?api_token=${this.token}`, {
			json: true,
		}, (err, res, body) => {

			const strLines = body.toString().split("\n");
			let linesToArray = `[${strLines}`;
			linesToArray = linesToArray.replace(/.$/,"]");
			fs.writeFile(`./src/tmp/${outputfile}`, linesToArray, () => {
				if (err) throw err;});
		});
	}

	public async getCSV(scrapingJobId: number, outputfile: string): Promise<void> {
		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/csv?api_token=${this.token}`, (err, res, body) => {

			fs.writeFile(`./src/tmp/${outputfile}`, body, () => {
				if (err) throw err;});
		});
	}

	public async getProblematicUrls(scrapingJobId: number, page: number = 1): Promise<IGetProblematicUrlsResponse[]> {

		const array: IGetProblematicUrlsResponse[] = [];

		let response = await request({
			url: `https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/problematic-urls?api_token=${this.token}&page=${page}`,
			method: "GET",
			json: true,
		}) as IPaginationResponse<IGetProblematicUrlsResponse[]>;

		response.data.forEach(e => array.push(e));
		if (page < response.last_page) {
			page++;
			while (page <= response.last_page) {
				response = await request({
					url: `https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/problematic-urls?api_token=${this.token}&page=${page}`,
					method: "GET",
					json: true,
				}) as IPaginationResponse<IGetProblematicUrlsResponse[]>;
				response.data.forEach(e => array.push(e));
				page++;
			}
		}

		return array;
	}

	public async deleteScrapingJob(scrapingJobId: number): Promise<string> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}?api_token=${this.token}`,
			method: "DELETE",
			json: true,
		});
		return response.data;
	}

	public async getAccountInfo(): Promise<IGetAccountInfoResponse> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/account?api_token=${this.token}`,
			method: "GET",
			json: true,
		});
		return response.data;
	}
}

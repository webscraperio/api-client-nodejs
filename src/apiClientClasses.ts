import * as request from "request-promise-native";
import {ICreateScrapingJobResponse} from "./interfaces/ICreateScrapingJobResponse";
import {ICreateSiteMapResponse} from "./interfaces/ICreateSiteMapResponse";
import {IGetScrapingJobResponse} from "./interfaces/IGetScrapingJobResponse";
import {IGetJsonResponse} from "./interfaces/IGetJsonResponse";
import {IDeleteSitemap} from "./interfaces/IDeleteSitemap";
import {IUpdateSiteMapResponse} from "./interfaces/IUpdateSiteMapResponse";
import {IDeleteScrapingJobResponse} from "./interfaces/IDeleteScrapingJobResponse";
import {IGetAccountInfoResponse} from "./interfaces/IGetAccountInfoResponse";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import {IGetSiteMapsResponse} from "./interfaces/IGetSiteMapsResponse";
import {IGetSiteMapResponse} from "./interfaces/IGetSiteMapResponse";
import {IGetScrapingJobsResponse} from "./interfaces/IGetScrapingJobsResponse";
import {IGetCSVResponse} from "./interfaces/IGetCSVResponse";
import {IGetScrapingJobProblResponse} from "./interfaces/IGetScrapingJobProblResponse";
// import {ISendTotalSitemapPagesResponse} from "./interfaces/ISendTotalSitemapPagesResponse";
// import {ISendScrapingJobsTotalPagesResponse} from "./interfaces/ISendScrapingJobsTotalPagesResponse";
// import * as url from "url";

export class Client {
	public token: string;

	constructor(token: string) {
		this.token = token;
	}

	// CREATE SITEMAP
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

	// GET SITEMAP
	// https://api.webscraper.io/api/v1/sitemap/${sitemapId}?api_token=${this.token}
	public async getSitemap(sitemapId: number): Promise<IGetSiteMapResponse> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemap/${sitemapId}?api_token=${this.token}`,
			method: "GET",
			json: true,
		});
		return response.data;
	}

	// GET SITEMAPS
	// Optional query parameters:
	// -page: &page=2
	public async getSitemapsOfPage(page: number = 1): Promise<IGetSiteMapsResponse[]> {

	/*	if(this.page === page) {
			return this.array
		}
	*/
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemaps?api_token=${this.token}&page=${page}`,
			method: "GET",
			json: true,
		}) as IWebScraperResponse<IGetSiteMapsResponse[]>;
		return response.data;
	}
/*
	public async sendSitemapTotalPages(): Promise<ISendTotalSitemapPagesResponse>{
		let response = await request({
			url: `https://api.webscraper.io/api/v1/sitemaps?api_token=${this.token}`,
			method: "GET",
			json: true,
		})
		return response = {"current_page": response.current_page,
							"last_page": response.last_page,
							"total": response.total,
							"per_page": response.per_page,
							};
	}

 */

	// UPDATE SITEMAP
	public async updateSitemap(sitemapId: number, mySitemap: string): Promise<IUpdateSiteMapResponse> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemap/${sitemapId}?api_token=${this.token}`,
			method: "PUT",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.parse(mySitemap),
			json: true,
		});
		return response;
	}

	// DELETE SITEMAP
	public async deleteSitemap(sitemapId: number): Promise<IDeleteSitemap> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemap/${sitemapId}?api_token=${this.token}`,
			method: "DELETE",
			json: true,
		});
		return response;
	}

	// CREATE SCRAPING JOB
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

	// GET SCRAPING JOB
	public async getScrapingJob(scrapingJobId: number): Promise<IGetScrapingJobResponse> {

		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}?api_token=${this.token}`, {json: true}, (err, res, body) => {
			return body;
		});

		return response.data;
	}

	// GET SCRAPING JOBS
	// Optional query parameters:
	// - page: &page=2
	// - sitemap: &sitemap_id=123
	public async getScrapingJobs(page: number = 1, sitemapId?: number): Promise<IGetScrapingJobsResponse[]> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/scraping-jobs?api_token=${this.token}&page=${page}&sitemap_id=${sitemapId}`,
			method: "GET",
			json: true,
		}) as IWebScraperResponse<IGetScrapingJobsResponse[]>;
		return response.data;
	}
/*
	public async sendScrapingJobsTotalPages(): Promise<ISendScrapingJobsTotalPagesResponse>{
		let response = await request({
			url: `https://api.webscraper.io/api/v1/scraping-jobs?api_token=${this.token}`,
			method: "GET",
			json: true,
		})
		return response = {"current_page": response.current_page,
			"last_page": response.last_page,
			"total": response.total,
			"per_page": response.per_page,
		};
	}

 */

	// DOWNLOAD SCRAPED DATA IN JSON
	public async getJson(scrapingJobId: number): Promise<IGetJsonResponse> {
		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/json?api_token=${this.token}`, {json: true}, (err, res, body) => {
			return body;
		});
		return response;
	}

	// DOWNLOAD SCRAPED DATA IN CSV FORMAT
	public async getCSV(scrapingJobId: number): Promise<IGetCSVResponse> {
		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/csv?api_token=${this.token}`, (err, res, body) => {
			return body;
		});
		return response;
	}

	// get scraping job problematic urls
	// Optional query parameters:
	// - page: &page=2
	public async getScrapingJobProbUrl(scrapingJobId: number, page: number = 1): Promise<IGetScrapingJobProblResponse[]> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/problematic-urls?api_token=${this.token}&page=${page}`,
			// qs: {
			// page: number ,
			// },
			method: "GET",
			json: true,
		}) as IWebScraperResponse<IGetScrapingJobProblResponse[]>;
		return response.data;
	}

	// DELETE SCRAPING JOBS
	public async deleteScrapingJob(scrapingJobId: number): Promise<IDeleteScrapingJobResponse> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}?api_token=${this.token}`,
			method: "DELETE",
			json: true,
		});
		return response;
	}

	// GET ACCOUNT INFO
	public async getAccountInfo(): Promise<IGetAccountInfoResponse> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/account?api_token=${this.token}`,
			method: "GET",
			json: true,
		});
		return response.data;
	}

}

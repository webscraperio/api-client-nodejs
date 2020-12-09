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
import {IGetScrapingJobsResponse} from "./interfaces/IGetScrapingJobsResponse"
import {IGetCSVResponse} from "./interfaces/IGetCSVResponse";
import {IGetScrapingJobProblResponse} from "./interfaces/IGetScrapingJobProblResponse";

export class Client {
	public token: string;

	constructor(token: string) {
		this.token = token;
	}

	// CREATE SITEMAP done
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

	// GET SITEMAP .need to test semi-done
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
	// -page: &page=2	:need to add query parameters semi-done
	public async getSitemaps(): Promise<IGetSiteMapsResponse[]> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemaps?api_token=${this.token}`,
			// qs: {
				// page: number ,
			// },
			method: "GET",
			json: true,
		}) as IWebScraperResponse<IGetSiteMapsResponse[]>;
		return response.data;
	}

	// UPDATE SITEMAP .need to test semi-done
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

	// DELETE SITEMAP done
	public async deleteSitemap(sitemapId: number): Promise<IDeleteSitemap> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemap/${sitemapId}?api_token=${this.token}`,
			method: "DELETE",
			json: true,
		});
		return response;
	}

	// CREATE SCRAPING JOB done
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

	// GET SCRAPING JOB done
	public async getScrapingJob(scrapingJobId: number): Promise<IGetScrapingJobResponse> {

		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}?api_token=${this.token}`, {json: true}, (err, res, body) => {
			return body;
		});

		return response.data;
	}


	// GET SCRAPING JOBS
	// Optional query parameters:
	// - page: &page=2
	// - sitemap: &sitemap_id=123	:need to add query parameters semi-done
	public async getScrapingJobs(): Promise<IGetScrapingJobsResponse[]> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/sitemaps?api_token=${this.token}`,
			// qs: {
			// page: number ,
			// sitemapId: number ,
			// },
			method: "GET",
			json: true,
		}) as IWebScraperResponse<IGetScrapingJobsResponse[]>;
		return response.data;
	}

	// DOWNLOAD SCRAPED DATA IN JSON done
	public async getJson(scrapingJobId: number): Promise<IGetJsonResponse> {
		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/json?api_token=${this.token}`, {json: true}, (err, res, body) => {
			return body;
		});
		return response;
	}

	// DOWNLOAD SCRAPED DATA IN CSV FORMAT   not quite sure about this one  -> not done
	public async getCSV(scrapingJobId: number): Promise<IGetCSVResponse> {
		const response = await request(`https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/csv?api_token=${this.token}`, (err, res, body) => {
			return body;
		});
		return response;
	}

	// get scraping job problematic urls
	// Optional query parameters:
	// - page: &page=2 :need to add query parameters semi-done
	public async getScrapingJobProbUrl(scrapingJobId: number): Promise<IGetScrapingJobProblResponse[]> {
		const response = await request({
			url: `https://api.webscraper.io/api/v1/scraping-job/${scrapingJobId}/problematic-urls?api_token=${this.token}`,
			// qs: {
			// page: number ,
			// },
			method: "GET",
			json: true,
		}) as IWebScraperResponse<IGetScrapingJobProblResponse[]>;
		return response.data;
	}

	// DELETE SCRAPING JOBS semi-done
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

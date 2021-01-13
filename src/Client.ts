import {ICreateScrapingJobResponse} from "./interfaces/ICreateScrapingJobResponse";
import {ICreateSitemapResponse} from "./interfaces/ICreateSitemapResponse";
import {IGetScrapingJobResponse} from "./interfaces/IGetScrapingJobResponse";
import {IGetAccountInfoResponse} from "./interfaces/IGetAccountInfoResponse";
import {IGetSitemapResponse} from "./interfaces/IGetSitemapResponse";
import {HttpClient} from "./HttpClient";
import {IOptions} from "./interfaces/IOptions";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import {IPaginationResponse} from "./interfaces/IPaginationResponse";
import {IGetSitemapsResponse} from "./interfaces/IGetSitemapsResponse";
import {IRequestOptions} from "./interfaces/IRequestOptions";
import {IGetScrapingJobsResponse} from "./interfaces/IGetScrapingJobsResponse";
import {IGetProblematicUrlsResponse} from "./interfaces/IGetProblematicUrlsResponse";
import {IScrapingJobConfig} from "./interfaces/IScrapingJobConfig";

export class Client {
	private token: string; // private?
	private httpClient: HttpClient;

	constructor(options: IOptions) {
		this.token = options.token;
		this.httpClient = new HttpClient(options);
	}

	public async createSitemap(sitemap: string): Promise<ICreateSitemapResponse> {
		const response: IWebScraperResponse<ICreateSitemapResponse> = await this.httpClient.post("sitemap", sitemap);
		return response.data;
	}

	public async getSitemap(sitemapId: number): Promise<IGetSitemapResponse> {
		const response: IWebScraperResponse<IGetSitemapResponse> = await this.httpClient.get(`sitemap/${sitemapId}`);
		return response.data;
	}

	public async getSitemaps(page: number = 1): Promise<IGetSitemapsResponse[]> {

		const sitemaps: IGetSitemapsResponse[] = [];

		const response: IWebScraperResponse<IGetSitemapsResponse[]> = await this.httpClient.requestRaw({
			url: "sitemaps",
			method: "GET",
			query: {
				page,
			},
		});

		response.data.forEach(e => sitemaps.push(e));
		// if (page < response.last_page) {
		// 	page++;
		// 	while (page <= response.last_page) {
		// 		 const responseAll_one: IWebScraperResponse<IPaginationResponse<IGetSitemapsResponse[]>> = await this.httpClient.request({
		// 			url: "sitemaps",
		// 			method: "GET",
		// 			page,
		// 		});
		// 		response = responseAll_one.data;
		// 		response.data.forEach(e => array.push(e));
		// 		page++;
		// 	}
		// }

		return sitemaps;
	}

	public async updateSitemap(sitemapId: number, sitemap: string): Promise<string> {
		const response: IWebScraperResponse<string> = await this.httpClient.put(`sitemap/${sitemapId}`, sitemap);
		return response.data;
	}

	public async deleteSitemap(sitemapId: number): Promise<string> {
		const response: IWebScraperResponse<string> = await this.httpClient.delete(`sitemap/${sitemapId}`);
		return response.data;
	}

	public async createScrapingJob(sitemapId: number, scrapingJobConfig: IScrapingJobConfig): Promise<ICreateScrapingJobResponse> {
		const response: IWebScraperResponse<ICreateScrapingJobResponse> = await this.httpClient.post("scraping-job", JSON.stringify(scrapingJobConfig));
		return response.data;
	}

	public async getScrapingJob(scrapingJobId: number): Promise<IGetScrapingJobResponse> {
		const response: IWebScraperResponse<IGetScrapingJobResponse> = await this.httpClient.get(`scraping-job/${scrapingJobId}`);
		return response.data;
	}

	public async getScrapingJobs(sitemapId?: number, page: number = 1): Promise<IGetScrapingJobsResponse[]> {

	const scrapingJobs: IGetScrapingJobsResponse[] = [];

	const response: IWebScraperResponse<IGetScrapingJobsResponse[]> = await this.httpClient.requestRaw({
		url: "scraping-jobs",
		method: "GET",
		query:{
			page,
			sitemap_id: sitemapId,
		},
	});
		response.data.forEach(e => scrapingJobs.push(e));

		return scrapingJobs;
	}

	public async downloadScrapingJobJSON(scrapingJobId: number, fileName: string): Promise<void> {
		await this.httpClient.requestRaw({
			method: "GET",
			url: `scraping-job/${scrapingJobId}/json`,
			saveTo: fileName,
		});
	}

	public async downloadScrapingJobCSV(scrapingJobId: number, fileName: string): Promise<void> {
		await this.httpClient.requestRaw({
			method: "GET",
			url: `scraping-job/${scrapingJobId}/csv`,
			saveTo: fileName,
		});
	}

	public async getProblematicUrls(scrapingJobId: number, page: number = 1): Promise<IGetProblematicUrlsResponse[]> {

		const problematicUrls: IGetProblematicUrlsResponse[] = [];

		const response: IWebScraperResponse<IGetProblematicUrlsResponse[]> = await this.httpClient.requestRaw({
			url: `scraping-job/${scrapingJobId}/problematic-urls`,
			method: "GET",
			query: {
				page,
			},
		});

		response.data.forEach(e => problematicUrls.push(e));
		return problematicUrls;
	}

	public async deleteScrapingJob(scrapingJobId: number): Promise<string> {
		const response: IWebScraperResponse<string> = await this.httpClient.delete(`scraping-job/${scrapingJobId}`);
		return response.data;
	}

	public async getAccountInfo(): Promise<IGetAccountInfoResponse> {
		const response: IWebScraperResponse<IGetAccountInfoResponse> = await this.httpClient.get("account");
		return response.data;
	}
}

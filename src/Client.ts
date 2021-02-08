import {ICreateScrapingJobResponse} from "./interfaces/ICreateScrapingJobResponse";
import {ICreateSitemapResponse} from "./interfaces/ICreateSitemapResponse";
import {IGetScrapingJobResponse} from "./interfaces/IGetScrapingJobResponse";
import {IGetAccountInfoResponse} from "./interfaces/IGetAccountInfoResponse";
import {IGetSitemapResponse} from "./interfaces/IGetSitemapResponse";
import {HttpClient} from "./HttpClient";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import {IScrapingJobConfig} from "./interfaces/IScrapingJobConfig";
import {PaginationIterator} from "./PaginationIterator";
import {IGetProblematicUrlsResponse} from "./interfaces/IGetProblematicUrlsResponse";
import {IGetSitemapsResponse} from "./interfaces/IGetSitemapsResponse";
import {IClientOptions} from "./interfaces/IClientOptions";
import {IRequestOptionsQuery} from "./interfaces/IRequestOptionsQuery";

export class Client {
	private token: string;
	private httpClient: HttpClient;

	constructor(options: IClientOptions) {
		this.token = options.token;
		this.httpClient = new HttpClient({
			token: this.token,
			useBackoffSleep: options.useBackoffSleep,
		});
	}

	public async createSitemap(sitemap: string): Promise<ICreateSitemapResponse> {
		const response: IWebScraperResponse<ICreateSitemapResponse> = await this.httpClient.post("sitemap", sitemap);
		return response.data;
	}

	public async getSitemap(sitemapId: number): Promise<IGetSitemapResponse> {
		const response: IWebScraperResponse<IGetSitemapResponse> = await this.httpClient.get(`sitemap/${sitemapId}`);
		return response.data;
	}

	public async getSitemaps(): Promise<PaginationIterator<IGetSitemapsResponse>> {
		const iterator = new PaginationIterator<IGetSitemapsResponse>(this.httpClient, "sitemaps");
		return iterator;
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

	public async getScrapingJobs(query?: IRequestOptionsQuery): Promise<PaginationIterator<IGetScrapingJobResponse>> {
		const iterator = new PaginationIterator<IGetScrapingJobResponse>(this.httpClient, "scraping-jobs", query);
		return iterator;
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

	public async getProblematicUrls(scrapingJobId: number): Promise<PaginationIterator<IGetProblematicUrlsResponse>> {
		const iterator = new PaginationIterator<IGetProblematicUrlsResponse>(this.httpClient, `scraping-job/${scrapingJobId}/problematic-urls`);
		return iterator;
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

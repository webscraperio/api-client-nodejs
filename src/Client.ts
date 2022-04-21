import {CreateScrapingJobResponse} from "./interfaces/CreateScrapingJobResponse";
import {CreateSitemapResponse} from "./interfaces/CreateSitemapResponse";
import {GetScrapingJobResponse} from "./interfaces/GetScrapingJobResponse";
import {GetAccountInfoResponse} from "./interfaces/GetAccountInfoResponse";
import {GetSitemapResponse} from "./interfaces/GetSitemapResponse";
import {HttpClient} from "./HttpClient";
import {WebScraperResponse} from "./interfaces/WebScraperResponse";
import {ScrapingJobConfig} from "./interfaces/ScrapingJobConfig";
import {GetProblematicUrlsResponse} from "./interfaces/GetProblematicUrlsResponse";
import {GetSitemapsResponse} from "./interfaces/GetSitemapsResponse";
import {ClientOptions} from "./interfaces/ClientOptions";
import {RequestOptionsQuery} from "./interfaces/RequestOptionsQuery";
import {PaginationGenerator} from "./PaginationGenerator";
import {GetScrapingJobDataQualityResponse} from "./interfaces/GetScrapingJobDataQualityResponse";
import {SitemapSchedulerConfig} from "./interfaces/SitemapSchedulerConfig";
import {SitemapSchedulerConfigResponse} from "./interfaces/SitemapSchedulerConfigResponse";

export class Client {

	private readonly token: string;

	private readonly httpClient: HttpClient;

	constructor(options: ClientOptions) {

		this.token = options.token;
		this.httpClient = new HttpClient({
			token: this.token,
			useBackoffSleep: options.useBackoffSleep,
		});
	}

	public async createSitemap(sitemap: string): Promise<CreateSitemapResponse> {

		const response: WebScraperResponse<CreateSitemapResponse> = await this.httpClient.post("sitemap", sitemap);
		return response.data;
	}

	public async getSitemap(sitemapId: number): Promise<GetSitemapResponse> {

		const response: WebScraperResponse<GetSitemapResponse> = await this.httpClient.get(`sitemap/${sitemapId}`);
		return response.data;
	}

	public async getSitemaps(): Promise<PaginationGenerator<GetSitemapsResponse>> {

		return new PaginationGenerator<GetSitemapsResponse>(this.httpClient, "sitemaps");
	}

	public async updateSitemap(sitemapId: number, sitemap: string): Promise<string> {

		const response: WebScraperResponse<string> = await this.httpClient.put(`sitemap/${sitemapId}`, sitemap);
		return response.data;
	}

	public async deleteSitemap(sitemapId: number): Promise<string> {

		const response: WebScraperResponse<string> = await this.httpClient.delete(`sitemap/${sitemapId}`);
		return response.data;
	}

	public async createScrapingJob(scrapingJobConfig: ScrapingJobConfig): Promise<CreateScrapingJobResponse> {

		const response: WebScraperResponse<CreateScrapingJobResponse> = await this.httpClient.post("scraping-job", JSON.stringify(scrapingJobConfig));
		return response.data;
	}

	public async getScrapingJob(scrapingJobId: number): Promise<GetScrapingJobResponse> {

		const response: WebScraperResponse<GetScrapingJobResponse> = await this.httpClient.get(`scraping-job/${scrapingJobId}`);
		return response.data;
	}

	public async getScrapingJobs(query?: RequestOptionsQuery): Promise<PaginationGenerator<GetScrapingJobResponse>> {

		return new PaginationGenerator<GetScrapingJobResponse>(this.httpClient, "scraping-jobs", query);
	}

	public async downloadScrapingJobJSON(scrapingJobId: number, fileName: string): Promise<void> {

		await this.httpClient.request({
			method: "GET",
			url: `scraping-job/${scrapingJobId}/json`,
			saveTo: fileName,
		});
	}

	public async downloadScrapingJobCSV(scrapingJobId: number, fileName: string): Promise<void> {

		await this.httpClient.request({
			method: "GET",
			url: `scraping-job/${scrapingJobId}/csv`,
			saveTo: fileName,
		});
	}

	public async getProblematicUrls(scrapingJobId: number): Promise<PaginationGenerator<GetProblematicUrlsResponse>> {

		return new PaginationGenerator<GetProblematicUrlsResponse>(this.httpClient, `scraping-job/${scrapingJobId}/problematic-urls`);
	}

	public async deleteScrapingJob(scrapingJobId: number): Promise<string> {

		const response: WebScraperResponse<string> = await this.httpClient.delete(`scraping-job/${scrapingJobId}`);
		return response.data;
	}

	public async getAccountInfo(): Promise<GetAccountInfoResponse> {

		const response: WebScraperResponse<GetAccountInfoResponse> = await this.httpClient.get("account");
		return response.data;
	}

	public async getScrapingJobDataQuality(scrapingJobId: number): Promise<GetScrapingJobDataQualityResponse> {

		const response: WebScraperResponse<GetScrapingJobDataQualityResponse> = await this.httpClient.get(`scraping-job/${scrapingJobId}/data-quality`);
		return response.data;
	}

	public async enableSitemapScheduler(sitemapId: number, config: SitemapSchedulerConfig): Promise<string> {

		const response: WebScraperResponse<string> = await this.httpClient.post(`sitemap/${sitemapId}/enable-scheduler`, JSON.stringify(config));
		return response.data;
	}

	public async disableSitemapScheduler(sitemapId: number): Promise<string> {

		const response: WebScraperResponse<string> = await this.httpClient.post(`sitemap/${sitemapId}/disable-scheduler`);
		return response.data;
	}

	public async getSitemapScheduler(sitemapId: number): Promise<SitemapSchedulerConfigResponse> {

		const response: WebScraperResponse<SitemapSchedulerConfigResponse> = await this.httpClient.get(`sitemap/${sitemapId}/scheduler`);
		return response.data;
	}
}

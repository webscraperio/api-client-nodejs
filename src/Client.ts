import {ICreateScrapingJobResponse} from "./interfaces/ICreateScrapingJobResponse";
import {ICreateSitemapResponse} from "./interfaces/ICreateSitemapResponse";
import {IGetScrapingJobResponse} from "./interfaces/IGetScrapingJobResponse";
import {IGetAccountInfoResponse} from "./interfaces/IGetAccountInfoResponse";
import {IGetSitemapResponse} from "./interfaces/IGetSitemapResponse";
import {HttpClient} from "./HttpClient";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";
import {IScrapingJobConfig} from "./interfaces/IScrapingJobConfig";
import {IGetProblematicUrlsResponse} from "./interfaces/IGetProblematicUrlsResponse";
import {IGetSitemapsResponse} from "./interfaces/IGetSitemapsResponse";
import {IClientOptions} from "./interfaces/IClientOptions";
import {IRequestOptionsQuery} from "./interfaces/IRequestOptionsQuery";
import {PaginationGenerator} from "./PaginationGenerator";
import {IGetScrapingJobDataQualityResponse} from "./interfaces/IGetScrapingJobDataQualityResponse";
import {ISitemapSchedulerConfig} from "./interfaces/ISitemapSchedulerConfig";
import {ISitemapSchedulerConfigResponse} from "./interfaces/ISitemapSchedulerConfigResponse";

export class Client {

	private readonly token: string;

	private readonly httpClient: HttpClient;

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

	public getSitemaps(): PaginationGenerator<IGetSitemapsResponse> {

		return new PaginationGenerator<IGetSitemapsResponse>(this.httpClient, "sitemaps");
	}

	public async updateSitemap(sitemapId: number, sitemap: string): Promise<string> {

		const response: IWebScraperResponse<string> = await this.httpClient.put(`sitemap/${sitemapId}`, sitemap);
		return response.data;
	}

	public async deleteSitemap(sitemapId: number): Promise<string> {

		const response: IWebScraperResponse<string> = await this.httpClient.delete(`sitemap/${sitemapId}`);
		return response.data;
	}

	public async createScrapingJob(scrapingJobConfig: IScrapingJobConfig): Promise<ICreateScrapingJobResponse> {

		const response: IWebScraperResponse<ICreateScrapingJobResponse> = await this.httpClient.post("scraping-job", JSON.stringify(scrapingJobConfig));
		return response.data;
	}

	public async getScrapingJob(scrapingJobId: number): Promise<IGetScrapingJobResponse> {

		const response: IWebScraperResponse<IGetScrapingJobResponse> = await this.httpClient.get(`scraping-job/${scrapingJobId}`);
		return response.data;
	}

	public getScrapingJobs(query?: IRequestOptionsQuery): PaginationGenerator<IGetScrapingJobResponse> {

		return new PaginationGenerator<IGetScrapingJobResponse>(this.httpClient, "scraping-jobs", query);
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

	public getProblematicUrls(scrapingJobId: number): PaginationGenerator<IGetProblematicUrlsResponse> {

		return new PaginationGenerator<IGetProblematicUrlsResponse>(this.httpClient, `scraping-job/${scrapingJobId}/problematic-urls`);
	}

	public async deleteScrapingJob(scrapingJobId: number): Promise<string> {

		const response: IWebScraperResponse<string> = await this.httpClient.delete(`scraping-job/${scrapingJobId}`);
		return response.data;
	}

	public async getAccountInfo(): Promise<IGetAccountInfoResponse> {

		const response: IWebScraperResponse<IGetAccountInfoResponse> = await this.httpClient.get("account");
		return response.data;
	}

	public async getScrapingJobDataQuality(scrapingJobId: number): Promise<IGetScrapingJobDataQualityResponse> {

		const response: IWebScraperResponse<IGetScrapingJobDataQualityResponse> = await this.httpClient.get(`scraping-job/${scrapingJobId}/data-quality`);
		return response.data;
	}

	public async enableSitemapScheduler(sitemapId: number, config: ISitemapSchedulerConfig): Promise<string> {

		const response: IWebScraperResponse<string> = await this.httpClient.post(`sitemap/${sitemapId}/enable-scheduler`, JSON.stringify(config));
		return response.data;
	}

	public async disableSitemapScheduler(sitemapId: number): Promise<string> {

		const response: IWebScraperResponse<string> = await this.httpClient.post(`sitemap/${sitemapId}/disable-scheduler`);
		return response.data;
	}

	public async getSitemapScheduler(sitemapId: number): Promise<ISitemapSchedulerConfigResponse> {

		const response: IWebScraperResponse<ISitemapSchedulerConfigResponse> = await this.httpClient.get(`sitemap/${sitemapId}/scheduler`);
		return response.data;
	}
}

import {ICreateScrapingJobResponse} from "./interfaces/ICreateScrapingJobResponse";
import {ICreateSitemapResponse} from "./interfaces/ICreateSitemapResponse";
import {IGetScrapingJobResponse} from "./interfaces/IGetScrapingJobResponse";
import {IGetAccountInfoResponse} from "./interfaces/IGetAccountInfoResponse";
import {IGetSitemapResponse} from "./interfaces/IGetSitemapResponse";
import {HttpClient} from "./HttpClient";
import {IOptions} from "./interfaces/IOptions";
import {IWebScraperResponse} from "./interfaces/IWebScraperResponse";

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

	/*
		public async getSitemaps(page: number = 1): Promise<IGetSitemapsResponse[]> {

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
	*/
	public async updateSitemap(sitemapId: number, sitemap: string): Promise<string> {
		const response: IWebScraperResponse<string> = await this.httpClient.put(`sitemap/${sitemapId}`, sitemap);
		return response.data;
	}

	public async deleteSitemap(sitemapId: number): Promise<string> {
		const response: IWebScraperResponse<string> = await this.httpClient.delete(`sitemap/${sitemapId}`);
		return response.data;
	}

	public async createScrapingJob(sitemapId: number): Promise<ICreateScrapingJobResponse> {
		const response: IWebScraperResponse<ICreateScrapingJobResponse> = await this.httpClient.post("scraping-job", JSON.stringify({
			"sitemap_id": sitemapId,
			"driver": "fulljs",
			"page_load_delay": 2000,
			"request_interval": 2000,
		}));
		return response.data;
	}

	public async getScrapingJob(scrapingJobId: number): Promise<IGetScrapingJobResponse> {
		const response: IWebScraperResponse<IGetScrapingJobResponse> = await this.httpClient.get(`scraping-job/${scrapingJobId}`);
		return response.data;
	}

	/*
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
	*/
	public async getJSON(scrapingJobId: number, fileName: string): Promise<void> {
		await this.httpClient.requestRaw({
			method: "GET",
			url: `scraping-job/${scrapingJobId}/json`,
			saveTo: fileName,
		});
	}

	public async getCSV(scrapingJobId: number, fileName: string): Promise<void> {
		await this.httpClient.requestRaw({
			method: "GET",
			url: `scraping-job/${scrapingJobId}/csv`,
			saveTo: fileName,
		});
	}

	/*
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
	*/
	public async deleteScrapingJob(scrapingJobId: number): Promise<string> {
		const response: IWebScraperResponse<string> = await this.httpClient.delete(`scraping-job/${scrapingJobId}`);
		return response.data;
	}

	public async getAccountInfo(): Promise<IGetAccountInfoResponse> {
		const response: IWebScraperResponse<IGetAccountInfoResponse> = await this.httpClient.get("account");
		return response.data;
	}
}

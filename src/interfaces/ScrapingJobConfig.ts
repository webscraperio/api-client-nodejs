export interface ScrapingJobConfig {
	sitemap_id: number;
	driver: string;
	page_load_delay: number;
	request_interval: number;
	proxy?: number;
	start_urls?: string[];
	custom_id?: string;
}

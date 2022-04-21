export interface GetScrapingJobsResponse {
	id: number;
	custom_id: string;
	sitemap_name: string;
	status: string;
	sitemap_id: number;
	test_run: number;
	jobs_scheduled: number;
	jobs_executed: number;
	jobs_failed: number;
	jobs_empty: number;
	stored_record_count: number;
	request_interval: number;
	page_load_delay: number;
	driver: string;
	scheduled: number; // scraping job was started by scheduler
	time_created: string; // unix timestamp
}
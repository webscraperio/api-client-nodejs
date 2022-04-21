export interface SitemapSchedulerConfig {
	cron_minute: string;
	cron_hour: string;
	cron_day: string;
	cron_month: string;
	cron_weekday: string;
	request_interval: number;
	page_load_delay: number;
	cron_timezone: string;
	driver: string;
	proxy: number;
}

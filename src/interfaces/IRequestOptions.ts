export interface IRequestOptions {
	url: string;
	method: string;
	saveTo?: string;
	data?: any;
	query?:{
		page?: number;
		sitemap_id?: number;
	};
}
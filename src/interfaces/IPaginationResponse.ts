import {IWebScraperResponse} from "./IWebScraperResponse";

export interface IPaginationResponse<TDataType> extends IWebScraperResponse<TDataType> {
	current_page: number;
	total: number;
	last_page: number;
	per_page: number;
}
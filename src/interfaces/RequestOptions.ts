import {RequestOptionsQuery} from "./RequestOptionsQuery";

export interface RequestOptions {
	url: string;
	method: string;
	saveTo?: string;
	data?: any;
	query?: RequestOptionsQuery;
}

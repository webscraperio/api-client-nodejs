import {IRequestOptionsQuery} from "./IRequestOptionsQuery";

export interface IRequestOptions {
	url: string;
	method: string;
	saveTo?: string;
	data?: any;
	query?: IRequestOptionsQuery;
}
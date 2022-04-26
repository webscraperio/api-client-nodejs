export interface IHttpRequestOptions {
	hostname: string;
	timeout: number;
	path: string;
	method: string;
	headers: { [s: string]: string | number };
}

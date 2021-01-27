import {HttpClient} from "./HttpClient";
import {IRequestOptions} from "./interfaces/IRequestOptions";
import {IRequestOptionsQuery} from "./interfaces/IRequestOptionsQuery";

export class PaginationIterator<TData> {

	private page: number = 0;

	public position: number = 0;

	private httpClient: HttpClient;

	private readonly uriPath: string;

	private lastPage: number = 1;

	public total: number;

	private perPage: number;

	public array: TData[] = [];

	private readonly query: IRequestOptionsQuery;

	private dataFetched: boolean = false;

	constructor(httpClient: HttpClient, uri: string, query?: IRequestOptionsQuery) {
		this.httpClient = httpClient;
		this.uriPath = uri;
		this.query = query;
	}

	public async rewind(): Promise<void> {
		this.position = 0;
		await this.getPageData(1);
	}

	public async getPageData(page: number): Promise<TData[]> {

		if (this.page === page) {
			return this.array;
		}

		this.page = page;

		const options: IRequestOptions = {
			method: "GET",
			url: this.uriPath,
			query: {
				page: this.page,
				...this.query,
			},
		};

		const response: any = await this.httpClient.request(options);

		this.lastPage = response.last_page;
		this.total = response.total;
		this.perPage = response.per_page;
		this.array = response.data;
		this.dataFetched = true;

		return this.array;
	}

	public async current(): Promise<TData> {
		if (!this.dataFetched) {
			await this.getPageData(1);
		}
		return this.array[this.position];
	}

	public key(): number {
		return this.position + (this.perPage * (this.page - 1));
	}

	public async next(): Promise<{ done: boolean, value?: TData }> {
		if (!this.valid()) {
			if (this.page < this.lastPage) {
				this.position = 0;
				await this.getPageData(this.page + 1);
			} else {
				return {done: true};
			}
		}
		return {
			done: false,
			value: this.array[this.position++],
		};

	}

	private [Symbol.asyncIterator](): any {
		return this;
	}

	private valid(): boolean {
		return (!!this.array[this.position]);
	}

	public async getLastPage(): Promise<number> {
		if (!this.dataFetched) {
			await this.getPageData(1);
		}
		return this.lastPage;
	}
}
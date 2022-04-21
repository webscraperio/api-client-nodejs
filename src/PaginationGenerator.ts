import {HttpClient} from "./HttpClient";
import {RequestOptionsQuery} from "./interfaces/RequestOptionsQuery";
import {WebScraperResponse} from "./interfaces/WebScraperResponse";

export class PaginationGenerator<TData> {

	public total: number = 1;

	public array: TData[] = [];

	private page: number = 0;

	private httpClient: HttpClient;

	private lastPage: number = 1;

	private perPage: number;

	private position: number = 0;

	private readonly uriPath: string;

	private readonly query: RequestOptionsQuery;

	constructor(httpClient: HttpClient, uri: string, query?: RequestOptionsQuery) {

		this.httpClient = httpClient;
		this.uriPath = uri;
		this.query = query;
	}

	public async* fetchRecords(): AsyncGenerator<TData> {

		while (this.position + 100 * (this.page - 1) !== this.total) {
			if (this.position === 100 || this.position === 0) {
				this.page++;
				await this.getPageData(this.page);
				if (this.total <= 0) {
					break;
				}
				this.position = 0;
			}
			yield this.array[this.position++];
		}
	}

	public async getAllRecords(): Promise<TData[]> {

		const allRecords = [];
		for await (const record of await this.fetchRecords()) {
			allRecords.push(record);
		}
		return allRecords;
	}

	public async getPageData(page: number): Promise<TData[]> {

		if (this.array.length && page === this.page) {
			return this.array;
		}
		this.page = page;
		const response: WebScraperResponse<TData[]> = await this.httpClient.request({
			method: "GET",
			url: this.uriPath,
			query: {
				page: this.page,
				...this.query,
			},
		});
		this.lastPage = response.last_page;
		this.total = response.total;
		this.perPage = response.per_page;
		this.array = response.data;
		return response.data;
	}

	public rewind(): void {

		this.position = 0;
		this.getPageData(1);
	}

	public current(): TData {

		return this.array[this.position];
	}

	public key(): number {

		return this.position + (this.perPage * (this.page - 1));
	}

	public valid(): boolean {

		return this.position in this.array;
	}

	public getLastPage(): number {

		return this.lastPage;
	}
}

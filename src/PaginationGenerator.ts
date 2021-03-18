import {HttpClient} from "./HttpClient";
import {IRequestOptionsQuery} from "./interfaces/IRequestOptionsQuery";
import {IRequestOptions} from "./interfaces/IRequestOptions";

export class PaginationGenerator<TData> {

	public total: number = 1;

	public array: TData[] = [];

	private page: number = 0;

	private httpClient: HttpClient;

	private readonly uriPath: string;

	private lastPage: number = 1;

	private perPage: number;

	private position: number = 0;

	private readonly query: IRequestOptionsQuery;

	constructor(httpClient: HttpClient, uri: string, query?: IRequestOptionsQuery) {
		this.httpClient = httpClient;
		this.uriPath = uri;
		this.query = query;
	}

	public async* fetchRecords(): AsyncGenerator<TData> {

		while (this.position + 100 * (this.page - 1) !== this.total) {

			if (this.position === 100 || this.position === 0) {
				this.page++;
				const options: IRequestOptions = {
					method: "GET",
					url: this.uriPath,
					query: {
						page: this.page,
						...this.query,
					},
				};

				const response: any = await this.httpClient.request(options);

				this.position = 0;
				this.lastPage = response.last_page;
				this.total = response.total;
				this.perPage = response.per_page;
				this.array = response.data;
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
}

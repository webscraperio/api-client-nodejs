import {HttpClient} from "./HttpClient";
import {IRequestOptionsQuery} from "./interfaces/IRequestOptionsQuery";
import {IRequestOptions} from "./interfaces/IRequestOptions";

export class PaginationGenerator<TData> {
	private page: number = 0;

	private httpClient: HttpClient;

	private readonly uriPath: string;

	private lastPage: number = 1;

	public total: number;

	private perPage: number;

	public array: TData[] = [];

	private readonly query: IRequestOptionsQuery;

	constructor(httpClient: HttpClient, uri: string, query?: IRequestOptionsQuery) {
		this.httpClient = httpClient;
		this.uriPath = uri;
		this.query = query;
	}

	public async* fetchRecords(): AsyncGenerator<TData> {

		while (this.page < this.lastPage) {
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

			this.lastPage = response.last_page;
			this.total = response.total;
			this.perPage = response.per_page;
			this.array = response.data;
			for await(const record of this.array) {
				yield record;
			}
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

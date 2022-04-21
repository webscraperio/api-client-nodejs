export interface WebScraperResponse<TDataType> {
	success: boolean;
	data: TDataType;
	current_page?: number;
	total?: number;
	last_page?: number;
	per_page?: number;
}

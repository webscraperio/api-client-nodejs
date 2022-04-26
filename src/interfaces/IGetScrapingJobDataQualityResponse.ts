import {IDataQualityStatus} from "./IDataQualityStatus";

export interface IGetScrapingJobDataQualityResponse {
	min_record_count: IDataQualityStatus;
	max_failed_pages_percent: IDataQualityStatus;
	max_empty_pages_percent: IDataQualityStatus;
	min_column_records: {
		"selector-test": IDataQualityStatus;
	};
	overall_data_quality_success: boolean;
}

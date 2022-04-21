import {DataQualityStatus} from "./DataQualityStatus";

export interface GetScrapingJobDataQualityResponse {
	min_record_count: DataQualityStatus;
	max_failed_pages_percent: DataQualityStatus;
	max_empty_pages_percent: DataQualityStatus;
	min_column_records: {
		"selector-test": DataQualityStatus;
	};
	overall_data_quality_success: boolean;
}

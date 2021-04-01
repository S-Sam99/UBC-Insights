import Dataset from "./Dataset";
import Constants from "../Constants";
import CourseSection from "./CourseSection";
import Log from "../Util";
import {InsightDatasetKind} from "./IInsightFacade";

/**
 * CourseDataset Class
 */
export default class CourseDataset extends Dataset {

    constructor(datasetId: string, kind: InsightDatasetKind, dataset: string[]) {
        super(datasetId, kind);

        if (dataset.length > 0) {
            this.parseDataset(dataset);
        }
    }

    private parseDataset(dataset: string[]) {
        const courseSectionFieldMapping: object = Constants.KEY_MAP_COURSES;

        for (const fileData of dataset) {
            try {
                const courseData: any = JSON.parse(fileData);
                if (Object.keys(courseData).length > 0 && courseData.hasOwnProperty("result")) {
                    const results: object[] = courseData.result;
                    for (let courseSectionData of results) {
                        const courseSection = new CourseSection(this.id, courseSectionData, courseSectionFieldMapping);
                        if (courseSection.isValid) {
                            this.numRows++;
                            this.data.push(courseSection);
                        }
                    }
                }
            } catch (err) {
                Log.error(err);
            }
        }
    }
}

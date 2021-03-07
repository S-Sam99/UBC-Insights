import Constants from "../Constants";
import CourseSection from "./CourseSection";
import Log from "../Util";

/**
 * CourseDataset Class
 */
export default class CourseDataset {
    public id: string;
    public allCourseSections: CourseSection[];
    public numRows: number;

    constructor(datasetId: string, dataset: string[]) {
        this.id = datasetId;
        this.allCourseSections = [];
        this.numRows = 0;

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
                            this.allCourseSections.push(courseSection);
                        }
                    }
                }
            } catch (err) {
                Log.error(err);
            }
        }
    }
}

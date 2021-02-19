import Constants from "../Constants";
import Course from "./Course";

/**
 * CourseDataset Class
 */
export default class CourseDataset {
    public id: string;
    public courses: Course[];

    constructor(datasetId: string, dataset: string[]) {
        this.id = datasetId;
        this.courses = [];

        if (dataset.length > 0) {
            this.parseDataset(dataset);
        }
    }

    private parseDataset(dataset: string[]) {
        const courseSectionFieldMapping = Constants.KEY_MAP;

        for (const fileData of dataset) {
            const courseData: any = JSON.parse(fileData);
            if (Object.keys(courseData).length > 0 && courseData.hasOwnProperty("result")) {
                const course = new Course(this.id, courseData.result, courseSectionFieldMapping);

                if (course.courseSections.length > 0) {
                    this.courses.push(course);
                }
            }
        }
    }
}

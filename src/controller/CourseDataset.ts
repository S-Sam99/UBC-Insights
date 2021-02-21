import Constants from "../Constants";
import Course from "./Course";
import Category from "./Category";

/**
 * CourseDataset Class
 */
export default class CourseDataset {
    public id: string;
    public departments: any;
    public courseNumbers: any;
    public allCourses: Course[];
    public numRows: number;

    constructor(datasetId: string, dataset: string[]) {
        this.id = datasetId;
        this.departments = {};
        this.courseNumbers = {};
        this.allCourses = [];
        this.numRows = 0;

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
                    this.numRows += course.numCourseRows;
                    CourseDataset.setCourseToCategory(course, course.department, this.departments);
                    CourseDataset.setCourseToCategory(course, course.id, this.courseNumbers);
                    this.allCourses.push(course);
                }
            }
        }
    }

    private static setCourseToCategory(course: Course, key: string, category: any) {
        if (category.hasOwnProperty(key)) {
            category[`${key}`].addCourse(course);
        } else {
            let cat = new Category(key);
            cat.addCourse(course);
            category[`${key}`] = cat;
        }
    }
}

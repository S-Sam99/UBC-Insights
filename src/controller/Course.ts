import CourseSection from "./CourseSection";

/**
 * Course Class
 */
export default class Course {
    public department: string;
    public id: string;
    public courseSections: CourseSection[];

    constructor(datasetId: string, courseData: object[], courseSectionFieldMapping: object) {
        this.courseSections = [];
        this.createCourseSections(datasetId, courseData, courseSectionFieldMapping);
        this.setCourseData(datasetId);
    }
    private createCourseSections(datasetId: string, courseData: object[], courseSectionFieldMapping: object) {
        for (let courseSectionData of courseData) {
            const courseSection = new CourseSection(datasetId, courseSectionData, courseSectionFieldMapping);

            if (courseSection.isValid) {
                this.courseSections.push(courseSection);
            }
        }
    }

    private setCourseData(datasetId: string) {
        if (this.courseSections.length > 0) {
            const courseSection = this.courseSections[0];
            this.id = courseSection.data[`${datasetId}_id`];
            this.department = courseSection.data[`${datasetId}_dept`];
        }
    }
}

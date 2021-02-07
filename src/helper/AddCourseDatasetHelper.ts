import Constants from "../Constants";
import * as JSZip from "jszip";
import * as fs from "fs-extra";

/**
 * Localized Helper Class for functions pertaining to adding course datasets.
 */
export default class AddCourseDatasetHelper {
    public static generateCourseDataset (id: string, data: JSZip): Promise<string[]> {
        const promises: any[] = [];

        data.folder(Constants.REQUIRED_DIR).forEach((filePath, fileObj) => {
            if (fileObj.dir === false) {
                promises.push(fileObj.async("string"));
            }
        });

        if (promises.length > 0) {
            return Promise.all(promises).then((dataset: []) => {
                let departments: any = {};

                for (const fileData of dataset) {
                    const parsedCourseData: any = JSON.parse(fileData);

                    if (this.hasCourseSection(parsedCourseData.result)) {
                        let courseSections: any = this.createCourseSections(parsedCourseData.result);
                        const department: string = this.determineDepartment(courseSections);
                        let departmentCourses = [this.generateCourse(courseSections)];

                        if (departments.hasOwnProperty(department)) {
                            departmentCourses.push(departments[department]);
                        }
                        departments[department] = departmentCourses;
                    }
                }
                if (Object.keys(departments).length > 0) {
                    this.persistDataToDisk(id, JSON.stringify(departments));
                    return Promise.resolve(departments);
                } else {
                    return Promise.reject(Constants.MISSING_COURSE_SECTION);
                }
            }).catch((err) => {
                return Promise.reject(err);
            });
        } else {
            return Promise.reject(Constants.MISSING_COURSES);
        }
    }

    private static hasCourseSection(courseSections: any): boolean {
        return (courseSections !== undefined && courseSections.length > 0);
    }

    private static createCourseSections(parsedCourseSections: any): object {
        const keyMapping: any = Constants.KEY_MAP;
        const courseSections: any = [];

        for (let parsedCourseSection of parsedCourseSections) {
            const courseSection = this.createCourseSection(keyMapping, parsedCourseSection);

            if (courseSection) {
                courseSections.push(courseSection);
            }
        }

        return courseSections;
    }

    private static createCourseSection(keyMapping: any, courseSection: any): object {
        let courseDataset: any = {};

        for (let key in keyMapping) {
            if (keyMapping.hasOwnProperty(key)) {
                const field = keyMapping[key];

                if (!field) {
                    return null;
                }

                courseDataset[key] = courseSection[field];
            }
        }

        return courseDataset;
    }

    private static generateCourse(courseSections: any): object {
        const course: any = {};
        const courseId: string = this.determineCourseId(courseSections);
        course[courseId] = courseSections;

        return course;
    }

    private static determineDepartment(courseSections: any): string {
        return courseSections[0].dept.toUpperCase();
    }

    private static determineCourseId(courseSections: any): string {
        return courseSections[0].id;
    }

    private static persistDataToDisk(name: string, data: string): void {
        const path = "./data";

        fs.writeFileSync(`${path}/${name}`, data);
    }

}

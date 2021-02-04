import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import * as JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    public courseDatasets: any;

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        this.courseDatasets = {};
    }

    /** courseDatasets: {
     *      courses: {
     *          "CPSC": {
     *              "310": [
     *                  {
     *                      "dept": "",
     *                      "avg": ""
     *                  },
     *                  {
     *                      "dept": "",
     *                      "avg": ""
     *                  }
     *              ]
     *          }
     *      },
     *      oneCourseSection: {
     *          "CPSC": {
     *              "310": [
     *                  {
     *                      "dept": "",
     *                      "avg": ""
     *                  },
     *                  {
     *                      "dept": "",
     *                      "avg": ""
     *                  }
     *              ]
     *          }
     *      }
     * }
     */

    /**
     * Add a dataset to insightUBC.
     *
     * @param id  The id of the dataset being added.
     * @param content  The base64 content of the dataset. This content should be in the form of a serialized zip file.
     * @param kind  The kind of the dataset
     *
     * @return Promise <string[]>
     *
     * The promise should fulfill on a successful add, reject for any failures.
     * The promise should fulfill with a string array,
     * containing the ids of all currently added datasets upon a successful add.
     * The promise should reject with an InsightError describing the error.
     *
     * An id is invalid if it contains an underscore, or is only whitespace characters.
     * If id is the same as the id of an already added dataset, the dataset should be rejected and not saved.
     *
     * After receiving the dataset, it should be processed into a data structure of
     * your design. The processed data structure should be persisted to disk; your
     * system should be able to load this persisted value into memory for answering
     * queries.
     *
     * Ultimately, a dataset must be added or loaded from disk before queries can
     * be successfully answered.
     */
    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        if (this.isValidId(id)) {
            JSZip.loadAsync(content, {base64: true})
                .then((data) => {
                    if (data["files"].hasOwnProperty("courses/")) {
                        const courseDataset: any = InsightFacade.generateCourseDataset(id, data);
                        if (courseDataset) {
                            this.courseDatasets[id] = courseDataset;
                        }
                    }
                })
                .then(() => {
                    /* eslint-disable no-console */
                    console.log(this.courseDatasets);
                    /* eslint-enable no-console */
                });
            return Promise.reject("Not implemented.");
        }
        return Promise.reject("Not implemented.");
    }

    private isValidId(id: string): boolean {
        if (!id) {
            return false;
        }

        if (this.courseDatasets.hasOwnProperty(id)) {
            return false;
        }

        return !id.includes("_");
    }

    private static generateCourseDataset (id: string, data: JSZip): any {
        let promises = [];
        let departments: any = {};

        for (let filePath in data.files) {
            const fileObj = data.files[filePath];

            if (fileObj.dir === false && filePath.startsWith("courses/")) {
                promises.push(
                    data.files[filePath].async("string").then((fileData) => {
                        const parsedCourseData: any = JSON.parse(fileData);

                        if (InsightFacade.hasCourseSection(parsedCourseData.result)) {
                            let courseSections: any = InsightFacade.createCourseSections(parsedCourseData.result);
                            const department: string = InsightFacade.determineDepartment(courseSections);
                            const course: any = {};
                            const courseId: string = InsightFacade.determineCourseId(courseSections);
                            course[courseId] = courseSections;
                            let departmentCourses = [course];

                            if (departments.hasOwnProperty(department)) {
                                departmentCourses.push(departments[department]);
                            }

                            /* eslint-disable no-console */
                            console.log(departmentCourses);
                            /* eslint-enable no-console */
                        }
                    }));
            }
        }

        return Promise.all(promises);
    }

    private static hasCourseSection(courseSections: any): boolean {
        return (courseSections !== undefined && courseSections.length > 0);
    }

    private static createCourseSections(parsedCourseSections: any): object {
        const keyMapping: any = InsightFacade.generateKeyMapping();
        const courseSections: any = [];

        for (let parsedCourseSection of parsedCourseSections) {
            const courseSection = InsightFacade.createCourseSection(keyMapping, parsedCourseSection);

            if (courseSection) {
                courseSections.push(courseSection);
            }
        }

        /* eslint-disable no-console */
        console.log(courseSections);
        /* eslint-enable no-console */

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

    private static determineDepartment(courseSections: any): string {
        return courseSections[0].dept;
    }

    private static determineCourseId(courseSections: any): string {
        return courseSections[0].id;
    }

    private static generateKeyMapping(): object {
        return {
            dept: "Subject",
            id: "Course",
            avg: "Avg",
            instructor: "Professor",
            title: "Title",
            pass: "Pass",
            fail: "Fail",
            audit: "Audit",
            uuid: "id",
            year: "Year"
        };
    }

    /**
     * Remove a dataset from insightUBC.
     *
     * @param id  The id of the dataset to remove.
     *
     * @return Promise <string>
     *
     * The promise should fulfill upon a successful removal, reject on any error.
     * Attempting to remove a dataset that hasn't been added yet counts as an error.
     *
     * An id is invalid if it contains an underscore, or is only whitespace characters.
     *
     * The promise should fulfill with the id of the dataset that was removed.
     * The promise should reject with a NotFoundError (if a valid id was not yet added)
     * or an InsightError (invalid id or any other source of failure) describing the error.
     *
     * This will delete both disk and memory caches for the dataset for the id meaning
     * that subsequent queries for that id should fail unless a new addDataset happens first.
     */
    public removeDataset(id: string): Promise<string> {
        return Promise.reject("Not implemented.");
    }

    /**
     * Perform a query on insightUBC.
     *
     * @param query  The query to be performed.
     *
     * If a query is incorrectly formatted, references a dataset not added (in memory or on disk),
     * or references multiple datasets, it should be rejected with an InsightError.
     * If a query would return more than 5000 results, it should be rejected with a ResultTooLargeError.
     *
     * @return Promise <any[]>
     *
     * The promise should fulfill with an array of results.
     * The promise should reject with an InsightError describing the error.
     */
    public performQuery(query: any): Promise<any[]> {
        return Promise.reject("Not implemented.");
    }

    /**
     * List all currently added datasets, their types, and number of rows.
     *
     * @return Promise <InsightDataset[]>
     * The promise should fulfill an array of currently added InsightDatasets, and will only fulfill.
     */
    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}

import {InsightDatasetKind, ResultTooLargeError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import Constants from "../Constants";
import ValidationHelper from "./ValidationHelper";
import Log from "../Util";
import Course from "../controller/Course";
import CourseDataset from "../controller/CourseDataset";
import CourseSection from "../controller/CourseSection";

/**
 * Centralized Helper Class for functions pertaining to performing queries on added datasets.
 */
export default class PerformQueryHelper {
    public static performDatasetQuery(query: any): Promise<any[]> {
        const columnKeys = query["OPTIONS"]["COLUMNS"];
        const dataset: CourseDataset = this.getDataset(this.getFirstDatasetId(columnKeys));
        // const result = this.getAllSections(dataset.departments, columnKeys);
        if (dataset.numRows > Constants.MAX_RESULTS_SIZE) {
            return Promise.reject(new ResultTooLargeError());
        }
        return Promise.resolve([]);
    }

    private static getDataset(id: string): any {
        const path = "./data";
        const dataset = fs
            .readFileSync(`${path}/${id}`, "utf8");

        return JSON.parse(dataset);
    }

    public static getFirstDatasetId(columns: any): string {
        if (!(typeof columns[0] === "string")) {
            return null;
        }

        return this.getDatasetIdFromKey(columns[0], null);
    }

    private static getAllSections(courses: Course[], columnKeys: string[]): any[] {
        let sections: any[] = [];

        for (const course of courses) {
            for (const courseSection of course.courseSections) {
                sections = sections.concat(this.generateCourseSectionsWithColumns(courseSection.data, columnKeys));
                if (sections.length > Constants.MAX_RESULTS_SIZE) {
                    return sections;
                }
            }
        }
        return sections;
    }

    private static generateCourseSectionsWithColumns(courseSection: any, columnKeys: string[]): any {
        let courseSectionWithColumns: any = {};

        for (const column of columnKeys) {
            courseSectionWithColumns[column] = courseSection[column];
        }
        return courseSectionWithColumns;
    }

    public static getUnderscorePosFromKey(key: string): number {
        return key.indexOf("_");
    }

    public static getParsedKey(key: string, underscorePos: number): string {
        return key.substring(underscorePos + 1, key.length);
    }

    public static getDatasetIdFromKey(key: string, underscorePos: number): string {
        if (!underscorePos) {
            underscorePos = this.getUnderscorePosFromKey(key);
        }
        return key.substring(0, underscorePos);
    }
}

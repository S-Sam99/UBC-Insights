import * as fs from "fs-extra";
import Constants from "../Constants";
import CourseDataset from "../controller/CourseDataset";
import CourseSection from "../controller/CourseSection";
/**
 * Centralized Helper Class for functions pertaining to performing queries on added datasets.
 */
export default class PerformQueryHelper {
    public static performDatasetQuery(query: any): any[] {
        const columnKeys = query.OPTIONS.COLUMNS;
        const dataset: CourseDataset = this.getDataset(this.getFirstDatasetId(columnKeys));
        let results: CourseSection[] = this.applyFilter(query, dataset.allCourseSections);
        if (results.length > Constants.MAX_RESULTS_SIZE) {
            return results;
        }
        if (query.OPTIONS.hasOwnProperty("ORDER")) {
            results = this.applyOrder(query.OPTIONS.ORDER, results);
        }
        return this.applyColumns(columnKeys, results);
    }

    private static getDataset(id: string): any {
        const path = "./data";
        const dataset = fs
            .readFileSync(`${path}/${id}`, "utf8");

        return JSON.parse(dataset);
    }

    public static getFirstDatasetId(columns: any): string {
        for (const key of columns) {
            if (typeof key === "string") {
                const pos = key.indexOf("_");
                if (pos > -1) {
                    return this.getDatasetIdFromKey(columns[0], null);
                }
            }
        }
        return null;
    }

    private static applyOrder(order: string, results: CourseSection[]): CourseSection[] {
        results.sort((firstSection, secondSection) => {
            const firstValue = firstSection.data[order];
            const secondValue = secondSection.data[order];
            return firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;
        });
        return results;
    }

    private static applyColumns(columnKeys: string[], results: CourseSection[]): any[] {
        let modifiedResults: any[] = [];

        for (const courseSection of results) {
            modifiedResults.push(this.generateCourseSectionWithColumns(courseSection, columnKeys));
        }

        return modifiedResults;
    }

    private static generateCourseSectionWithColumns(courseSection: CourseSection, columnKeys: string[]): any {
        let courseSectionWithColumns: any = {};

        for (const column of columnKeys) {
            courseSectionWithColumns[column] = courseSection.data[column];
        }
        return courseSectionWithColumns;
    }

    public static getUnderscorePosFromKey(key: string): number {
        return key.indexOf("_");
    }

    public static getParsedKey(key: string, underscorePos: number): string {
        if (underscorePos > -1) {
            return key.substring(underscorePos + 1, key.length);
        }
        return null;
    }

    public static getDatasetIdFromKey(key: string, underscorePos: number): string {
        if (!underscorePos) {
            underscorePos = this.getUnderscorePosFromKey(key);
        }
        return key.substring(0, underscorePos);
    }

    private static applyFilter(query: any, allCourseSections: CourseSection[]): CourseSection[] {
        if (Object.keys(query.WHERE).length === 0) {
            return allCourseSections;
        }
        const filters = Constants.FILTERS;
        const filterFunctions = Constants.FILTER_FUNCTIONS;
        return this.applyFilterFunction(
            query.WHERE,
            filters,
            filterFunctions,
            allCourseSections
        );
    }

    private static applyFilterFunction(
        parameters: any,
        filters: any,
        filterFunctions: any,
        allCourseSections: CourseSection[]
    ): CourseSection[] {
        const keys = Object.keys(parameters);
        const key = keys[0];
        const parameter = parameters[key];
        const columnKey = Object.keys(parameter)[0];
        const value = parameter[columnKey];
        const filter = filters[key];
        switch (filter.function) {
            case filterFunctions.And: {
                return this.applyFilterLogicAnd(parameter, filters, filterFunctions, allCourseSections);
            }
            case filterFunctions.Or: {
                return this.applyFilterLogicOr(parameter, filters, filterFunctions, allCourseSections);
            }
            case filterFunctions.LessThan: {
                return this.findCourseSectionsLessThan(columnKey, value, allCourseSections);
            }
            case filterFunctions.GreaterThan: {
                return this.findCourseSectionsGreaterThan(columnKey, value, allCourseSections);
            }
            case filterFunctions.Equal: {
                return this.findCourseSectionsEqual(columnKey, value, allCourseSections);
            }
            case filterFunctions.Is: {
                return this.findCourseSectionsIs(columnKey, value, allCourseSections);
            }
            case filterFunctions.Negation: {
                return this.applyFilterLogicNegation(parameter, filters, filterFunctions, allCourseSections);
            }
            default: {
                return allCourseSections;
            }
        }
    }

    private static applyFilterLogicAnd(
        parameters: any,
        filters: any,
        filterFunctions: any,
        allCourseSections: CourseSection[]
    ): CourseSection[] {
        let allMatchingCourseSections: CourseSection[][] = [];
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                const courseSections = this.applyFilterFunction(
                    parameters[key],
                    filters,
                    filterFunctions,
                    allCourseSections
                );
                allMatchingCourseSections.push(courseSections);
            }
        }
        return allMatchingCourseSections
            .reduce((firstList, secondList) => firstList
                .filter((courseSection) => secondList.includes(courseSection)));
    }

    private static applyFilterLogicOr(
        parameters: any,
        filters: any,
        filterFunctions: any,
        allCourseSections: CourseSection[]
    ): CourseSection[] {
        let results: CourseSection[] = [];
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                const courseSections = this.applyFilterFunction(
                    parameters[key],
                    filters,
                    filterFunctions,
                    allCourseSections
                );
                if (results.length < 1) {
                    results = courseSections;
                } else {
                    results = results.concat(
                        courseSections.filter((courseSection) => results.indexOf(courseSection) < 0)
                    );
                }
            }
        }
        return results;
    }

    private static applyFilterLogicNegation(
        parameters: any,
        filters: any,
        filterFunctions: any,
        allCourseSections: CourseSection[]
    ): CourseSection[] {
        const courseSections = this.applyFilterFunction(
            parameters,
            filters,
            filterFunctions,
            allCourseSections
        );

        return allCourseSections.filter((courseSection) => !courseSections.includes(courseSection));
    }

    private static findCourseSectionsLessThan(
        key: string,
        value: number,
        allCourseSections: CourseSection[]
    ): CourseSection[] {
        let matchingCourses: CourseSection[] = [];

        for (const courseSection of allCourseSections) {
            if (courseSection.data[key] < value) {
                matchingCourses.push(courseSection);
            }
        }
        return matchingCourses;
    }

    private static findCourseSectionsGreaterThan(
        key: string,
        value: number,
        allCourseSections: CourseSection[]
    ): CourseSection[] {
        let matchingCourses: CourseSection[] = [];

        for (const courseSection of allCourseSections) {
            if (courseSection.data[key] > value) {
                matchingCourses.push(courseSection);
            }
        }
        return matchingCourses;
    }

    private static findCourseSectionsEqual(
        key: string,
        value: number,
        allCourseSections: CourseSection[]
    ): CourseSection[] {
        let matchingCourses: CourseSection[] = [];

        for (const courseSection of allCourseSections) {
            if (courseSection.data[key] === value) {
                matchingCourses.push(courseSection);
            }
        }
        return matchingCourses;
    }

    private static findCourseSectionsIs(
        key: string,
        value: string,
        allCourseSections: CourseSection[]
    ): CourseSection[] {
        let matchingCourses: CourseSection[] = [];
        const hasWildcard = value.includes("*");
        for (const courseSection of allCourseSections) {
            if (hasWildcard) {
                if (this.isMatchingInputString(courseSection.data[key], value)) {
                    matchingCourses.push(courseSection);
                }
            } else if (courseSection.data[key] === value) {
                matchingCourses.push(courseSection);
            }
        }
        return matchingCourses;
    }

    private static isMatchingInputString(courseSectionData: string, value: string): boolean {
        const valueLength = value.length;
        if (valueLength === 1 && value.charAt(0) === "*" ||
            valueLength === 2 && value.charAt(0) === "*" && value.charAt(1) === "*") {
            return true;
        } else if (value.charAt(0) === "*" && value.charAt(valueLength - 1) === "*") {
            return courseSectionData.includes(value.substring(1, valueLength - 1));
        } else if (value.charAt(0) === "*") {
            return courseSectionData.endsWith(value.substring(1, valueLength));
        } else if (value.charAt(valueLength - 1) === "*") {
            return courseSectionData.startsWith(value.substring(0, valueLength - 1));
        } else {
            return false;
        }
    }
}

import {ResultTooLargeError} from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import Constants from "../Constants";
import CourseDataset from "../controller/CourseDataset";
import CourseSection from "../controller/CourseSection";

/**
 * Centralized Helper Class for functions pertaining to performing queries on added datasets.
 */
export default class PerformQueryHelper {
    public static performDatasetQuery(query: any): Promise<any[]> {
        const columnKeys = query.OPTIONS.COLUMNS;
        const dataset: CourseDataset = this.getDataset(this.getFirstDatasetId(columnKeys));
        let results: CourseSection[] = this.applyFilter(query, dataset.allCourseSections);
        if (query.OPTIONS.hasOwnProperty("ORDER")) {
            results = this.applyOrder(query.OPTIONS.ORDER, results);
        }
        const modifiedColumns: any[] = this.applyColumns(columnKeys, results);
        if (modifiedColumns.length > Constants.MAX_RESULTS_SIZE) {
            return Promise.reject(new ResultTooLargeError());
        }
        return Promise.resolve(modifiedColumns);
    }

    private static getDataset(id: string): any {
        const path = "./data";
        const dataset = fs
            .readFileSync(`${path}/${id}/`, "utf8");

        return JSON.parse(dataset);
    }

    public static getFirstDatasetId(columns: any): string {
        if (!(typeof columns[0] === "string")) {
            return null;
        }

        return this.getDatasetIdFromKey(columns[0], null);
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
        if (columnKeys.length === 10) {
            for (const courseSection of results) {
                modifiedResults.push(courseSection.data);
            }
        } else {
            for (const courseSection of results) {
                modifiedResults.push(this.generateCourseSectionWithColumns(courseSection, columnKeys));
            }
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
        return key.substring(underscorePos + 1, key.length);
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
                    results = results.concat(courseSections);
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
}

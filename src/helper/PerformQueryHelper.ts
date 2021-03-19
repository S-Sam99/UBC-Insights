import * as fs from "fs-extra";
import Constants from "../Constants";
import Dataset from "../controller/Dataset";
/**
 * Centralized Helper Class for functions pertaining to performing queries on added datasets.
 */
export default class PerformQueryHelper {
    public static performDatasetQuery(query: any): any[] {
        const columnKeys = query.OPTIONS.COLUMNS;
        const dataset: Dataset = this.getDataset(this.getFirstDatasetId(columnKeys));
        let results: any[] = this.applyFilter(query, dataset.data);
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

    private static applyOrder(order: string, results: any[]): any[] {
        results.sort((firstSection, secondSection) => {
            const firstValue = firstSection.data[order];
            const secondValue = secondSection.data[order];
            return firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;
        });
        return results;
    }

    private static applyColumns(columnKeys: string[], results: any[]): any[] {
        let modifiedResults: any[] = [];

        for (const result of results) {
            modifiedResults.push(this.generateResultsWithColumns(result, columnKeys));
        }

        return modifiedResults;
    }

    private static generateResultsWithColumns(result: any, columnKeys: string[]): any {
        let resultsWithColumns: any = {};

        for (const column of columnKeys) {
            resultsWithColumns[column] = result.data[column];
        }
        return resultsWithColumns;
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

    private static applyFilter(query: any, data: any[]): any[] {
        if (Object.keys(query.WHERE).length === 0) {
            return data;
        }
        const filters = Constants.FILTERS;
        const filterFunctions = Constants.FILTER_FUNCTIONS;
        return this.applyFilterFunction(
            query.WHERE,
            filters,
            filterFunctions,
            data
        );
    }

    private static applyFilterFunction(
        parameters: any,
        filters: any,
        filterFunctions: any,
        data: any[]
    ): any[] {
        const keys = Object.keys(parameters);
        const key = keys[0];
        const parameter = parameters[key];
        const columnKey = Object.keys(parameter)[0];
        const value = parameter[columnKey];
        const filter = filters[key];
        switch (filter.function) {
            case filterFunctions.And: {
                return this.applyFilterLogicAnd(parameter, filters, filterFunctions, data);
            }
            case filterFunctions.Or: {
                return this.applyFilterLogicOr(parameter, filters, filterFunctions, data);
            }
            case filterFunctions.LessThan: {
                return this.findCourseSectionsLessThan(columnKey, value, data);
            }
            case filterFunctions.GreaterThan: {
                return this.findCourseSectionsGreaterThan(columnKey, value, data);
            }
            case filterFunctions.Equal: {
                return this.findCourseSectionsEqual(columnKey, value, data);
            }
            case filterFunctions.Is: {
                return this.findCourseSectionsIs(columnKey, value, data);
            }
            case filterFunctions.Negation: {
                return this.applyFilterLogicNegation(parameter, filters, filterFunctions, data);
            }
            default: {
                return data;
            }
        }
    }

    private static applyFilterLogicAnd(
        parameters: any,
        filters: any,
        filterFunctions: any,
        data: any[]
    ): any[] {
        let results: any[][] = [];
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                const allMatchingResults = this.applyFilterFunction(
                    parameters[key],
                    filters,
                    filterFunctions,
                    data
                );
                results.push(allMatchingResults);
            }
        }
        return results
            .reduce((firstList, secondList) => firstList
                .filter((result) => secondList.includes(result)));
    }

    private static applyFilterLogicOr(
        parameters: any,
        filters: any,
        filterFunctions: any,
        data: any[]
    ): any[] {
        let results: any[] = [];
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                const allMatchingResults = this.applyFilterFunction(
                    parameters[key],
                    filters,
                    filterFunctions,
                    data
                );
                if (results.length < 1) {
                    results = allMatchingResults;
                } else {
                    results = results.concat(
                        allMatchingResults.filter((result) => results.indexOf(result) < 0)
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
        data: any[]
    ): any[] {
        const allMatchingResults = this.applyFilterFunction(
            parameters,
            filters,
            filterFunctions,
            data
        );

        return data.filter((result) => !allMatchingResults.includes(result));
    }

    private static findCourseSectionsLessThan(
        key: string,
        value: number,
        data: any[]
    ): any[] {
        let allMatchingResults: any[] = [];

        for (const result of data) {
            if (result.data[key] < value) {
                allMatchingResults.push(result);
            }
        }
        return allMatchingResults;
    }

    private static findCourseSectionsGreaterThan(
        key: string,
        value: number,
        data: any[]
    ): any[] {
        let allMatchingResults: any[] = [];

        for (const result of data) {
            if (result.data[key] > value) {
                allMatchingResults.push(result);
            }
        }
        return allMatchingResults;
    }

    private static findCourseSectionsEqual(
        key: string,
        value: number,
        data: any[]
    ): any[] {
        let allMatchingResults: any[] = [];

        for (const result of data) {
            if (result.data[key] === value) {
                allMatchingResults.push(result);
            }
        }
        return allMatchingResults;
    }

    private static findCourseSectionsIs(
        key: string,
        value: string,
        data: any[]
    ): any[] {
        let allMatchingResults: any[] = [];
        const hasWildcard = value.includes("*");
        for (const result of data) {
            if (hasWildcard) {
                if (this.isMatchingInputString(result.data[key], value)) {
                    allMatchingResults.push(result);
                }
            } else if (result.data[key] === value) {
                allMatchingResults.push(result);
            }
        }
        return allMatchingResults;
    }

    private static isMatchingInputString(data: string, value: string): boolean {
        const valueLength = value.length;
        if (valueLength === 1 && value.charAt(0) === "*" ||
            valueLength === 2 && value.charAt(0) === "*" && value.charAt(1) === "*") {
            return true;
        } else if (value.charAt(0) === "*" && value.charAt(valueLength - 1) === "*") {
            return data.includes(value.substring(1, valueLength - 1));
        } else if (value.charAt(0) === "*") {
            return data.endsWith(value.substring(1, valueLength));
        } else if (value.charAt(valueLength - 1) === "*") {
            return data.startsWith(value.substring(0, valueLength - 1));
        } else {
            return false;
        }
    }
}

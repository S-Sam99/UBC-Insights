import * as fs from "fs-extra";
import Constants from "../../Constants";
import Dataset from "../../controller/Dataset";
import ApplyFilterHelper from "./ApplyFilterHelper";
import ApplyTransformationsHelper from "./ApplyTransformationsHelper";
import ApplyOrderHelper from "./ApplyOrderHelper";
/**
 * Centralized Helper Class for functions pertaining to performing queries on added datasets.
 */
export default class PerformQueryHelper {
    public static performDatasetQuery(query: any): any[] {
        const columnKeys = query.OPTIONS.COLUMNS;
        const dataset: Dataset = this.getDataset(this.getFirstDatasetId(columnKeys));
        let results: any[] = ApplyFilterHelper.applyFilter(query, dataset.data);
        if (results.length > Constants.MAX_RESULTS_SIZE && !query.hasOwnProperty("TRANSFORMATIONS")) {
            return results;
        }
        if (query.hasOwnProperty("TRANSFORMATIONS")) {
            results = ApplyTransformationsHelper.applyTransformations(query, results);
        }
        if (query.OPTIONS.hasOwnProperty("ORDER")) {
            results = ApplyOrderHelper.applyOrder(query.OPTIONS.ORDER, results);
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
}

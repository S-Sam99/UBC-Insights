import {InsightDatasetKind} from "../controller/IInsightFacade";
import * as fs from "fs-extra";
import Constants from "../Constants";
import PerformQueryHelper from "./PerformQueryHelper";

/**
 * Centralized Helper Class for functions pertaining to validation purposes.
 */
export default class ValidationHelper {
    public static isValidContent(content: any) {
        return content;
    }

    public static isValidId(id: string): boolean {
        return !(!id || id.includes("_") || !id.trim().length);
    }

    public static isValidIdforRemove(id: string): boolean {
        if (!id || id.includes("_") || !id.trim().length) {
            return false;
        }
        return true;
    }

    // public static isValidCourseKind(kind: InsightDatasetKind) {
    //     return kind === InsightDatasetKind.Courses;
    // }

    public static isValidIDNotOnDisk(id: string): boolean {
        const path = "./data";
        return !fs.existsSync(`${path}/${id}`);
    }

    public static isValidQuery(query: any): boolean {
        if (!query) {
            return false;
        }
        if (!this.hasRequiredQueryKeys(query)) {
            return false;
        }

        if (!this.isValidOptions(query.OPTIONS)) {
            return false;
        }
        const datasetId = PerformQueryHelper.getDatasetIdFromKey(query.OPTIONS.COLUMNS[0], null);

        return this.isValidWhere(query.WHERE, datasetId);
    }

    private static isValidWhere(where: any, datasetId: any): boolean {
        const keys = Object.keys(where);

        if (keys.length === 0) {
            return true;
        }
        const filters = Constants.FILTERS;
        const filterOperations = Constants.FILTER_OPERATIONS;

        return this.isValidFilter(where, filters, filterOperations, datasetId);
    }

    private static isValidFilter(filter: any, filters: any, filterOperations: any, datasetId: any): boolean {
        const keys = Object.keys(filter);

        if (keys.length !== 1) {
            return false;
        }

        if (!filters.hasOwnProperty(keys[0])) {
            return false;
        }
        return this.isValidFilterOperator(filter[keys[0]], filters[keys[0]], filters, filterOperations, datasetId);
    }

    private static isValidOptions(options: any): boolean {
        if (Object.keys(options).length < 1 || !options.hasOwnProperty("COLUMNS")) {
            return false;
        }
        const optionsKeysLength = Object.keys(options).length;

        if (optionsKeysLength < 1 || optionsKeysLength > 2) {
            return false;
        }

        const columns = options.COLUMNS;

        if (!Array.isArray(columns)) {
            return false;
        }

        if (columns.length < 1) {
            return false;
        }

        if (!this.isColumnsReferencingOneDataset(columns)) {
            return false;
        }

        if (Object.keys(options).length === 2) {
            return this.isOrderKeyInColumns(options);
        }
        return true;
    }

    private static isValidFilterOperator(
        parameters: any,
        filter: any,
        filters: any,
        filterOperations: any,
        datasetId: any
    ): boolean {
        switch (filter.operation) {
            case filterOperations.Logic: {
                return this.isValidLogicFilter(parameters, filters, filterOperations, datasetId);
            }
            case filterOperations.MComparison: {
                return this.isValidComparisonFilter(parameters, filter, "M", datasetId);
            }
            case filterOperations.SComparison: {
                return this.isValidComparisonFilter(parameters, filter, "S", datasetId);
            }
            case filterOperations.Negation: {
                if (Array.isArray(parameters)) {
                    return false;
                }
                return this.isValidFilter(parameters, filters, filterOperations, datasetId);
            }
            default: {
                return false;
            }
        }
    }

    private static isValidLogicFilter(
        parameters: any,
        filters: any,
        filterOperations: any,
        datasetId: any
    ): boolean {
        if (!Array.isArray(parameters) || parameters.length < 1) {
            return false;
        }

        for (let parameter of parameters) {
            if (!this.isValidFilter(parameter, filters, filterOperations, datasetId)) {
                return false;
            }
        }
        return true;
    }

    private static isValidComparisonFilter(parameters: any, filter: any, type: string, datasetId: any): boolean {
        if (Array.isArray(parameters)) {
            return false;
        }
        const keys = Object.keys(parameters);

        if (keys.length !== 1) {
            return false;
        }

        const keyWithId = Object.keys(parameters)[0];
        const underscorePos = PerformQueryHelper.getUnderscorePosFromKey(keyWithId);

        if (underscorePos === -1) {
            return false;
        }

        const keyWithoutId = PerformQueryHelper.getParsedKey(keyWithId, underscorePos);

        if (PerformQueryHelper.getDatasetIdFromKey(keyWithId, underscorePos) !== datasetId) {
            return false;
        }

        if (type === "M") {
            return filter.key.includes(keyWithoutId) && Number.isFinite(parameters[keys[0]]);
        } else {
            const input = parameters[keys[0]];
            if (!(filter.key.includes(keyWithoutId) && (typeof input === "string"))) {
                return false;
            }
            return this.isValidInputString(input);
        }
    }

    private static isValidInputString(input: string): boolean {
        const regex: RegExp = /[*]?[^*]*[*]?/g;

        for (const match of input.match(regex)) {
            if (match === input) {
                return true;
            }
        }
        return false;
    }

    private static hasRequiredQueryKeys(query: any): boolean {
        if (Object.keys(query).length !== 2) {
            return false;
        }

        for (const key of Constants.REQUIRED_QUERY_KEYS) {
            if (!query.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    private static isColumnsReferencingOneDataset(columns: any): boolean {
        const firstDataset = PerformQueryHelper.getFirstDatasetId(columns);

        if (!firstDataset || this.isValidId(firstDataset) && this.isValidIDNotOnDisk(firstDataset)) {
            return false;
        }

        let allKeys = Constants.MKEYS;
        allKeys = allKeys.concat(Constants.SKEYS);

        for (const key of columns) {
            if (!(typeof key === "string")) {
                return false;
            }

            const underscorePos = PerformQueryHelper.getUnderscorePosFromKey(key);
            const keyWithoutId: string = PerformQueryHelper.getParsedKey(key, underscorePos);

            if (!allKeys.includes(keyWithoutId)) {
                return false;
            }

            if (firstDataset !== PerformQueryHelper.getDatasetIdFromKey(key, underscorePos)) {
                return false;
            }
        }
        return true;
    }

    private static isOrderKeyInColumns(options: any): boolean {
        if (options.hasOwnProperty("ORDER")) {
            const order = options.ORDER;

            if (!(typeof order === "string")) {
                return false;
            }

            if (!options.COLUMNS.includes(order)) {
                return false;
            }
        }
        return true;
    }
}

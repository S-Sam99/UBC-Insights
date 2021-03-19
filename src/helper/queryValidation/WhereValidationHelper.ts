import Constants from "../../Constants";
import PerformQueryHelper from "../PerformQueryHelper";
import QueryValidationHelper from "./QueryValidationHelper";

/**
 * Centralized QueryValidationHelper Class for functions pertaining to validation purposes.
 */
export default class WhereValidationHelper {
    public static isValidWhere(where: any, datasetId: any): boolean {
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
        if (!QueryValidationHelper.isNonEmptyArray(parameters)) {
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
}

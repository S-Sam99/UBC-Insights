import Constants from "../../Constants";
import PerformQueryHelper from "../PerformQueryHelper";
import WhereValidationHelper from "./WhereValidationHelper";
import OptionsValidationHelper from "./OptionsValidationHelper";
import TransformationsValidationHelper from "./TransformationsValidationHelper";

/**
 * Centralized QueryValidationHelper Class for functions pertaining to validation purposes.
 */
export default class QueryValidationHelper {
    public static isValidQuery(query: any): boolean {
        if (!query) {
            return false;
        }
        if (!this.hasRequiredQueryKeys(query)) {
            return false;
        }

        if (!OptionsValidationHelper.isValidOptions(query.OPTIONS)) {
            return false;
        }

        if (!TransformationsValidationHelper.isValidTransformations(query)) {
            return false;
        }

        const datasetId = PerformQueryHelper.getDatasetIdFromKey(query.OPTIONS.COLUMNS[0], null);

        return WhereValidationHelper.isValidWhere(query.WHERE, datasetId);
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

    public static isNonEmptyArray(obj: any): boolean {
        return Array.isArray(obj) && obj.length >= 1;
    }
}

import Constants from "../../Constants";
import QueryValidationHelper from "./QueryValidationHelper";

/**
 * Centralized QueryValidationHelper Class for functions pertaining to validation purposes.
 */
export default class TransformationsValidationHelper {
    public static isValidTransformations(query: any): boolean {
        if (query.hasOwnProperty("TRANSFORMATIONS")) {
            const columns = query.OPTIONS.COLUMNS;
            const transformations = query.TRANSFORMATIONS;

            if (Object.keys(transformations).length < 2) {
                return false;
            }

            for (const key in transformations) {
                if (transformations.hasOwnProperty(key)) {
                    if (key !== "GROUP" && key !== "APPLY" &&
                        !QueryValidationHelper.isNonEmptyArray(transformations[key])) {
                        return false;
                    }
                }
            }

            const group = transformations.GROUP;
            const apply = transformations.APPLY;

            if (!this.isValidKeys(columns, group, apply)) {
                return false;
            }

            if (!this.isValidGroup(group)) {
                return false;
            }

            if (!this.isValidApply(apply)) {
                return false;
            }
        }
        return true;
    }

    private static isValidKeys(columns: any, group: string[], apply: string[]): boolean {
        for (const key of columns) {
            if (!group.includes(key) && !apply.includes(key)) {
                return false;
            }
        }
        return true;
    }

    private static isValidApply(apply: string[]): boolean {
        return false;
    }

    private static isValidGroup(group: string[]): boolean {
        return false;
    }
}

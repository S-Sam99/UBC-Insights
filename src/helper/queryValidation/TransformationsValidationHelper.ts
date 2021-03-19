import Constants from "../../Constants";
import QueryValidationHelper from "./QueryValidationHelper";
import PerformQueryHelper from "../PerformQueryHelper";

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
                    if (key !== "GROUP" && key !== "APPLY") {
                        return false;
                    }
                    if (!QueryValidationHelper.isNonEmptyArray(transformations[key])) {
                        return false;
                    }
                }
            }

            const group = transformations.GROUP;
            const apply = transformations.APPLY;

            if (!this.isValidApply(apply)) {
                return false;
            }

            if (!this.isValidGroup(group)) {
                return false;
            }

            if (!this.isValidKeys(columns, group, apply)) {
                return false;
            }
        }
        return true;
    }

    private static isValidKeys(columns: any, group: string[], apply: string[]): boolean {
        const applyKeys = this.getApplyKeys(apply);
        for (const key of columns) {
            if (!group.includes(key) && !applyKeys.includes(key)) {
                return false;
            }
        }
        return true;
    }

    private static isValidApply(apply: any[]): boolean {
        for (const applyRule of apply) {
            if (!(typeof applyRule === "object")) {
                return false;
            }

            const keys = Object.keys(applyRule);

            if (keys.length > 1) {
                return false;
            }

            if (!this.isValidApplyRule(applyRule[keys[0]])) {
                return false;
            }
        }
        return true;
    }

    private static isValidGroup(group: string[]): boolean {
        for (const key of group) {
            if (!(typeof key === "string")) {
                return false;
            }
        }
        return true;
    }

    private static isValidApplyRule(applyRule: any): boolean {
        if (!(typeof applyRule === "object")) {
            return false;
        }

        const keys = Object.keys(applyRule);

        if (keys.length > 1) {
            return false;
        }

        return this.isValidApplyToken(applyRule);
    }

    private static isValidApplyToken(applyRule: any): boolean {
        const token = Object.keys(applyRule)[0];

        if (!Constants.APPLY_TOKENS.hasOwnProperty(token)) {
            return false;
        }

        let key = applyRule[token];
        const pos = PerformQueryHelper.getUnderscorePosFromKey(key);
        key = PerformQueryHelper.getParsedKey(key, pos);

        const courseFields: any = Constants.KEY_MAP_COURSES;
        let type = "";
        if (courseFields.hasOwnProperty(key)) {
            type = courseFields[key].type;
        } else {
            const roomFields: any = Constants.KEY_MAP_ROOMS;
            if (roomFields.hasOwnProperty(key)) {
                type = roomFields[key].type;
            }
        }

        return Constants.APPLY_TOKENS[token].type.includes(type);
    }

    private static getApplyKeys(apply: any): string[] {
        let applyKeys = [];

        for (const applyRule of apply) {
            applyKeys.push(Object.keys(applyRule)[0]);
        }
        return applyKeys;
    }
}

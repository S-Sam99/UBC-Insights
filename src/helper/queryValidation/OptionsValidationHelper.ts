import Constants from "../../Constants";
import PerformQueryHelper from "../queryExecution/PerformQueryHelper";
import DatasetValidationHelper from "../DatasetValidationHelper";
import QueryValidationHelper from "./QueryValidationHelper";

/**
 * Centralized QueryValidationHelper Class for functions pertaining to validation purposes.
 */
export default class OptionsValidationHelper {
    public static isValidOptions(query: any): boolean {
        const options = query.OPTIONS;

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

        if (!this.isColumnsReferencingOneDataset(columns, query)) {
            return false;
        }

        if (Object.keys(options).length === 2) {
            return this.isValidOrder(options);
        }

        return true;
    }

    private static isColumnsReferencingOneDataset(columns: any, query: any): boolean {
        const firstDataset = this.getValidDataset(columns);

        if (!firstDataset) {
            return false;
        }

        let allKeys = this.getAllKeys();

        if (query.hasOwnProperty("TRANSFORMATIONS")) {
            return this.isValidColumnKeysWithTransformations(columns, allKeys, firstDataset);
        } else {
            return this.isValidColumnKeysWithoutTransformations(columns, allKeys, firstDataset);
        }
    }

    private static isValidColumnKeysWithoutTransformations(
        columns: any,
        allKeys: string[],
        firstDataset: string
    ): boolean {
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

    private static isValidColumnKeysWithTransformations(
        columns: any,
        allKeys: string[],
        firstDataset: string
    ): boolean {
        for (const key of columns) {
            if (!(typeof key === "string")) {
                return false;
            }

            const underscorePos = PerformQueryHelper.getUnderscorePosFromKey(key);
            if (underscorePos > -1) {
                const keyWithoutId: string = PerformQueryHelper.getParsedKey(key, underscorePos);

                if (!allKeys.includes(keyWithoutId)) {
                    return false;
                }

                if (firstDataset !== PerformQueryHelper.getDatasetIdFromKey(key, underscorePos)) {
                    return false;
                }
            }
        }

        return true;
    }

    private static getAllKeys(): string[] {
        let allKeys = Constants.MKEYS;
        allKeys = allKeys.concat(Constants.SKEYS);
        return allKeys;
    }

    private static getValidDataset(columns: any): string {
        const firstDataset = PerformQueryHelper.getFirstDatasetId(columns);

        if (DatasetValidationHelper.isValidId(firstDataset) &&
            DatasetValidationHelper.isValidIDNotOnDisk(firstDataset)
        ) {
            return null;
        }

        return firstDataset;
    }

    private static isValidOrder(options: any): boolean {
        if (options.hasOwnProperty("ORDER")) {
            const order = options.ORDER;

            if (Array.isArray(order) || !order) {
                return false;
            }

            if (!(typeof order === "string")) {
                if (!(typeof order === "object")) {
                    return false;
                } else {
                    return this.isValidOrderObject(options.COLUMNS, order);
                }
            } else {
                return this.isOrderKeysInColumns(options.COLUMNS, [order]);
            }
        }
        return false;
    }

    private static isValidOrderObject(columns: any, order: any): boolean {
        if (Object.keys(order).length < 1) {
            return false;
        }
        if (!this.isValidOrderDirection(order)) {
            return false;
        }

        return this.isValidOrderKeys(columns, order);
    }

    private static isValidOrderDirection(order: any): boolean {
        if (!order.hasOwnProperty("dir")) {
            return false;
        }

        const direction = order.dir;
        if (!(typeof direction === "string")) {
            return false;
        }

        return Constants.ORDER_DIRECTIONS.includes(direction);
    }

    private static isValidOrderKeys(columns: any, order: any): boolean {
        if (!order.hasOwnProperty("keys")) {
            return false;
        }

        const keys = order.keys;
        if (!QueryValidationHelper.isNonEmptyArray(keys)) {
            return false;
        }

        return this.isOrderKeysInColumns(columns, order.keys);
    }

    private static isOrderKeysInColumns(columns: any, keys: string[]): boolean {
        for (const key of keys) {
            if (!columns.includes(key)) {
                return false;
            }
        }
        return true;
    }
}

import * as fs from "fs-extra";

/**
 * Centralized Helper Class for functions pertaining to validation purposes.
 */
export default class DatasetValidationHelper {
    public static isValidContent(content: any) {
        return content;
    }

    public static isValidId(id: string): boolean {
        return !(!id || id.includes("_") || !id.trim().length);
    }

    public static isValidIDNotOnDisk(id: string): boolean {
        const path = "./data";
        return !fs.existsSync(`${path}/${id}`);
    }
}

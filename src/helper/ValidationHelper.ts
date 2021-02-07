import {InsightDatasetKind} from "../controller/IInsightFacade";
import * as fs from "fs-extra";

/**
 * Localized Helper Class for functions pertaining to validation purposes.
 */
export default class ValidationHelper {
    public static isValidContent(content: any) {
        return content;
    }

    public static isValidId(id: string, dataset: any): boolean {
        if (!id || id.includes("_") || !id.trim().length) {
            return false;
        }
        return !dataset.hasOwnProperty(id);
    }

    public static isValidCourseKind(kind: InsightDatasetKind) {
        return kind === InsightDatasetKind.Courses;
    }

    public static isValidIDNotOnDisk(id: string): boolean {
        const path = "./data";
        if (fs.existsSync(`${path}/${id}`)) {
            return false;
        } else {
            return true;
        }
    }
}

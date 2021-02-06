import {InsightDatasetKind} from "../controller/IInsightFacade";

/**
 * Localized Helper Class for functions pertaining to validation purposes.
 */
export default class ValidationHelper {
    public static isValidContent(content: any) {
        return content;
    }

    public static isValidId(id: string, dataset: any): boolean {
        if (!id) {
            return false;
        }

        if (id.includes("_")) {
            return false;
        }

        if (!id.trim().length) {
            return false;
        }

        return !dataset.hasOwnProperty(id);
    }

    public static isValidCourseKind(kind: InsightDatasetKind) {
        return kind === InsightDatasetKind.Courses;
    }
}

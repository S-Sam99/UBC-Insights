import Constants from "../Constants";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import CourseDataset from "../controller/CourseDataset";
import {InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import Dataset from "../controller/Dataset";

/**
 * Localized Helper Class for functions pertaining to adding course datasets.
 */
export default class AddCourseDatasetHelper {
    public static generateCourseDataset (id: string, kind: InsightDatasetKind, data: JSZip): Promise<Dataset> {
        const promises: any[] = [];

        data.folder(Constants.REQUIRED_DIR_COURSES).forEach((filePath, fileObj) => {
            if (fileObj.dir === false) {
                promises.push(fileObj.async("string"));
            }
        });

        if (promises.length > 0) {
            return Promise.all(promises).then((dataset) => {
                let courseDataset = new CourseDataset(id, kind, dataset);

                if (courseDataset.data.length > 0) {
                    this.persistDataToDisk(id, JSON.stringify(courseDataset));
                    return Promise.resolve(courseDataset);
                } else {
                    return Promise.reject(Constants.MISSING_COURSE_SECTION);
                }
            }).catch((err) => {
                return Promise.reject(err);
            });
        } else {
            return Promise.reject(Constants.MISSING_COURSES);
        }
    }

    private static persistDataToDisk(name: string, data: string): void {
        const path = "./data";
        const cacheDir = __dirname + "/../data";

        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        fs.writeFileSync(`${path}/${name}`, data);
    }

}

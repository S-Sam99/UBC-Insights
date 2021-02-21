import Constants from "../Constants";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import CourseDataset from "../controller/CourseDataset";

/**
 * Localized Helper Class for functions pertaining to adding course datasets.
 */
export default class AddCourseDatasetHelper {
    public static generateCourseDataset (id: string, data: JSZip): Promise<CourseDataset> {
        const promises: any[] = [];

        data.folder(Constants.REQUIRED_DIR).forEach((filePath, fileObj) => {
            if (fileObj.dir === false) {
                promises.push(fileObj.async("string"));
            }
        });

        if (promises.length > 0) {
            return Promise.all(promises).then((dataset) => {
                let courseDataset = new CourseDataset(id, dataset);

                if (courseDataset.allCourses.length > 0) {
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

        fs.writeFileSync(`${path}/${name}`, data);
    }

}

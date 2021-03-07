import Constants from "../Constants";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import RoomDataset from "../controller/RoomDataset";
const parse5 = require('parse5');

/**
 * Localized Helper Class for functions pertaining to adding course datasets.
 */
export default class AddRoomDatasetHelper {

    public static generateRoomDataset (id: string, data: JSZip): Promise<RoomDataset> {
        let promises: any[] = [];
        let parsedData: Promise<string>;

        data.folder(Constants.REQUIRED_DIR_ROOMS+"/campus/discover/buildings-and-classrooms").forEach((filePath, fileObj) => {
            if (fileObj.dir === false) {
                let data = this.parseHTML(fileObj.async("string"));
                promises.push(data);
            }
        });

        if (promises.length > 0) {
            return Promise.all(promises).then((dataset) => {
                let roomDataset = new RoomDataset(id, dataset);
                return Promise.resolve(roomDataset);
                });
            }

        let roomDataset = new RoomDataset(id, parsedData);
        this.persistDataToDisk(id, parsedData);
        return Promise.resolve(roomDataset);

        // if (promises.length > 0) {
        //     return Promise.all(promises).then((dataset) => {
        //         let courseDataset = new CourseDataset(id, dataset);

        //         if (courseDataset.allCourseSections.length > 0) {
        //             this.persistDataToDisk(id, JSON.stringify(courseDataset));
        //             return Promise.resolve(courseDataset);
        //         } else {
        //             return Promise.reject(Constants.MISSING_COURSE_SECTION);
        //         }
        //     }).catch((err) => {
        //         return Promise.reject(err);
        //     });
        // } else {
        //     return Promise.reject(Constants.MISSING_COURSES);
        // }
    }

    private static persistDataToDisk(name: string, data: Promise<string>): void {
        const path = "./data";
        const cacheDir = __dirname + "/../data";

        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        fs.writeFileSync(`${path}/${name}`, data);
    }

    private static parseHTML(html: Promise<string>) : Promise<string>{
        return Promise.resolve(parse5.parse(html));
    }

}

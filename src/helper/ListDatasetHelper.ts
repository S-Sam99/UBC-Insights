import Constants from "../Constants";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import {InsightDatasetKind} from "../controller/IInsightFacade";
import CourseDataset from "../controller/CourseDataset";
import { AnyARecord } from "dns";
import { InsightDataset } from "../controller/IInsightFacade";
import Log from "../Util";

/**
 * Localized Helper Class for functions pertaining to listing added datasets.
 */
export default class ListDatasetHelper {
    public static generateListDataset (datasetList: any, dataList: any): Promise<InsightDataset[]> {
        if (Object.keys(dataList).length > 0) {
            for (let key of Object.keys(dataList)) {
                const temp = dataList[key];
                const dataset: InsightDataset = {
                    id: temp.id,
                    kind: temp.kind,
                    numRows: temp.numRows
                };
                datasetList.push(dataset);
            }
        } else {
            const path = "./data";
            const dir = fs.readdirSync (path);
            dir.forEach ((file) => {
                const data = fs.readFileSync(`${path}/${file}`, "utf8");
                const obj: any = JSON.parse(data);
                const dataset: InsightDataset = {
                    id: obj.id,
                    kind: obj.kind,
                    numRows: obj.numRows
                };
                datasetList.push(dataset);
            });
        }
        return Promise.resolve(datasetList).catch((err) => {
            return Promise.reject(err);
        });
    }
}

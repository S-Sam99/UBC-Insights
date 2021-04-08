import Constants from "../Constants";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import { delimiter } from "path";

/**
 * Localized Helper Class for functions pertaining to removing datasets.
 */
export default class RemoveDatasetHelper {
    public static removeDataset (id: string, datasets: any): Promise<string> {
        this.deleteDatasetLocal(id, datasets);
        return this.deleteDatasetToDisk(id);
    }

    private static deleteDatasetToDisk(name: string): Promise<string> {
        const path = "./data";

        fs.unlinkSync(`${path}/${name}`);

        return Promise.resolve(name);
    }

    private static deleteDatasetLocal(name: string, datasetList: any): void {
        if (Object.keys(datasetList).length > 0) {
            for (let key of Object.keys(datasetList)) {
                const temp = datasetList[key];
                if (name === temp.id) {
                    delete datasetList[name];
                    break;
                }
            }
        }
    }
}

import Constants from "../Constants";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import { delimiter } from "path";

/**
 * Localized Helper Class for functions pertaining to removing datasets.
 */
export default class RemoveDatasetHelper {
    public static removeDataset (id: string): Promise<string> {
        return this.deleteDatasetToDisk(id);
    }

    private static deleteDatasetToDisk(name: string): Promise<string> {
        const path = "./data";

        fs.unlinkSync(`${path}/${name}`);

        return Promise.resolve(name);
    }
}

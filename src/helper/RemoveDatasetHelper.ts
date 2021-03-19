import Constants from "../Constants";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import ValidationHelper from "./ValidationHelper";
import { delimiter } from "path";

/**
 * Localized Helper Class for functions pertaining to removing datasets.
 */
export default class RemoveDatasetHelper {
    public static removeDataset (id: string): Promise<string> {
        this.deleteDatasetToDisk(id);
        return Promise.resolve(id);
    }

    private static deleteDatasetToDisk(name: string): void {
        const path = "./data";

        fs.unlinkSync(`${path}/${name}`);
    }
}

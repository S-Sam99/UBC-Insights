import Constants from "../Constants";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import BuildingDataset from "../controller/BuildingDataset";
import BuildingInfo from "../controller/BuildingInfo";
import Util from "../Util";
import { file } from "jszip";
import { promises } from "dns";
import { readFileSync } from "fs";
import {parse, Document} from "parse5";

/**
 * Localized Helper Class for functions pertaining to adding course datasets.
 */
export default class AddBuildingDatasetHelper {

    public static generateBuildingDataset (id: string, kind: string, data: JSZip): Promise<BuildingDataset> {
        const buildings: any[] = [];
        let buildingInfo: any[] = [];
        let html: any;
        let path = "";
        let code = "";
        let address = "";
        data.folder(Constants.REQUIRED_DIR_ROOMS).forEach((filePath, fileObj) => {
            if (fileObj.dir === false && filePath === "index.htm") {
                html = Constants.REQUIRED_DIR_ROOMS + filePath;
            }
        });

        return this.parseData(html, data).then((parsedData) => {
            buildingInfo  = this.gatherData(parsedData);
            if (buildingInfo.length > 0) {
                for (let paths of buildingInfo) {
                    buildings.push(data.file(Constants.REQUIRED_DIR_ROOMS + paths.getPath()).async("string"));
                }

                return Promise.all(buildings).then((dataset) => {
                    let buildingDataset = new BuildingDataset(id, kind, dataset, buildingInfo);

                    if (buildingDataset.allRooms.length > 0) {
                        this.persistDataToDisk(id, JSON.stringify(buildingDataset));
                        return Promise.resolve(buildingDataset);
                        } else {
                            return Promise.reject(Constants.MISSING_ROOMS);
                        }
                    }).catch((err) => {
                        return Promise.reject(err);
                    });
                } else {
                    return Promise.reject(Constants.MISSING_BUILDINGS);
                }
        });
    }

    private static persistDataToDisk(name: string, data: string): void {
        const path = "./data";
        const cacheDir = __dirname + "/../data";

        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        fs.writeFileSync(`${path}/${name}`, data);
    }

    private static parseData(document: string, data: JSZip): Promise<Document> {
        return data.file(document).async("string").then((rawData: string) => {
            return parse(rawData);
        });
    }

    private static gatherData(data: any): BuildingInfo[] {
        if (data.nodeName === "tbody") {
            let array: any[] = [];
            for (let child of data.childNodes) {
                let temp: any[3] = ["", "", ""];
                this.goThroughChildrenTR(child, "tr", temp);
                if (temp[0] !== "" && temp[1] !== "" && temp[2] !== "") {
                    array.push(new BuildingInfo(temp));
                }
            }
            return array;
    }

        if (data.childNodes && data.childNodes.length > 0) {
            for (let child of data.childNodes) {
                let possibleArray = this.gatherData(child);
                if (possibleArray.length > 0) {
                    return possibleArray;
                }
            }
        }
        return [];
    }

    private static goThroughChildrenTR(data: any, identifier: string, array: any) {
        if (data.nodeName === identifier) {
            for (let child of data.childNodes) {
                this.goThroughChildrenTD(child, "td", array);
            }
            return array;
        }

        if (data.childNodes && data.childNodes.length > 0) {
            for (let child of data.childNodes) {
                this.goThroughChildrenTR(child, identifier, array);
            }
        }
        return array;
    }

    private static goThroughChildrenTD(data: any, identifier: string, array: any) {
        if (data.nodeName === identifier) {
            if (data.attrs[0].value === "views-field views-field-nothing") {
                array[0] = String(data.childNodes[1].attrs[0].value.substring(2));
                return array;
            } else if (data.attrs[0].value === "views-field views-field-field-building-code") {
                array[1] = String(data.childNodes[0].value.substring(2).trim());
                return array;
            } else if (data.attrs[0].value === "views-field views-field-field-building-address") {
                array[2] = String(data.childNodes[0].value.substring(2).trim());
                return array;
            } else {
                return array;
            }
        }
        return array;
    }
}

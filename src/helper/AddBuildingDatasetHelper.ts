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

    public static generateBuildingDataset (id: string, data: JSZip): Promise<BuildingDataset> {
        const buildings: any[] = [];
        let html: any;
        data.folder(Constants.REQUIRED_DIR_ROOMS).forEach((filePath, fileObj) => {
            if (fileObj.dir === false && filePath === "index.htm") {
                html = Constants.REQUIRED_DIR_ROOMS + filePath;
            }
        });

        return this.parseData(html, data).then(this.gatherData).then((info) => {
            if (info.length > 0) {
                for (let paths of info) {
                    buildings.push(data.file(Constants.REQUIRED_DIR_ROOMS + paths.getPath()).async("string"));
                }

                return Promise.all(buildings).then((dataset) => {
                    let buildingDataset = new BuildingDataset(id, dataset, info);

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

    private static parseData(html: string, data: JSZip): Promise<Document> {
        return data.file(html).async("string").then((rawData: string) => {
            return parse(rawData);
        });
    }

    private static gatherData(html: any): Promise<BuildingInfo[]> {
        if (html.nodeName === "tbody") {
            let array: any[] = [];
            for (let child of html.childNodes) {
                let path: string = "";
                let code: string = "";
                let address: string = "";
                this.goThroughChildrenTR(child, "tr", path, code, address);
                if (path !== "" && code !== "" && address !== "") {
                    array.push(new BuildingInfo(path, code, address));
                }
            }
            return Promise.resolve(array).catch((err) => {
                    return Promise.reject(err);
        });
    }

        if (html.childNodes && html.childNodes.length > 0) {
            for (let child of html.childNodes) {
                let possibleArray = this.gatherData(child);
                if (possibleArray != null) {
                    return possibleArray;
                }
            }
        }
        return null;
    }

    private static goThroughChildrenTR(html: any, identifier: string, path: string, code: string, address: string) {
        if (html.nodeName === identifier) {
            for (let child of html.childNodes) {
                this.goThroughChildrenTD(child, "td", path, code, address);
            }
        }

        if (html.childNodes && html.childNodes.length > 0) {
            for (let child of html.childNodes) {
                this.goThroughChildrenTR(child, identifier, path, code, address);
            }
        }
    }

    private static goThroughChildrenTD(html: any, identifier: string, path: string, code: string, address: string) {
        if (html.nodeName === identifier) {
            if (html.attrs[0].value === "views-field views-field-field-building-image") {
                path = String(html.childNodes[1].attrs[0].value.substring(1));
            } else if (html.attrs[0].value === "views-field views-field-field-building-code") {
                code = String(html.childNodes[0].value.substring(2).trim());
            } else if (html.attrs[0].value === "views-field views-field-field-building-address") {
                    address = String(html.childNodes[0].value);
            } else {
                return;
            }
        }

        if (html.childNodes && html.childNodes.length > 0) {
            for (let child of html.childNodes) {
                this.goThroughChildrenTD(child, identifier, path, code, address);
            }
        }
    }
}

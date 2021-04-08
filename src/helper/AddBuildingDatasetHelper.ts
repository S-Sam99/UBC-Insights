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
import {InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";

/**
 * Localized Helper Class for functions pertaining to adding course datasets.
 */
export default class AddBuildingDatasetHelper {

    public static generateBuildingDataset (
        id: string,
        kind: InsightDatasetKind,
        data: JSZip
    ): Promise<BuildingDataset> {
        const buildings: any[] = [];
        let buildingInfo: any[] = [];
        let html: any;
        data.folder(Constants.REQUIRED_DIR_ROOMS).forEach((filePath, fileObj) => {
            if (fileObj.dir === false && filePath === "index.htm") {
                html = Constants.REQUIRED_DIR_ROOMS + filePath;
            }
        });

        return this.setupData(buildings, html, data, buildingInfo).then((dataset) => {
            return Promise.resolve(this.createBuildingDataset(dataset, id, kind, buildingInfo)).then((result) => {
                if (result.data.length > 0) {
                    this.persistDataToDisk(id, JSON.stringify(result));
                    return Promise.resolve(result);
                } else {
                    return Promise.reject(Constants.MISSING_ROOMS);
                }
            }).catch((err) => {
                return Promise.reject(err);
            });
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    private static setupData (buildings: any[], html: any, data: JSZip, buildingInfo: any[]): Promise<any> {
        return this.parseData(html, data).then((parsedData) => {
            this.gatherData(parsedData, buildingInfo);
            if (buildingInfo.length > 0) {
                for (let paths of buildingInfo) {
                    buildings.push(data.file(Constants.REQUIRED_DIR_ROOMS + paths.getPath()).async("string"));
                }
                return Promise.all(buildings).then((dataset) => {
                    return Promise.resolve(dataset);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            } else {
                return Promise.reject(Constants.MISSING_BUILDINGS);
            }
        });
    }

    private static createBuildingDataset (dataset: any, id: string, k: InsightDatasetKind, bInfo: any): Promise<any> {
        return new Promise<BuildingDataset>((resolve, reject) => {
            let buildingDataset: BuildingDataset = new BuildingDataset(id, k, bInfo);
            return buildingDataset.getData(dataset).then((data) => {
                    return resolve(data);
            }).catch((err) => {
                return reject(err);
            });
        }).catch((err) => {
            return Promise.reject(err);
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

    private static gatherData(data: any, buildingInfo: any[]): BuildingInfo[] {
        if (data.nodeName === "tbody") {
            for (let child of data.childNodes) {
                let temp: any[3] = ["", "", ""];
                this.goThroughChildrenTR(child, "tr", temp);
                if (temp[0] !== "" && temp[1] !== "" && temp[2] !== "") {
                    buildingInfo.push(new BuildingInfo(temp));
                }
            }
            return buildingInfo;
    }

        if (data.childNodes && data.childNodes.length > 0) {
            for (let child of data.childNodes) {
                let possibleArray = this.gatherData(child, buildingInfo);
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

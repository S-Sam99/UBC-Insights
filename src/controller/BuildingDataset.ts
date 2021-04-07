import Log from "../Util";
import BuildingInfo from "./BuildingInfo";
import BuildingData from "./BuildingData";
import Dataset from "./Dataset";
import {InsightDatasetKind} from "./IInsightFacade";
const parse5 = require("parse5");
const http = require("http");

/**
 * BuildingDataset Class
 */
export default class BuildingDataset extends Dataset {
    public buildingInfo: BuildingInfo[];
    public shortName: string;
    public count: number;

    constructor(datasetId: string, kind: InsightDatasetKind, buildingInfo: BuildingInfo[]) {
        super(datasetId, kind);
        this.buildingInfo = buildingInfo;
        this.count = 0;
    }

    public getData(dataset: any): Promise<BuildingDataset> {
        if (dataset.length > 0) {
            return Promise.resolve(this.parseDataset(dataset));
        }
    }

    private parseDataset(dataset: string[]): Promise<any> {
            const promises: any[] = [];
            const buildings: any[] = [];
            for (const fileData of dataset) {
                try {
                    const parsedData = this.parseData(fileData);
                    if (this.checkValidity(parsedData)) {
                        let latLong: any[2] = [0, 0];
                        buildings.push(parsedData);
                        const currentBuildInfo = this.buildingInfo[this.count];
                        promises.push(this.findCoordinates(currentBuildInfo.getAddress(), latLong));
                    }
                } catch (err) {
                    Log.error(err);
                }
                this.count++;
            }
            this.count = 0;
            return Promise.all(promises).then((locations) => {
                for (let geo of locations) {
                    if (geo && (geo[0] !== 0 || geo[1] !== 0)) {
                        const currentBuildInfo = this.buildingInfo[this.count];
                        const currentBuild = buildings[this.count];
                        const buildingData = new BuildingData(this.id, currentBuild, currentBuildInfo, geo);
                        for (let rooms of buildingData.allRooms) {
                            if (rooms.isValid) {
                                this.numRows++;
                                this.data.push(rooms);
                            }
                        }
                    }
                    this.count++;
                }
                return Promise.resolve(this);
            });
    }

    private findCoordinates(address: string, array: any[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const codedAddress = encodeURI(address);
            const link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team138/" + codedAddress;
            http.get(link, (result: any) => {
                const { statusCode } = result;
                if (statusCode !== 200) {
                    return reject("You got a " + result.statusCode + " error code!");
                }
                let rawData = "";
                result.on("data", (chunk: any) => {
                    rawData += chunk;
                });
                result.on("end", () => {
                    try {
                        const location = JSON.parse(rawData);
                        if (location.error && location.error !== null) {
                            array[0] = 0;
                            array[1] = 0;
                        } else {
                            array[0] = location.lon;
                            array[1] = location.lat;
                        }
                        return resolve(array);
                    } catch (err) {
                        return reject(err);
                    }
                });
            }).on("error", (err: any) => {
                reject(err);
            });
        });
    }

    private parseData(html: any): Promise<any> {
        return parse5.parse(html);
    }

    private checkValidity(html: any): boolean {
        if (html.nodeName === "div") {
            if (html.attrs[0].value.startsWith("view view-buildings-and-classrooms view-id-buildings_and_classrooms")) {
                return true;
            }
        }

        if (html.childNodes && html.childNodes.length > 0) {
            for (let child of html.childNodes) {
                let possibleValidity = this.checkValidity(child);
                if (possibleValidity) {
                    return possibleValidity;
                }
            }
        }
        return false;
    }
}

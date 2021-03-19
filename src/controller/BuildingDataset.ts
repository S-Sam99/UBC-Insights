import Constants from "../Constants";
import RoomData from "./RoomData";
import Log from "../Util";
import BuildingInfo from "./BuildingInfo";
import BuildingData from "./BuildingData";
const parse5 = require("parse5");
const http = require("http");

/**
 * BuildingDataset Class
 */
export default class BuildingDataset {
    public id: string;
    public kind: string;
    public allRooms: any[];
    public buildingInfo: BuildingInfo[];
    public seatNum: number;
    public shortName: string;
    public lat: number;
    public long: number;
    public count: number;
    public numRows: number;

    constructor(datasetId: string, kind: string, dataset: any, buildingInfo: BuildingInfo[]) {
        this.id = datasetId;
        this.kind = kind;
        this.allRooms = [];
        this.buildingInfo = buildingInfo;
        this.seatNum = 0;
        this.lat = 0;
        this.long = 0;
        this.count = 0;
        this.numRows = 0;

        if (dataset.length > 0) {
            this.parseDataset(dataset);
        }
    }

    private parseDataset(dataset: string[]) {
        for (const fileData of dataset) {
            try {
                const parsedData = this.parseData(fileData);
                if (this.checkValidity(parsedData)) {
                    let latLong: any[2] = [0, 1];
                    const currentBuildInfo = this.buildingInfo[this.count];
                    // this.findCoordinates(currentBuildInfo.getAddress(), latLong).then((location) => {
                    if (latLong[0] !== 0 || latLong[1] !== 0) {
                        const buildingData = new BuildingData(this.id, parsedData, currentBuildInfo, latLong);
                        for (let rooms of buildingData.allRooms) {
                            if (rooms.isValid) {
                                this.numRows++;
                                this.allRooms.push(rooms);
                            }
                        }
                    }
                    // });
                }
            } catch (err) {
                Log.error(err);
            }
            this.count++;
        }
    }

    // private async findCoordinates(address: string, array: any[]): Promise<any> {
    //     return new Promise<any>((resolve, reject) => {
    //         const codedAddress = encodeURI(address);
    //         const link = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team138/" + codedAddress;
    //         http.get(link, (result: any) => {
    //             const { statusCode } = result;
    //             if (statusCode !== 200) {
    //                 reject("You got a " + result.statusCode + " error code!");
    //             }
    //             let rawData = "";
    //             result.on("data", (chunk: any) => {
    //                 rawData += chunk;
    //             });
    //             result.on("end", () => {
    //                 try {
    //                     const location = JSON.parse(rawData);
    //                     array[0] = location.lon;
    //                     array[1] = location.lat;
    //                     resolve(array);
    //                 } catch (err) {
    //                     reject(err);
    //                 }
    //             });
    //         }).on("error", (err: any) => {
    //             reject(err);
    //         });
    //     });
    // }

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

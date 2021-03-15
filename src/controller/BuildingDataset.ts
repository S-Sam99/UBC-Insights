import Constants from "../Constants";
import RoomData from "./RoomData";
import Log from "../Util";
import BuildingInfo from "./BuildingInfo";
import BuildingData from "./BuildingData";
const parse5 = require("parse5");

/**
 * BuildingDataset Class
 */
export default class BuildingDataset {
    public id: string;
    public allRooms: any[];
    public buildingInfo: BuildingInfo[];
    public seatNum: number;
    public shortName: string;
    public lat: number;
    public long: number;
    public count: number;

    constructor(datasetId: string, dataset: any, buildingInfo: BuildingInfo[]) {
        this.id = datasetId;
        this.allRooms = [];
        this.buildingInfo = buildingInfo;
        this.seatNum = 0;
        this.lat = 0;
        this.long = 0;
        this.count = 0;

        if (dataset.length > 0) {
            this.parseDataset(dataset);
        }
    }

    private parseDataset(dataset: string[]) {
        const roomFieldMapping: object = Constants.KEY_MAP_ROOMS;

        for (const fileData of dataset) {
            try {
                this.parseHTML(fileData).then((parsedData) => {
                    if (this.checkValidity(parsedData)) {
                        const buildingData: any = new BuildingData(this.id, parsedData, this.buildingInfo[this.count]);
                        for (let rooms of buildingData.allRooms) {
                            if (rooms.isValid) {
                                this.allRooms.push(rooms);
                            }
                        }
                    }
                });
            } catch (err) {
                Log.error(err);
            }
            this.count++;
        }
    }

    private parseHTML(html: string): Promise<any> {
        return Promise.resolve(parse5.parse(html));
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

    private setAddress(html: any): string {
        if (html.nodeName === "div" && html.attrs[0].value === "building-info") {
            return String(html.childNodes[3].childNodes[0].childNodes[0].value);
        }

        if (html.childNodes && html.childNodes.length > 0) {
            for (let child of html.childNodes) {
                let possibleAddress = this.setAddress(child);
                if (possibleAddress !== "") {
                    return possibleAddress;
                }
            }
        }
        return "";
    }

    private setFullName(html: any): string {
        if (html.nodeName === "div" && html.attrs[0].value === "building-info") {
            return String(html.childNodes[1].childNodes[0].childNodes[0].value);
        }

        if (html.childNodes && html.childNodes.length > 0) {
            for (let child of html.childNodes) {
                let possibleAddress = this.setFullName(child);
                if (possibleAddress !== "") {
                    return possibleAddress;
                }
            }
        }
        return "";
    }
}

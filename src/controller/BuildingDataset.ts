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
                    const buildingData: any = new BuildingData(this.id, parsedData, this.buildingInfo[this.count]);
                    for (let rooms of buildingData.allRooms) {
                        if (rooms.isValid) {
                            this.numRows++;
                            this.allRooms.push(rooms);
                        }
                    }
                }
            } catch (err) {
                Log.error(err);
            }
            this.count++;
        }
    }

    private parseData(html: string): Promise<any> {
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

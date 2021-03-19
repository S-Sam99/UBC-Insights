import Log from "../Util";
import BuildingInfo from "./BuildingInfo";
import BuildingData from "./BuildingData";
import Dataset from "./Dataset";
import {InsightDatasetKind} from "./IInsightFacade";
const parse5 = require("parse5");

/**
 * BuildingDataset Class
 */
export default class BuildingDataset extends Dataset {
    public buildingInfo: BuildingInfo[];
    public seatNum: number;
    public shortName: string;
    public lat: number;
    public long: number;
    public count: number;

    constructor(datasetId: string, kind: InsightDatasetKind, dataset: any, buildingInfo: BuildingInfo[]) {
        super(datasetId, kind);
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
        for (const fileData of dataset) {
            try {
                const parsedData = this.parseData(fileData);
                if (this.checkValidity(parsedData)) {
                    const buildingData: any = new BuildingData(this.id, parsedData, this.buildingInfo[this.count]);
                    for (let rooms of buildingData.allRooms) {
                        if (rooms.isValid) {
                            this.numRows++;
                            this.data.push(rooms);
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

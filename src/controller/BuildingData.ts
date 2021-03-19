import Constants from "../Constants";
import RoomData from "./RoomData";
import Log from "../Util";
import { Console } from "console";
import BuildingInfo from "./BuildingInfo";
import { Http2ServerRequest } from "http2";
const parse5 = require("parse5");
const http = require("http");

/**
 * BuildingData Class
 */
export default class BuildingData {
    public id: string;
    public buildingInfo: BuildingInfo;
    public allRooms: any[];
    public seatNum: number;
    public address: string;
    public fullName: string;
    public shortName: string;
    public lat: number;
    public long: number;

    constructor(datasetId: string, data: any, buildingInfo: BuildingInfo, coordinates: any[]) {
        this.id = datasetId;
        this.buildingInfo = buildingInfo;
        this.allRooms = [];
        this.seatNum = 0;
        this.lat = coordinates[1];
        this.long = coordinates[0];
        this.parseDataset(data);
    }

    private parseDataset(data: any) {
        const roomFieldMapping: object = Constants.KEY_MAP_ROOMS;
        this.address = this.buildingInfo.getAddress();
        this.shortName = this.buildingInfo.getCode();
        try {
            this.fullName = this.setFullName(data);
            this.findRooms(data, roomFieldMapping);
        } catch (err) {
            Log.error(err);
        }
    }

    private setFullName(html: any): string {
        if (html.nodeName === "span" && html.attrs.length > 0 && html.attrs[0].value === "field-content") {
            return String(html.childNodes[0].value);
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

    private findRooms(html: any, fieldMapping: any): void {
        if (html.nodeName === "tbody") {
            for (let child of html.childNodes) {
                if (child.nodeName === "tr") {
                    let fields: any[] = [];
                    this.setupArray(fields);
                    for (let data of child.childNodes) {
                        if (data.nodeName === "td") {
                            switch (data.attrs[0].value) {
                                case "views-field views-field-field-room-number": {
                                    this.setRoomNum(data, fields);
                                    break;
                                }
                                case "views-field views-field-field-room-capacity": {
                                    this.setRoomCapacity(data, fields);
                                    break;
                                }
                                case "views-field views-field-field-room-furniture": {
                                    this.setRoomFurniture(data, fields);
                                    break;
                                }
                                case "views-field views-field-field-room-type": {
                                    this.setRoomType(data, fields);
                                    break;
                                }
                                case "views-field views-field-nothing": {
                                    this.setRoomHref(data, fields);
                                    break;
                                }
                                default: {
                                    break;
                                }
                            }
                        }
                    }
                    if (fields[0] !== "" && fields[1] !== "" && fields[2] !== "") {
                        const room = new RoomData(this.id, fields, fieldMapping);
                        this.allRooms.push(room);
                    }
                }
            }
        }
        if (html.childNodes && html.childNodes.length > 0) {
            for (let child of html.childNodes) {
                this.findRooms(child, fieldMapping);
            }
        }
    }

    private setupArray(array: any): void {
        if (this.lat && this.long) {
            array["lat"] = this.lat;
            array["lon"] = this.long;
        } else {
            array["lat"] = 0;
            array["lon"] = 0;
        }
        array["fullname"] = this.fullName;
        array["shortname"] = this.shortName;
        array["address"] = this.address;
        array["seats"] = 0;
    }

    private setRoomNum(data: any, array: any): void {
        let variable = this.findRoomNum(data.childNodes);
        array["number"] = variable;
        array["name"] = this.shortName + "_" + variable;
    }

    private setRoomCapacity(data: any, array: any): void {
        let variable = this.findRoomCapacity(data.childNodes);
        array["seats"] = variable;
    }

    private setRoomFurniture(data: any,  array: any): void {
        let variable = this.findRoomFurniture(data.childNodes);
        array["furniture"] = variable;
    }

    private setRoomType(data: any,  array: any): void {
        let variable = this.findRoomType(data.childNodes);
        array["type"] = variable;
    }

    private setRoomHref(data: any, array: any): void {
        let variable = this.findRoomHref(data.childNodes);
        array["href"] = variable;
    }

    private findRoomNum(data: any): string {
        return String(data[1].childNodes[0].value.toString());
    }

    private findRoomCapacity(data: any): number {
        const temp = data[0].value.substring(2);
        return Number(temp.trim());
    }

    private findRoomType(data: any): string {
        const temp = data[0].value.substring(2);
        return String(temp.trim());
    }

    private findRoomFurniture(data: any): string {
        const temp = data[0].value.substring(2);
        return String(temp.trim());
    }

    private findRoomHref(data: any): string {
        return String(data[1].attrs[0].value);
    }
}

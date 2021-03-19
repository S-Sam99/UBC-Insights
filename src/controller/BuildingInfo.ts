import Constants from "../Constants";
import CourseSection from "./CourseSection";
import Log from "../Util";

/**
 * BuildingInfo Class
 */
export default class BuildingInfo {
    private path: string;
    private code: string;
    private address: string;

    constructor(array: any) {
        this.path = array[0];
        this.code = array[1];
        this.address = array[2];
    }

    public getPath(): string {
        return this.path;
    }

    public getCode(): string {
        return this.code;
    }

    public getAddress(): string {
        return this.address;
    }
}

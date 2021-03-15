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

    constructor(path: string, code: string, address: string) {
        this.path = path;
        this.code = code;
        this.address = address;
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

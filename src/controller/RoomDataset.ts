import Constants from "../Constants";
import CourseSection from "./CourseSection";
import Log from "../Util";

/**
 * RoomDataset Class
 */
export default class RoomDataset {
    public id: string;
    public allRooms: any[];
    public seatNum: number;

    constructor(datasetId: string, element: any) {
        this.id = datasetId;
        this.allRooms = [];
        this.seatNum = 0;

        if (element.length > 0) {
            this.parseDataset(element);
        }
    }

    private parseDataset(element: string[]) {
        const roomFieldMapping: object = Constants.KEY_MAP_ROOMS;

        for (const fileData of element) {
            try {
                const courseData: any = JSON.parse(fileData);
                if (Object.keys(courseData).length > 0 && courseData.hasOwnProperty("result")) {
                    const results: object[] = courseData.result;
                    for (let courseSectionData of results) {
                        const courseSection = new CourseSection(this.id, courseSectionData, roomFieldMapping);
                        if (courseSection.isValid) {
                            this.seatNum++;
                            this.allRooms.push(courseSection);
                        }
                    }
                }
            } catch (err) {
                Log.error(err);
            }
        }
    }
}

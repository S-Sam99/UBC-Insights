/**
 * RoomData Class
 */

 export default class RoomData {
    public data: any;
    public isValid: boolean;


    constructor(datasetId: string, roomData: object, fieldMapping: any) {
        this.data = {};
        this.isValid = true;
        this.setRoomData(datasetId, roomData, fieldMapping);
    }

    private setRoomData(datasetId: string, roomData: any, fieldMapping: any) {
        for (const key in fieldMapping) {
            if (fieldMapping.hasOwnProperty(key)) {
                const field = fieldMapping[key];
                switch (field.type) {
                    case "number": {
                        let value: number = roomData[field.name];
                        if (value === null || value === undefined) {
                            this.isValid = false;
                            break;
                        }
                        this.data[`${datasetId}_${key}`] = value;
                        break;
                    }
                    default: {
                        const value: string = roomData[field.name].toString();
                        if (value === null || value === undefined) {
                            this.isValid = false;
                            break;
                        }
                        this.data[`${datasetId}_${key}`] = value;
                    }
                }
            }
        }
    }
}

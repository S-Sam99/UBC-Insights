/**
 * CourseSection Class
 */
export default class CourseSection {
    public data: any;
    public isValid: boolean;

    constructor(datasetId: string, courseSectionData: object, fieldMapping: any) {
        this.data = {};
        this.isValid = true;
        this.setCourseSectionData(datasetId, courseSectionData, fieldMapping);
    }

    private setCourseSectionData(datasetId: string, courseSectionData: any, fieldMapping: any) {
        for (const key in fieldMapping) {
            if (fieldMapping.hasOwnProperty(key)) {
                const field = fieldMapping[key];
                const value = courseSectionData[field.name];

                if (value === null || value === undefined) {
                    this.isValid = false;
                    break;
                }
                this.data[`${datasetId}_${key}`] = value;
            }
        }
    }
}

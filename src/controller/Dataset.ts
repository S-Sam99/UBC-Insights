import {InsightDatasetKind} from "./IInsightFacade";

export default abstract class Dataset {
    public id: string;
    public kind: InsightDatasetKind;
    public numRows: number;
    public data: any[];

    protected constructor(id: string, kind: InsightDatasetKind) {
        this.id = id;
        this.kind = kind;
        this.numRows = 0;
        this.data = [];
    }
}

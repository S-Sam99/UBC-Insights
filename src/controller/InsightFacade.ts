import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import * as JSZip from "jszip";
import Constants from "../Constants";
import ValidationHelper from "../helper/ValidationHelper";
import AddCourseDatasetHelper from "../helper/AddCourseDatasetHelper";
import * as fs from "fs-extra";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    public courseDatasets: any;

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        this.courseDatasets = {};
    }

    /**
     * Add a dataset to insightUBC.
     *
     * @param id  The id of the dataset being added.
     * @param content  The base64 content of the dataset. This content should be in the form of a serialized zip file.
     * @param kind  The kind of the dataset
     *
     * @return Promise <string[]>
     *
     * The promise should fulfill on a successful add, reject for any failures.
     * The promise should fulfill with a string array,
     * containing the ids of all currently added datasets upon a successful add.
     * The promise should reject with an InsightError describing the error.
     *
     * An id is invalid if it contains an underscore, or is only whitespace characters.
     * If id is the same as the id of an already added dataset, the dataset should be rejected and not saved.
     *
     * After receiving the dataset, it should be processed into a data structure of
     * your design. The processed data structure should be persisted to disk; your
     * system should be able to load this persisted value into memory for answering
     * queries.
     *
     * Ultimately, a dataset must be added or loaded from disk before queries can
     * be successfully answered.
     */
    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        if (ValidationHelper.isValidIDNotOnDisk(id)) {
            if (ValidationHelper.isValidId(id)) {
                if (ValidationHelper.isValidCourseKind(kind)) {
                    if (ValidationHelper.isValidContent(content)) {
                        return this.unzipCourseDataset(id, content);
                    } else {
                        return Promise.reject(new InsightError(Constants.INVALID_CONTENT));
                    }
                } else {
                    return Promise.reject(new InsightError(Constants.INVALID_KIND_COURSES));
                }
            } else {
                return Promise.reject(new InsightError(`${Constants.INVALID_ID} ${id}`));
            }
        } else {
            return Promise.reject(new InsightError(Constants.DATASET_ALREADY_ADDED));
    }
}

    private unzipCourseDataset(id: string, content: string): Promise<string[]> {
        return JSZip.loadAsync(content, {base64: true})
            .then((data) => {
                if (data["files"].hasOwnProperty(Constants.REQUIRED_DIR)) {
                    return AddCourseDatasetHelper.generateCourseDataset(id, data)
                        .then((dataset) => {
                            this.courseDatasets[id] = dataset;
                            return Promise.resolve(Object.keys(this.courseDatasets));
                        }).catch((err) => {
                            return Promise.reject(new InsightError(err));
                        });
                } else {
                    return Promise.reject(new InsightError(Constants.MISSING_COURSES_FOLDER));
                }
            }).catch(() => {
                return Promise.reject(new InsightError(Constants.DATASET_NOT_ZIP));
            });
    }

    /**
     * Remove a dataset from insightUBC.
     *
     * @param id  The id of the dataset to remove.
     *
     * @return Promise <string>
     *
     * The promise should fulfill upon a successful removal, reject on any error.
     * Attempting to remove a dataset that hasn't been added yet counts as an error.
     *
     * An id is invalid if it contains an underscore, or is only whitespace characters.
     *
     * The promise should fulfill with the id of the dataset that was removed.
     * The promise should reject with a NotFoundError (if a valid id was not yet added)
     * or an InsightError (invalid id or any other source of failure) describing the error.
     *
     * This will delete both disk and memory caches for the dataset for the id meaning
     * that subsequent queries for that id should fail unless a new addDataset happens first.
     */
    public removeDataset(id: string): Promise<string> {
        return Promise.reject("Not implemented.");
    }

    /**
     * Perform a query on insightUBC.
     *
     * @param query  The query to be performed.
     *
     * If a query is incorrectly formatted, references a dataset not added (in memory or on disk),
     * or references multiple datasets, it should be rejected with an InsightError.
     * If a query would return more than 5000 results, it should be rejected with a ResultTooLargeError.
     *
     * @return Promise <any[]>
     *
     * The promise should fulfill with an array of results.
     * The promise should reject with an InsightError describing the error.
     */
    public performQuery(query: any): Promise<any[]> {
        if (!ValidationHelper.isValidQuery(query)) {
            return Promise.reject(new InsightError("Query is incorrectly formatted."));
        }
        return Promise.resolve([]);
    }

    /**
     * List all currently added datasets, their types, and number of rows.
     *
     * @return Promise <InsightDataset[]>
     * The promise should fulfill an array of currently added InsightDatasets, and will only fulfill.
     */
    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}

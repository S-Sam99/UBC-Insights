import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    ResultTooLargeError,
    NotFoundError,
    InsightError
} from "./IInsightFacade";

import * as JSZip from "jszip";
import Constants from "../Constants";
import DatasetValidationHelper from "../helper/DatasetValidationHelper";
import AddCourseDatasetHelper from "../helper/AddCourseDatasetHelper";
import AddBuildingDatasetHelper from "../helper/AddBuildingDatasetHelper";
import PerformQueryHelper from "../helper/queryExecution/PerformQueryHelper";
import { fstat } from "fs-extra";
import * as fs from "fs-extra";
import RemoveDatasetHelper from "../helper/RemoveDatasetHelper";
import { files } from "jszip";
import CourseDataset from "../controller/CourseDataset";
import ListDatasetHelper from "../helper/ListDatasetHelper";
import QueryValidationHelper from "../helper/queryValidation/QueryValidationHelper";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    public datasets: InsightDataset[];
    public ids: string[];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        this.datasets = [];
        this.ids = [];
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
        return new Promise<string[]>((resolve, reject) => {
            if (!DatasetValidationHelper.isValidIDNotOnDisk(id)) {
                return reject(new InsightError(Constants.DATASET_ALREADY_ADDED));
            }

            if (!DatasetValidationHelper.isValidId(id)) {
                return reject(new InsightError(`${Constants.INVALID_ID} ${id}`));
            }

            if (!DatasetValidationHelper.isValidContent(content)) {
                return reject(new InsightError(Constants.INVALID_CONTENT));
            }

            return this.unzipDataset(id, kind, content).then((result) => {
                this.ids.push(result);
                return resolve(this.ids);
            }).catch((err) => {
                return reject(err);
            });
        });
}

    private unzipDataset(id: string, kind: InsightDatasetKind, content: string): Promise<string> {
        return JSZip.loadAsync(content, {base64: true})
            .then((data) => {
                if (data["files"].hasOwnProperty(Constants.REQUIRED_DIR_COURSES)) {
                    return AddCourseDatasetHelper.generateCourseDataset(id, kind, data)
                        .then((dataset) => {
                            const temp: InsightDataset = {id: id, kind: kind, numRows: dataset.numRows};
                            this.datasets.push(temp);
                            return Promise.resolve(id);
                        }).catch((err) => {
                            return Promise.reject(new InsightError(err));
                        });
                } else {
                    if (data["files"].hasOwnProperty(Constants.REQUIRED_DIR_ROOMS)) {
                        return AddBuildingDatasetHelper.generateBuildingDataset(id, kind, data)
                        .then((dataset) => {
                            const temp: InsightDataset = {id: id, kind: kind, numRows: dataset.numRows};
                            this.datasets.push(temp);
                            return Promise.resolve(id);
                        }).catch((err) => {
                            return Promise.reject(new InsightError(err));
                        });
                    }
                    return Promise.reject(new InsightError(Constants.MISSING_MAIN_FOLDER));
                }
            }).catch((e) => {
                if (e instanceof InsightError) {
                    return Promise.reject(e);
                }
                return Promise.reject(new InsightError(Constants.DATASET_NOT_ZIP + e));
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
        return new Promise<string>((resolve, reject) => {
        if (!DatasetValidationHelper.isValidId(id)) {
            return reject(new InsightError(`${Constants.INVALID_ID} ${id}`));
        }

        if (DatasetValidationHelper.isValidIDNotOnDisk(id)) {
            return reject(new NotFoundError(Constants.DATASET_NOT_YET_ADDED));
        }

        return resolve(RemoveDatasetHelper.removeDataset(id, this.datasets));
        });
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
        if (!QueryValidationHelper.isValidQuery(query)) {
            return Promise.reject(new InsightError("Query is incorrectly formatted."));
        }
        const results = PerformQueryHelper.performDatasetQuery(query);
        if (results.length > Constants.MAX_RESULTS_SIZE) {
            return Promise.reject(new ResultTooLargeError(Constants.QUERY_RESULT_TOO_LARGE));
        }
        return Promise.resolve(results);
    }

    /**
     * List all currently added datasets, their types, and number of rows.
     *
     * @return Promise <InsightDataset[]>
     * The promise should fulfill an array of currently added InsightDatasets, and will only fulfill.
     */
    public listDatasets(): Promise<InsightDataset[]> {
        return new Promise<InsightDataset[]>((resolve, reject) => {
            resolve(this.datasets);
        });
    }
}

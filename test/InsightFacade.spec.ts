import * as chai from "chai";
import {expect} from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import { InsightDatasetKind, InsightDataset, InsightError, NotFoundError } from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import Constants from "../src/Constants";
// This extends chai with assertions that natively support Promises
chai.use(chaiAsPromised);

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any; // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string; // This is injected when reading the file
}

describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
        missingCoursesFolder: "./test/data/missingCoursesFolder.zip",
        multipleCourseSections: "./test/data/multipleCourseSections.zip",
        notZipFile: "./test/data/notZipFile.txt",
        oneCourseSection: "./test/data/oneCourseSection.zip",
        valid_courses: "./test/data/valid_courses.zip",
        validCourseWithNonJsonCourses: "./test/data/validCourseWithNonJsonCourses.zip",
        validCourseWithZeroCourseSections: "./test/data/validCourseWithZeroCourseSections.zip",
        zeroCourses: "./test/data/zeroCourses.zip",
        zeroCourseSections: "./test/data/zeroCourseSections.zip",
        smallCourses: "./test/data/smallCourses.zip",
        nonZip: "./test/data/nonZip",
        textFiles: "./test/data/textFiles.zip",
        oneValidCourse: "./test/data/oneValidCourse.zip",
        moreThanOneValidCourse: "./test/data/moreThanOneValidCourse.zip",
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs
                .readFileSync(datasetsToLoad[id])
                .toString("base64");
        }
        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs after each test, which should make each test independent from the previous one
        // Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });
    // ------------------------------ InsightFacade.addDataset() ------------------------------
    // Fulfill Test Cases
    it("Should fulfill addition of valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];

        return expect(insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        )).to.eventually.deep.equal(expected);
    });

    it("Should fulfill addition of valid dataset - Rooms", function () {
        const id: string = "rooms";
        const expected: string[] = [id];

        return expect(insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        )).to.eventually.deep.equal(expected);
    });
    //
    // it("Should fulfill addition of valid dataset with one course section", function () {
    //     const id: string = "oneCourseSection";
    //     const expected: string[] = [id];
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(expected);
    // });
    //
    // it("Should fulfill addition of valid dataset with multiple course sections", function () {
    //     const id: string = "multipleCourseSections";
    //     const expected: string[] = [id];
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(expected);
    // });
    //
    // it("Should fulfill addition of valid dataset with valid course, skip zero course sections", function () {
    //     const id: string = "validCourseWithZeroCourseSections";
    //     const expected: string[] = [id];
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(expected);
    // });
    //
    // it("Should fulfill addition of valid dataset with valid course, skip non-JSON courses", function () {
    //     const id: string = "validCourseWithNonJsonCourses";
    //     const expected: string[] = [id];
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(expected);
    // });
    //
    // it("Should fulfill addition of valid dataset, processed data structure persisted to disk", function () {
    //     const id: string = "validCourseWithNonJsonCourses";
    //     const expected: string[] = [id];
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(expected)
    //         .then(() => {
    //             try {
    //                 const newInsightFacade = new InsightFacade();
    //                 const courses: InsightDataset = {
    //                     id: id,
    //                     kind: InsightDatasetKind.Courses,
    //                     numRows: 94
    //                 };
    //                 const listExpected: InsightDataset[] = [courses];
    //
    //                 return expect(newInsightFacade.listDatasets())
    //                     .to.eventually.deep.equal(listExpected);
    //             } catch (err) {
    //                 Log.error(err);
    //             }
    //         });
    // });
    //
    // // Reject Test Cases
    // it("Should reject addition of dataset with invalid Kind of Rooms", function () {
    //     const id: string = "courses";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Rooms,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with ID including whitespaces only", function () {
    //     const id: string = "  ";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with ID including underscore", function () {
    //     const id: string = "valid_courses";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with duplicate ID", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(expected)
    //         .then(() => {
    //             return expect(insightFacade.addDataset(
    //                     id,
    //                     datasets[id],
    //                     InsightDatasetKind.Courses,
    //                 )).to.eventually.be.rejectedWith(InsightError);
    //             }
    //         );
    // });
    //
    it("Should reject addition of dataset with zero course sections", function () {
        const id: string = "zeroCourseSections";

        return expect(insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        )).to.eventually.be.rejectedWith(InsightError);
    });
    //
    // it("Should reject addition of dataset with non-JSON courses", function () {
    //     const id: string = "nonJsonCourses";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with zero courses", function () {
    //     const id: string = "zeroCourses";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of non-zip file", function () {
    //     const id: string = "notZipFile";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset without 'courses' folder", function () {
    //     const id: string = "missingCoursesFolder";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with null ID", function () {
    //     const id: string = "courses";
    //
    //     return expect(insightFacade.addDataset(
    //         null,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with null Content", function () {
    //     const id: string = "courses";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         null,
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with null Kind", function () {
    //     const id: string = "courses";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         null,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with undefined ID", function () {
    //     let id: string;
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with undefined Content", function () {
    //     const id: string = "courses";
    //     let content: string;
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         content,
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset with undefined Kind", function () {
    //     const id: string = "courses";
    //     let kind: InsightDatasetKind;
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         kind,
    //     )).to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject addition of dataset, without processed data structure persisted to disk", function () {
    //     const id: string = "zeroCourses";
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.be.rejectedWith(InsightError)
    //         .then(() => {
    //             try {
    //                 const newInsightFacade = new InsightFacade();
    //                 const expected: InsightDataset[] = [];
    //
    //                 return expect(newInsightFacade.listDatasets())
    //                     .to.eventually.deep.equal(expected);
    //             } catch (err) {
    //                 Log.error(err);
    //             }
    //         });
    // });
    //
    // // // ------------------------------ InsightFacade.removeDataset() ------------------------------
    // // // // Fulfill Test Cases
    it("Should fulfill removal of valid dataset - courses", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        return expect(insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        )).to.eventually.deep.equal(expected)
            .then(() => {
                return expect(insightFacade.removeDataset(id))
                        .to.eventually.deep.equal(id);
                }
            );
    });

    it("Should fulfill removal of valid dataset - rooms", function () {
        const id: string = "rooms";
        const expected: string[] = [id];
        return expect(insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        )).to.eventually.deep.equal(expected)
            .then(() => {
                return expect(insightFacade.removeDataset(id))
                        .to.eventually.deep.equal(id);
                }
            );
    });
    //
    // it("Should fulfill removal of valid dataset, deleting both memory and disk caches", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(expected)
    //         .then(() => {
    //             return expect(insightFacade.removeDataset(id))
    //                 .to.eventually.deep.equal(id);
    //         }).then(() => {
    //             try {
    //                 const newInsightFacade = new InsightFacade();
    //                 const listExpected: InsightDataset[] = [];
    //
    //                 return expect(newInsightFacade.listDatasets())
    //                     .to.eventually.deep.equal(listExpected);
    //             } catch (err) {
    //                 Log.error(err);
    //             }
    //         });
    // });
    //
    // // Reject Test Cases
    // it("Should reject removal of dataset with ID including whitespaces only", function () {
    //     const id: string = "  ";
    //
    //     return expect(insightFacade.removeDataset(id))
    //         .to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject removal of dataset with ID including underscore", function () {
    //     const id: string = "valid_courses";
    //
    //     return expect(insightFacade.removeDataset(id))
    //         .to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject removal for dataset with valid ID but not yet added", function () {
    //     const id: string = "courses";
    //
    //     return expect(insightFacade.removeDataset(id))
    //         .to.eventually.be.rejectedWith(NotFoundError);
    // });
    //
    // it("Should reject removal for dataset with null ID", function () {
    //     const id: string = null;
    //
    //     return expect(insightFacade.removeDataset(id))
    //         .to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // it("Should reject removal for dataset with undefined ID", function () {
    //     let id: string;
    //
    //     return expect(insightFacade.removeDataset(id))
    //         .to.eventually.be.rejectedWith(InsightError);
    // });
    //
    // // ------------------------------ InsightFacade.listDatasets() ------------------------------
    // // Fulfill Test Cases
    // it("Should return empty array", function () {
    //     const expected: InsightDataset[] = [];
    //
    //     return expect(insightFacade.listDatasets())
    //         .to.eventually.deep.equal(expected);
    // });
    //
    // it("Should return added dataset with type and number of rows", function () {
    //     const id: string = "courses";
    //     const addExpected: string[] = [id];
    //     const courses: InsightDataset = {
    //         id: id,
    //         kind: InsightDatasetKind.Courses,
    //         numRows: 64612
    //     };
    //     const expected: InsightDataset[] = [courses];
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(addExpected)
    //         .then(() => {
    //             return expect(insightFacade.listDatasets())
    //                     .to.eventually.deep.equal(expected);
    //             }
    //         );
    // });
    //
    // it("Should return added dataset with type and number of rows with new Insight Facade", function () {
    //     const id: string = "courses";
    //     const addExpected: string[] = [id];
    //     const courses: InsightDataset = {
    //         id: id,
    //         kind: InsightDatasetKind.Courses,
    //         numRows: 64612
    //     };
    //     const expected: InsightDataset[] = [courses];
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(addExpected)
    //         .then(() => {
    //                 return expect(insightFacade.listDatasets())
    //                     .to.eventually.deep.equal(expected);
    //             }
    //         ).then(() => {
    //             const newInsightFacade = new InsightFacade();
    //
    //             return expect(newInsightFacade.listDatasets())
    //                 .to.eventually.deep.equal(expected);
    //         });
    // });
    //
    // it("Should return added datasets with type and number of rows", function () {
    //     const oneId: string = "oneCourseSection";
    //     const oneExpected: string[] = [oneId];
    //     const oneCourseSelection: InsightDataset = {
    //         id: oneId,
    //         kind: InsightDatasetKind.Courses,
    //         numRows: 1
    //     };
    //     const multiId: string = "multipleCourseSections";
    //     const multiExpected: string[] = [oneId, multiId];
    //     const multiCourseSelections: InsightDataset = {
    //         id: multiId,
    //         kind: InsightDatasetKind.Courses,
    //         numRows: 22
    //     };
    //     const expected: InsightDataset[] = [oneCourseSelection, multiCourseSelections];
    //
    //     return expect(insightFacade.addDataset(
    //         oneId,
    //         datasets[oneId],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(oneExpected)
    //         .then(() => {
    //             return expect(insightFacade.addDataset(
    //                 multiId,
    //                 datasets[multiId],
    //                 InsightDatasetKind.Courses,
    //             )).to.eventually.deep.equal(multiExpected);
    //         }).then(() => {
    //             return expect(insightFacade.listDatasets())
    //                 .to.eventually.deep.equal(expected);
    //         });
    // });
    //
    // it("Should return added dataset, ignoring the removed dataset", function () {
    //     const oneId: string = "oneCourseSection";
    //     const oneExpected: string[] = [oneId];
    //     const oneCourseSelection: InsightDataset = {
    //         id: oneId,
    //         kind: InsightDatasetKind.Courses,
    //         numRows: 1
    //     };
    //     const multiId: string = "multipleCourseSections";
    //     const multiExpected: string[] = [oneId, multiId];
    //     const expected: InsightDataset[] = [oneCourseSelection];
    //
    //     return expect(insightFacade.addDataset(
    //         oneId,
    //         datasets[oneId],
    //         InsightDatasetKind.Courses,
    //     )).to.eventually.deep.equal(oneExpected)
    //         .then(() => {
    //             return expect(insightFacade.addDataset(
    //                 multiId,
    //                 datasets[multiId],
    //                 InsightDatasetKind.Courses,
    //             )).to.eventually.deep.equal(multiExpected);
    //         }).then(() => {
    //             return expect(insightFacade.removeDataset(multiId))
    //                 .to.eventually.deep.equal(multiId);
    //         }).then(() => {
    //             return expect(insightFacade.listDatasets())
    //                 .to.eventually.deep.equal(expected);
    //         });
    // });
    //
    // it("Should return empty array, ignoring rejected dataset with Kind of Rooms", function () {
    //     const id: string = "courses";
    //     const addExpected: string[] = [];
    //     const expected: InsightDataset[] = [];
    //
    //     return expect(insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Rooms,
    //     )).to.eventually.deep.equal(addExpected)
    //         .then(() => {
    //             return expect(insightFacade.listDatasets())
    //                 .to.eventually.deep.equal(expected);
    //         });
    // });
    //
    //
    // it("Should add a valid dataset that has 1 valid course with extra", function () {
    //     const id: string = "courses-1validcourse";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected);
    // });
    //
    // it("Shouldn't add invalid dataset with wrong naming convention - underscore", function () {
    //     const id: string = "_courses_";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset with wrong naming convention - whitespace", function () {
    //     const id: string = "      ";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset with wrong naming convention - bad formatting", function () {
    //     const id: string = "/courses/courses/courses";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset - null", function () {
    //     const id: string = null;
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         null,
    //         null,
    //         null,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset with wrong parameters - 1st", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         "test",
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset with wrong parameters - 2nd version 1", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         "test",
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset with wrong parameters - 2nd version 2", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets["test"],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset with wrong parameters - 3rd", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Rooms,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset with wrong parameters - all", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         "test",
    //         datasets["dummy"],
    //         InsightDatasetKind.Rooms,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset with wrong parameters - all", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         "test",
    //         datasets["dummy"],
    //         InsightDatasetKind.Rooms,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset - parameters wrong", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         datasets[id],
    //         id,
    //         InsightDatasetKind.Rooms,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset that hasn't been loaded", function () {
    //     const id: string = "coursesAtUBC";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Rooms,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset - invalid format", function () {
    //     const id: string = "AANB500";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset - invalid format by courses not being JSON files", function () {
    //     const id: string = "courses-textfiles";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset - invalid info of courses in JSON files", function () {
    //     const id: string = "courses-JSONbadinfo";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Shouldn't add invalid dataset - no file called 'courses' in zip", function () {
    //     const id: string = "courses123";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should add dataset valid dataset then reject one with same name", function () {
    //     let id: string = "courses";
    //     const expected: string[] = [id];
    //     let futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //         id = "courses";
    //         futureResult = insightFacade.addDataset(
    //             id,
    //             datasets[id],
    //             InsightDatasetKind.Courses,
    //         );
    //         return expect(futureResult).to.be.rejectedWith(InsightError);
    //     });
    // });
    //
    //
    // it("Should add dataset valid dataset then reject invalid one", function () {
    //     let id: string = "courses";
    //     const expected: string[] = [id];
    //     let futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //         id = "courses-textfiles";
    //         futureResult = insightFacade.addDataset(
    //             id,
    //             datasets[id],
    //             InsightDatasetKind.Courses,
    //         );
    //         return expect(futureResult).to.be.rejectedWith(InsightError);
    //     });
    // });
    //
    // it("Should reject dataset invalid dataset then accept valid one", function () {
    //     let id: string = "courses-textfiles";
    //     const expected: string[] = [id];
    //     let futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.be.rejectedWith(InsightError).then(() => {
    //         id = "courses";
    //         futureResult = insightFacade.addDataset(
    //             id,
    //             datasets[id],
    //             InsightDatasetKind.Courses,
    //         );
    //         return expect(futureResult).to.eventually.deep.equal(["courses"]);
    //     });
    // });
    //
    // it("Should not remove valid dataset not in list", function () {
    //     let futureResult: Promise<string> = insightFacade.removeDataset("courses");
    //     return expect(futureResult).to.be.rejectedWith(NotFoundError);
    // });
    //
    // it("Should not remove invalid dataset not in list", function () {
    //     let futureResult: Promise<string> = insightFacade.removeDataset("/courses/courses/");
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should not remove invalid dataset - invalid dataset", function () {
    //     let futureResult: Promise<string> = insightFacade.removeDataset("courses-textfiles");
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should not remove invalid dataset that is not on list - bad files", function () {
    //     let futureResult: Promise<string> = insightFacade.removeDataset("courses123");
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should not remove invalid dataset - null", function () {
    //     let futureResult: Promise<string> = insightFacade.removeDataset(null);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should not remove invalid dataset - bad naming - underscore", function () {
    //     let id: string = "courses";
    //     let expected: string[] = [id];
    //     let futureResult2: Promise<string>;
    //     let futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //         futureResult2 = insightFacade.removeDataset("_courses_");
    //         return expect(futureResult2).to.be.rejectedWith(InsightError);
    //     });
    // });
    //
    // it("Should not remove invalid dataset - bad naming - whitespace", function () {
    //     let id: string = "courses";
    //     let expected: string[] = [id];
    //     let futureResult2: Promise<string>;
    //     let futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //         futureResult2 = insightFacade.removeDataset("    ");
    //         return expect(futureResult2).to.be.rejectedWith(InsightError);
    //     });
    // });
    //
    // it("Should not remove invalid dataset that is spelled wrong", function () {
    //     let id: string = "courses";
    //     let expected: string[] = [id];
    //     let futureResult2: Promise<string>;
    //     let futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //         futureResult2 = insightFacade.removeDataset("coursesUBC");
    //         return expect(futureResult2).to.be.rejectedWith(NotFoundError);
    //     });
    // });
    //
    // it("Should remove valid dataset", function () {
    //     let id: string = "courses";
    //     let expected: string[] = [id];
    //     let removeExpected: string = "courses";
    //     let removeFutureResult: Promise<string>;
    //     let futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //          removeFutureResult = insightFacade.removeDataset("courses");
    //          return expect(removeFutureResult).to.eventually.deep.equal(removeExpected);
    //     });
    // });
    //
    // it("Should remove first dataset out of list of 2", function () {
    //     let id: string = "courses";
    //     let expected: string[] = [id];
    //     let futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //         id = "courses-small";
    //         expected = ["courses", id];
    //         futureResult = insightFacade.addDataset(
    //             id,
    //             datasets[id],
    //             InsightDatasetKind.Courses,
    //         );
    //         return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //             let removeExpected: string = "courses";
    //             let removeFutureResult: Promise<string> = insightFacade.removeDataset("courses");
    //             return expect(removeFutureResult).to.eventually.deep.equal(removeExpected).then(() => {
    //                 removeExpected = "courses-small";
    //                 removeFutureResult = insightFacade.removeDataset("courses-small");
    //                 return expect(removeFutureResult).to.eventually.deep.equal(removeExpected);
    //             });
    //         });
    //     });
    // });
    //
    // it("Should remove 2nd dataset out of list of 2", function () {
    //     let id: string = "courses";
    //     let expected: string[] = [id];
    //     let futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //         id = "courses-small";
    //         expected = ["courses", id];
    //         futureResult = insightFacade.addDataset(
    //             id,
    //             datasets[id],
    //             InsightDatasetKind.Courses,
    //         );
    //         return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
    //             let removeExpected: string = "courses-small";
    //             let removeFutureResult: Promise<string> = insightFacade.removeDataset("courses-small");
    //             return expect(removeFutureResult).to.eventually.deep.equal(removeExpected).then(() => {
    //                 removeExpected = "courses";
    //                 removeFutureResult = insightFacade.removeDataset("courses");
    //                 return expect(removeFutureResult).to.eventually.deep.equal(removeExpected);
    //             });
    //         });
    //     });
    // });
    //
    it("List datasets with 1 set", function () {
        const id: string = "courses";
        const expectedID: string = id;
        const expectedKind: InsightDatasetKind = InsightDatasetKind.Courses;
        const expectedNumRow: number = 64612;
        const tempResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(tempResult).to.eventually.deep.equal([id]).then(() => {
            const futureResult: Promise<InsightDataset[]> = insightFacade.listDatasets();
            return futureResult.then((result: InsightDataset[]) => {
                expect(result[0].id).to.deep.equal(expectedID);
                expect(result[0].kind).to.deep.equal(expectedKind);
                expect(result[0].numRows).to.deep.equal(expectedNumRow);
            });
        });
    });

    it("List datasets with 1 or more sets", function () {
        const id1: string = "courses";
        const expectedKind1: InsightDatasetKind = InsightDatasetKind.Courses;
        const expectedNumRow1: number = 64612;
        let tempResult: Promise<string[]> = insightFacade.addDataset(
            id1,
            datasets[id1],
            InsightDatasetKind.Courses,
        );
        return expect(tempResult).to.eventually.deep.equal([id1]).then(() => {
            const id2: string = "rooms";
            const expectedKind2: InsightDatasetKind = InsightDatasetKind.Rooms;
            const expectedNumRow2: number = 363;
            tempResult = insightFacade.addDataset(
                id2,
                datasets[id2],
                InsightDatasetKind.Rooms,
            );
            return expect(tempResult).to.eventually.deep.equal(["courses", id2]).then(() => {
                const futureResult: Promise<InsightDataset[]> = insightFacade.listDatasets();
                return futureResult.then((result: InsightDataset[]) => {
                    expect(result[0].id).to.deep.equal(id1);
                    expect(result[0].kind).to.deep.equal(expectedKind1);
                    expect(result[0].numRows).to.deep.equal(expectedNumRow1);
                    expect(result[1].id).to.deep.equal(id2);
                    expect(result[1].kind).to.deep.equal(expectedKind2);
                    expect(result[1].numRows).to.deep.equal(expectedNumRow2);
                });
            });
        });
    });

    it("List datasets with no sets", function () {
        const expected: InsightDataset[] = [];
        const futureResult: Promise<InsightDataset[]> = insightFacade.listDatasets();
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    //
    // it("Should not query valid dataset not added yet", function () {
    //     const futureResult: Promise<any[]> = insightFacade.performQuery("courses");
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should not query null", function () {
    //     const futureResult: Promise<any[]> = insightFacade.performQuery(null);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should not query invalid dataset - bad naming", function () {
    //     const futureResult: Promise<any[]> = insightFacade.performQuery("courses_");
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it("Should not query invalid dataset - files not valid", function () {
    //     const futureResult: Promise<any[]> = insightFacade.performQuery("courses-textfiles");
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
// describe("InsightFacade PerformQuery", () => {
//     const datasetsToQuery: {
//         [id: string]: { path: string; kind: InsightDatasetKind };
//     } = {
//         courses: {
//             path: "./test/data/courses.zip",
//             kind: InsightDatasetKind.Courses
//         },
//         oneCourseSection: {
//             path: "./test/data/oneCourseSection.zip",
//             kind: InsightDatasetKind.Courses
//         },
//         multipleCourseSections: {
//             path: "./test/data/multipleCourseSections.zip",
//             kind: InsightDatasetKind.Courses
//         },
//         rooms: {
//                 path: "./test/data/rooms.zip",
//                 kind: InsightDatasetKind.Rooms
//             },
//     };
//     let insightFacade: InsightFacade;
//     let testQueries: ITestQuery[] = [];

//     // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
//     before(function () {
//         Log.test(`Before: ${this.test.parent.title}`);

//         // Load the query JSON files under test/queries.
//         // Fail if there is a problem reading ANY query.
//         try {
//             testQueries = TestUtil.readTestQueries();
//         } catch (err) {
//             expect.fail(
//                 "",
//                 "",
//                 `Failed to read one or more test queries. ${err}`,
//             );
//         }

//         // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
//         // Will fail* if there is a problem reading ANY dataset.
//         const loadDatasetPromises: Array<Promise<string[]>> = [];
//         insightFacade = new InsightFacade();
//         for (const id of Object.keys(datasetsToQuery)) {
//             const ds = datasetsToQuery[id];
//             const data = fs.readFileSync(ds.path).toString("base64");
//             loadDatasetPromises.push(
//                 insightFacade.addDataset(id, data, ds.kind),
//             );
//         }
//         return Promise.all(loadDatasetPromises);
//     });

//     beforeEach(function () {
//         Log.test(`BeforeTest: ${this.currentTest.title}`);
//     });

//     after(function () {
//         Log.test(`After: ${this.test.parent.title}`);
//     });

//     afterEach(function () {
//         Log.test(`AfterTest: ${this.currentTest.title}`);
//     });

// //     // ------------------------------ InsightFacade.performQuery() ------------------------------
// //     // Dynamically create and run a test for each query in testQueries
// //     // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
//     it("Should run test queries", function () {
//         describe("Dynamic InsightFacade PerformQuery tests", function () {
//             for (const test of testQueries) {
//                 it(`[${test.filename}] ${test.title}`, function () {
//                     const futureResult: Promise<
//                         any[]
//                       > = insightFacade.performQuery(test.query);
//                     return TestUtil.verifyQueryResult(futureResult, test);
//                 });
//             }
//         });
//     });
// });

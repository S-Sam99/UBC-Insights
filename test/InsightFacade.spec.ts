import { expect } from "chai";
import * as chai from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import { InsightDatasetKind, InsightDataset, InsightError, NotFoundError } from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

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
        courses1: "./test/data/courses-small.zip",
        courses2: "./test/data/AANB500",
        courses3: "./test/data/courses-textfiles.zip",
        courses4: "./test/data/courses-1validcourse.zip",
        courses5: "./test/data/courses-exactly1validcourse.zip",
        courses6: "./test/data/courses-morethan1validcoursewithextra.zip",
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
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // This is a unit test. You should create more like this!
    it("Should add a valid dataset from 0", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Should add a valid dataset - 1 exact valid course", function () {
        const id: string = "courses-exactly1validcourse";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Should add a valid dataset - more than 1 valid course with extra", function () {
        const id: string = "courses-morethan1validcoursewithextra";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Should add a valid dataset to exisiting list", function () {
        let id: string = "courses";
        let expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
            id = "courses-small";
            expected = ["courses", id];
            futureResult = insightFacade.addDataset(
                id,
                datasets[id],
                InsightDatasetKind.Courses,
            );
            return expect(futureResult).to.eventually.deep.equal(expected);
        });
    });

    it("Should add a valid dataset that has 1 valid course with extra", function () {
        const id: string = "courses-1validcourse";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Shouldn't add invalid dataset with wrong naming convention - underscore", function () {
        const id: string = "_courses_";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset with wrong naming convention - whitespace", function () {
        const id: string = "      ";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset with wrong naming convention - bad formatting", function () {
        const id: string = "/courses/courses/courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset - null", function () {
        const id: string = null;
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            null,
            null,
            null,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset with wrong parameters - 1st", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            "test",
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset with wrong parameters - 2nd version 1", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            "test",
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset with wrong parameters - 2nd version 2", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets["test"],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset with wrong parameters - 3rd", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset with wrong parameters - all", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            "test",
            datasets["dummy"],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset with wrong parameters - all", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            "test",
            datasets["dummy"],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset - parameters wrong", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            datasets[id],
            id,
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset that hasn't been loaded", function () {
        const id: string = "coursesAtUBC";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset - invalid format", function () {
        const id: string = "AANB500";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset - invalid format by courses not being JSON files", function () {
        const id: string = "courses-textfiles";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset - invalid info of courses in JSON files", function () {
        const id: string = "courses-JSONbadinfo";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Shouldn't add invalid dataset - no file called 'courses' in zip", function () {
        const id: string = "courses123";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should add dataset valid dataset then reject one with same name", function () {
        let id: string = "courses";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
            id = "courses";
            futureResult = insightFacade.addDataset(
                id,
                datasets[id],
                InsightDatasetKind.Courses,
            );
            return expect(futureResult).to.be.rejectedWith(InsightError);
        });
    });


    it("Should add dataset valid dataset then reject invalid one", function () {
        let id: string = "courses";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
            id = "courses-textfiles";
            futureResult = insightFacade.addDataset(
                id,
                datasets[id],
                InsightDatasetKind.Courses,
            );
            return expect(futureResult).to.be.rejectedWith(InsightError);
        });
    });

    it("Should reject dataset invalid dataset then accept valid one", function () {
        let id: string = "courses-textfiles";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError).then(() => {
            id = "courses";
            futureResult = insightFacade.addDataset(
                id,
                datasets[id],
                InsightDatasetKind.Courses,
            );
            return expect(futureResult).to.eventually.deep.equal(expected);
        });
    });

    it("Should not remove valid dataset not in list", function () {
        let futureResult: Promise<string> = insightFacade.removeDataset("courses");
        return expect(futureResult).to.be.rejectedWith(NotFoundError);
    });

    it("Should not remove invalid dataset not in list", function () {
        let futureResult: Promise<string> = insightFacade.removeDataset("/courses/courses/");
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not remove invalid dataset - invalid dataset", function () {
        let futureResult: Promise<string> = insightFacade.removeDataset("courses-textfiles");
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not remove invalid dataset that is not on list - bad files", function () {
        let futureResult: Promise<string> = insightFacade.removeDataset("courses123");
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not remove invalid dataset - null", function () {
        let futureResult: Promise<string> = insightFacade.removeDataset(null);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not remove invalid dataset - bad naming - underscore", function () {
        let id: string = "courses";
        let expected: string[] = [id];
        let futureResult2: Promise<string>;
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
            futureResult2 = insightFacade.removeDataset("_courses_");
            return expect(futureResult2).to.be.rejectedWith(InsightError);
        });
    });

    it("Should not remove invalid dataset - bad naming - whitespace", function () {
        let id: string = "courses";
        let expected: string[] = [id];
        let futureResult2: Promise<string>;
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
            futureResult2 = insightFacade.removeDataset("    ");
            return expect(futureResult2).to.be.rejectedWith(InsightError);
        });
    });

    it("Should not remove invalid dataset that is spelled wrong", function () {
        let id: string = "courses";
        let expected: string[] = [id];
        let futureResult2: Promise<string>;
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
            futureResult2 = insightFacade.removeDataset("coursesUBC");
            return expect(futureResult2).to.be.rejectedWith(NotFoundError);
        });
    });

    it("Should remove valid dataset", function () {
        let id: string = "courses";
        let expected: string[] = [id];
        let removeExpected: string = "courses";
        let removeFutureResult: Promise<string>;
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
             removeFutureResult = insightFacade.removeDataset("courses");
             return expect(removeFutureResult).to.eventually.deep.equal(removeExpected);
        });
    });

    it("Should remove first dataset out of list of 2", function () {
        let id: string = "courses";
        let expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
            id = "courses-small";
            expected = ["courses", id];
            futureResult = insightFacade.addDataset(
                id,
                datasets[id],
                InsightDatasetKind.Courses,
            );
            return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
                let removeExpected: string = "courses";
                let removeFutureResult: Promise<string> = insightFacade.removeDataset("courses");
                return expect(removeFutureResult).to.eventually.deep.equal(removeExpected).then(() => {
                    removeExpected = "courses-small";
                    removeFutureResult = insightFacade.removeDataset("courses-small");
                    return expect(removeFutureResult).to.eventually.deep.equal(removeExpected);
                });
            });
        });
    });

    it("Should remove 2nd dataset out of list of 2", function () {
        let id: string = "courses";
        let expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
            id = "courses-small";
            expected = ["courses", id];
            futureResult = insightFacade.addDataset(
                id,
                datasets[id],
                InsightDatasetKind.Courses,
            );
            return expect(futureResult).to.eventually.deep.equal(expected).then(() => {
                let removeExpected: string = "courses-small";
                let removeFutureResult: Promise<string> = insightFacade.removeDataset("courses-small");
                return expect(removeFutureResult).to.eventually.deep.equal(removeExpected).then(() => {
                    removeExpected = "courses";
                    removeFutureResult = insightFacade.removeDataset("courses");
                    return expect(removeFutureResult).to.eventually.deep.equal(removeExpected);
                });
            });
        });
    });

    it("List datasets with 1 set", function () {
        const id: string = "courses";
        const expectedID: string[] = [id];
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
                expect(result[0].id).to.have.property("id", expectedID);
                expect(result[0].kind).to.have.property("kind", expectedKind);
                expect(result[0].numRows).to.have.property("numRows", expectedNumRow);
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
            const id2: string = "courses-small";
            const expectedKind2: InsightDatasetKind = InsightDatasetKind.Courses;
            const expectedNumRow2: number = 2;
            tempResult = insightFacade.addDataset(
                id2,
                datasets[id2],
                InsightDatasetKind.Courses,
            );
            return expect(tempResult).to.eventually.deep.equal(["courses", id2]).then(() => {
                const futureResult: Promise<InsightDataset[]> = insightFacade.listDatasets();
                return futureResult.then((result: InsightDataset[]) => {
                    expect(result[0].id).to.have.property("id", id1);
                    expect(result[0].kind).to.have.property("kind", expectedKind1);
                    expect(result[0].numRows).to.have.property("numRows", expectedNumRow1);
                    expect(result[1].id).to.have.property("id", id2);
                    expect(result[1].kind).to.have.property("kind", expectedKind2);
                    expect(result[1].numRows).to.have.property("numRows", expectedNumRow2);
                });
            });
        });
    });

    it("List datasets with no sets", function () {
        const expected: InsightDataset[] = [];
        const futureResult: Promise<InsightDataset[]> = insightFacade.listDatasets();
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Should not query valid dataset not added yet", function () {
        const futureResult: Promise<any[]> = insightFacade.performQuery("courses");
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not query null", function () {
        const futureResult: Promise<any[]> = insightFacade.performQuery(null);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not query invalid dataset - bad naming", function () {
        const futureResult: Promise<any[]> = insightFacade.performQuery("courses_");
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Should not query invalid dataset - files not valid", function () {
        const futureResult: Promise<any[]> = insightFacade.performQuery("courses-textfiles");
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: {
        [id: string]: { path: string; kind: InsightDatasetKind };
    } = {
        courses: {
            path: "./test/data/courses.zip",
            kind: InsightDatasetKind.Courses,
        },
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail(
                "",
                "",
                `Failed to read one or more test queries. ${err}`,
            );
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(
                insightFacade.addDataset(id, data, ds.kind),
            );
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
             * for the purposes of seeing all your tests run.
             * TODO For C1, remove this catch block (but keep the Promise.all)
             */
            return Promise.resolve("HACK TO LET QUERIES RUN");
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult: Promise<
                        any[]
                    > = insightFacade.performQuery(test.query);
                    return TestUtil.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});

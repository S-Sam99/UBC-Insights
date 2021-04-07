import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import * as fs from "fs-extra";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import { InsightError } from "../src/controller/IInsightFacade";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server = new Server(4321);
    let url: any = "http://localhost:4321";

    chai.use(chaiHttp);

    before(function () {
        // TODO: start server here once and handle errors properly
        try {
            server.start();
        } catch (e) {
            Log.error("error with starting server");
        }
    });

    after(function () {
        // TODO: stop server here once!
        server.stop();
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test("Starting test!");
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test("Ending test");
    });


    it("PUT test for courses dataset", function () {
        const buffer = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request(url)
                .put("/dataset/courses/courses")
                .send(buffer)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result).to.deep.equal(["courses"]);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("The dataset was not added");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });

    it("PUT test for courses dataset already added", function () {
        const buffer = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request(url)
                .put("/dataset/courses/courses")
                .send(buffer)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("The dataset was not added");
                    expect(err.status).to.be.equal(400);
                    expect(err.response.body.error).to.deep.equal("Dataset has already been added.");
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });


    it("PUT test for rooms dataset", function () {
        const buffer = fs.readFileSync("./test/data/rooms.zip");
        try {
            return chai.request(url)
                .put("/dataset/rooms/rooms")
                .send(buffer)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result).to.deep.equal(["courses", "rooms"]);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("The dataset was not added");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });

    it("POST test for courses dataset", function () {
        const query: any = {
        WHERE: {
            OR: [
                {
                    AND: [
                        {
                            GT: {
                                courses_avg: 90
                            }
                        },
                        {
                            IS: {
                                courses_dept: "adhe"
                            }
                        }
                    ]
                },
                {
                    EQ: {
                        courses_avg: 95
                    }
                }
            ]
        },
        OPTIONS: {
            COLUMNS: [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            ORDER: "courses_avg"
        }
    };
        try {
            return chai.request(url)
                .post("/query")
                .send(query)
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("The query did not execute");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });

    it("GET datasets", function () {
        try {
            return chai.request(url)
                .get("/datasets")
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result[0].id).to.deep.equal("courses");
                    expect(res.body.result[0].kind).to.deep.equal("courses");
                    expect(res.body.result[0].numRows).to.deep.equal(64612);
                    expect(res.body.result[1].id).to.deep.equal("rooms");
                    expect(res.body.result[1].kind).to.deep.equal("rooms");
                    expect(res.body.result[1].numRows).to.deep.equal(363);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("Datasets were not listed");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });

    it("DEL test for rooms dataset", function () {
        try {
            return chai.request(url)
                .del("/dataset/rooms")
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result).to.deep.equal("rooms");
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("The dataset was not deleted");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });

    it("DEL test for courses dataset", function () {
        try {
            return chai.request(url)
                .del("/dataset/courses")
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result).to.deep.equal("courses");
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("The dataset was not deleted");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });


    it("DEL test for unadded dataset", function () {
        try {
            return chai.request(url)
                .del("/dataset/test")
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("The dataset was not deleted");
                    expect(err.status).to.be.equal(404);
                    expect(err.response.body.error).to.deep.equal("Dataset has not been added yet.");
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });

    it("DEL test for bad naming", function () {
        try {
            return chai.request(url)
                .del("/dataset/test__ ")
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("The dataset was not deleted");
                    expect(err.status).to.be.equal(400);
                    expect(err.response.body.error).to.deep.equal("Invalid ID for dataset for: test__");
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });

    it("DEL test for whitespace naming", function () {
        try {
            return chai.request(url)
                .del("/dataset/    ")
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect.fail();
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("The dataset was not deleted");
                    expect(err.status).to.be.equal(400);
                    expect(err.response.body.error).to.deep.equal("Invalid ID for dataset for: ");
                });
        } catch (err) {
            // and some more logging here!
            Log.trace("The server did not respond");
        }
    });

    // Sample on how to format PUT requests
    /*
    it("PUT test for courses dataset", function () {
        try {
            return chai.request(SERVER_URL)
                .put(ENDPOINT_URL)
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    expect(res.status).to.be.equal(204);
                })
                .catch(function (err) {
                    // some logging here please!
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });
    */

    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});

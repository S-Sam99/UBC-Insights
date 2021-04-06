/**
 * Created by rtholmes on 2016-06-19.
 */

import fs = require("fs");
import restify = require("restify");
import Log from "../Util";
import {InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

/**
 * This configures the REST endpoints for the server.
 */
export default class Server {

    private port: number;
    private rest: restify.Server;
    private static insightFacade = new InsightFacade();

    constructor(port: number) {
        Log.info("Server::<init>( " + port + " )");
        this.port = port;
    }

    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<boolean>}
     */
    public stop(): Promise<boolean> {
        Log.info("Server::close()");
        const that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }

    /**
     * Starts the server. Returns a promise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<boolean>}
     */
    public start(): Promise<boolean> {
        const that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Log.info("Server::start() - start");

                that.rest = restify.createServer({
                    name: "insightUBC",
                });
                that.rest.use(restify.bodyParser({mapFiles: true, mapParams: true}));
                that.rest.use(
                    function crossOrigin(req, res, next) {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        return next();
                    });

                // This is an example endpoint that you can invoke by accessing this URL in your browser:
                // http://localhost:4321/echo/hello
                that.rest.get("/echo/:msg", Server.echo);

                // NOTE: your endpoints should go here
                that.rest.get("/datasets", Server.getDatasets);
                // that.rest.put("/dataset/:id/:kind", Server.putDataset);
                // that.rest.post("/query", Server.postQuery);
                // that.rest.del("/dataset/:id", Server.deleteDataset);

                // This must be the last endpoint!
                that.rest.get("/.*", Server.getStatic);

                that.rest.listen(that.port, function () {
                    Log.info("Server::start() - restify listening: " + that.rest.url);
                    fulfill(true);
                });

                that.rest.on("error", function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal
                    // node not using normal exceptions here
                    Log.info("Server::start() - restify ERROR: " + err);
                    reject(err);
                });

            } catch (err) {
                Log.error("Server::start() - ERROR: " + err);
                reject(err);
            }
        });
    }

    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.
    private static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        try {
            const response = Server.performEcho(req.params.msg);
            Log.info("Server::echo(..) - responding " + 200);
            res.json(200, {result: response});
        } catch (err) {
            Log.error("Server::echo(..) - responding 400");
            res.json(400, {error: err});
        }
        return next();
    }

    private static performEcho(msg: string): string {
        if (typeof msg !== "undefined" && msg !== null) {
            return `${msg}...${msg}`;
        } else {
            return "Message not provided";
        }
    }

    private static getStatic(req: restify.Request, res: restify.Response, next: restify.Next) {
        const publicDir = "frontend/public/";
        Log.trace("RoutHandler::getStatic::" + req.url);
        let path = publicDir + "index.html";
        if (req.url !== "/") {
            path = publicDir + req.url.split("/").pop();
        }
        fs.readFile(path, function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    private static getDatasets(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            Server.insightFacade.listDatasets().then(function (datasets: any) {
                Log.trace("listed all current datasets");
                res.json(200, {result: datasets});
            }). catch(function (err) {
                res.json(400, {error: err.message});
            });
        } catch (e) {
            res.json(400, {error: e.message});
        }
        return next();
    }

    private static putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            const id: string = req.params.id;
            const buffer = req.body.toString("base64");
            const kind: string = req.params.kind;
            let setKind;
            if (kind === "courses") {
                setKind = InsightDatasetKind.Courses;
            } else if (kind === "rooms") {
                setKind = InsightDatasetKind.Rooms;
            }
            Server.insightFacade.addDataset(id, buffer, setKind).then(function (dataset: any) {
                Log.trace("added a new dataset");
                res.json(200, {result: dataset});
            }). catch(function (err) {
                res.json(400, {error: err.message});
            });
        } catch (e) {
            res.json(400, {error: e.message});
        }
        return next();
    }

    // private static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
    //     try {
    //         const query = req.body;
    //         Server.insightFacade.performQuery(query).then(function (executedQuery: any) {
    //             Log.trace("query successful");
    //             res.json(200, {result: executedQuery});
    //         }). catch(function (err) {
    //             res.json(400, {error: err.message});
    //         });
    //     } catch (e) {
    //         res.json(400, {error: e.message});
    //     }
    //     return next();
    // }

    private static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            const id: string = req.params.id;
            Server.insightFacade.removeDataset(id).then(function (dataset: any) {
                Log.trace("deleted dataset");
                res.json(200, {result: dataset});
            }). catch(function (err) {
                if (err instanceof InsightError) {
                    res.json(400, {error: err.message});
                } else if (err instanceof NotFoundError) {
                    res.json(404, {error: err.message});
                } else {
                    res.json(err.statusCode, {error: err.message});
                }
            });
        } catch (e) {
            res.json(400, {error: e.message});
        }
        return next();
    }

}

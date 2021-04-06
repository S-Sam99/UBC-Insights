/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = (query) => {
    console.log("Sending query:");
    console.log(query);

    return new Promise((resolve, reject) => {
        // TODO: implement!
        console.log("CampusExplorer.sendQuery not implemented yet.");
    });
};

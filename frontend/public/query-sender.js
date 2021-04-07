/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
        const url = "http://localhost:4321/query";

        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", url);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.onload = () => {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                resolve(JSON.parse(xmlHttp.responseText));
            } else {
                reject(JSON.parse(xmlHttp.responseText));
            }
        };
        xmlHttp.send(JSON.stringify(query));
    });
};

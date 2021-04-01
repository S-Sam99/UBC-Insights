import Constants from "../../Constants";

export default class ApplyFilterHelper {
    public static applyFilter(query: any, data: any[]): any[] {
        if (Object.keys(query.WHERE).length === 0) {
            return data;
        }
        const filters = Constants.FILTERS;
        const filterFunctions = Constants.FILTER_FUNCTIONS;
        return this.applyFilterFunction(
            query.WHERE,
            filters,
            filterFunctions,
            data
        );
    }

    private static applyFilterFunction(
        parameters: any,
        filters: any,
        filterFunctions: any,
        data: any[]
    ): any[] {
        const keys = Object.keys(parameters);
        const key = keys[0];
        const parameter = parameters[key];
        const columnKey = Object.keys(parameter)[0];
        const value = parameter[columnKey];
        const filter = filters[key];
        switch (filter.function) {
            case filterFunctions.And: {
                return this.applyFilterLogicAnd(parameter, filters, filterFunctions, data);
            }
            case filterFunctions.Or: {
                return this.applyFilterLogicOr(parameter, filters, filterFunctions, data);
            }
            case filterFunctions.LessThan: {
                return this.findResultsLessThan(columnKey, value, data);
            }
            case filterFunctions.GreaterThan: {
                return this.findResultsGreaterThan(columnKey, value, data);
            }
            case filterFunctions.Equal: {
                return this.findResultsEqual(columnKey, value, data);
            }
            case filterFunctions.Is: {
                return this.findResultsIs(columnKey, value, data);
            }
            case filterFunctions.Negation: {
                return this.applyFilterLogicNegation(parameter, filters, filterFunctions, data);
            }
            default: {
                return data;
            }
        }
    }

    private static applyFilterLogicAnd(parameters: any, filters: any, filterFunctions: any, data: any[]): any[] {
        let results: any[][] = [];
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                const allMatchingResults = this.applyFilterFunction(
                    parameters[key],
                    filters,
                    filterFunctions,
                    data
                );
                results.push(allMatchingResults);
            }
        }
        return results
            .reduce((firstList, secondList) => firstList
                .filter((result) => secondList.includes(result)));
    }

    private static applyFilterLogicOr(parameters: any, filters: any, filterFunctions: any, data: any[]): any[] {
        let results: any[] = [];
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                const allMatchingResults = this.applyFilterFunction(
                    parameters[key],
                    filters,
                    filterFunctions,
                    data
                );
                if (results.length < 1) {
                    results = allMatchingResults;
                } else {
                    results = results.concat(
                        allMatchingResults.filter((result) => results.indexOf(result) < 0)
                    );
                }
            }
        }
        return results;
    }

    private static applyFilterLogicNegation(parameters: any, filters: any, filterFunctions: any, data: any[]): any[] {
        const allMatchingResults = this.applyFilterFunction(
            parameters,
            filters,
            filterFunctions,
            data
        );

        return data.filter((result) => !allMatchingResults.includes(result));
    }

    private static findResultsLessThan(key: string, value: number, data: any[]): any[] {
        let allMatchingResults: any[] = [];

        for (const result of data) {
            if (result.data[key] < value) {
                allMatchingResults.push(result);
            }
        }
        return allMatchingResults;
    }

    private static findResultsGreaterThan(key: string, value: number, data: any[]): any[] {
        let allMatchingResults: any[] = [];
        for (const result of data) {
            if (result.data[key] > value) {
                allMatchingResults.push(result);
            }
        }
        return allMatchingResults;
    }

    private static findResultsEqual(key: string, value: number, data: any[]): any[] {
        let allMatchingResults: any[] = [];

        for (const result of data) {
            if (result.data[key] === value) {
                allMatchingResults.push(result);
            }
        }
        return allMatchingResults;
    }

    private static findResultsIs(key: string, value: string, data: any[]): any[] {
        let allMatchingResults: any[] = [];
        const hasWildcard = value.includes("*");
        for (const result of data) {
            if (hasWildcard) {
                if (this.isMatchingInputString(result.data[key], value)) {
                    allMatchingResults.push(result);
                }
            } else if (result.data[key] === value) {
                allMatchingResults.push(result);
            }
        }
        return allMatchingResults;
    }

    private static isMatchingInputString(data: string, value: string): boolean {
        const valueLength = value.length;
        if (valueLength === 1 && value.charAt(0) === "*" ||
            valueLength === 2 && value.charAt(0) === "*" && value.charAt(1) === "*") {
            return true;
        } else if (value.charAt(0) === "*" && value.charAt(valueLength - 1) === "*") {
            return data.includes(value.substring(1, valueLength - 1));
        } else if (value.charAt(0) === "*") {
            return data.endsWith(value.substring(1, valueLength));
        } else if (value.charAt(valueLength - 1) === "*") {
            return data.startsWith(value.substring(0, valueLength - 1));
        } else {
            return false;
        }
    }
}

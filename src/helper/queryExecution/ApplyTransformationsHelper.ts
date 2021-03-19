import Decimal from "decimal.js";

export default class ApplyTransformationsHelper {
    public static applyTransformations(query: any, results: any[]): any[] {
        const groups = query.TRANSFORMATIONS.GROUP;
        const apply = query.TRANSFORMATIONS.APPLY;
        const groupedResults = this.sortResultsIntoGroups(groups, results);
        return this.applyTransformationOperations(apply, groupedResults);
    }

    private static sortResultsIntoGroups(groups: string[], results: any[]): any[] {
        let sortedGroups: any = {};
        return results.reduce((acc, result) => {
            let key = this.generateGroupsKey(result, groups);
            if (!sortedGroups[key]) {
                sortedGroups[key] = [result];
                acc.push(sortedGroups[key]);
            } else {
                sortedGroups[key].push(result);
            }

            return acc;
        }, []);
    }

    private static applyTransformationOperations(apply: any[], groupedResults: any[]): any[] {
        let updatedResults: any = [];

        for (const group of groupedResults) {
            updatedResults = updatedResults.concat(this.applyTransformationOperation(group, apply));
        }
        return updatedResults;
    }

    private static generateGroupsKey(result: any, groups: string[]): string {
        let key = "";
        for (const group of groups) {
            key += result.data[group] + "-";
        }
        return key.substring(0, key.length - 1);
    }

    private static applyTransformationOperation(group: any[], apply: any[]): any {
        let transformedResult = group[0];

        for (const applyRule of apply) {
            const key = Object.keys(applyRule)[0];
            const applyToken = applyRule[key];
            const token = Object.keys(applyToken)[0];
            const tokenKey = applyToken[token];
            if (!transformedResult.hasOwnProperty(key)) {
                transformedResult.data[key] = this.applyTransformationToken(token, tokenKey, group);
            }
        }
        return transformedResult;
    }

    private static applyTransformationToken(token: string, key: string, group: any[]): number {
        switch (token) {
            case "MAX": {
                return this.applyMax(group, key);
            }
            case "MIN": {
                return this.applyMin(group, key);
            }
            case "AVG": {
                return this.applyAvg(group, key);
            }
            case "SUM": {
                return Number(this.applySum(group, key).toFixed(2));
            }
            default: {
                return this.applyCount(group, key);
            }
        }
    }

    private static applyMax(group: any[], key: string): number {
        return Math.max.apply(Math, group.map((result) => {
            return result.data[key];
        }));
    }

    private static applyMin(group: any[], key: string): number {
        return Math.min.apply(Math, group.map((result) => {
            return result.data[key];
        }));
    }

    private static applyAvg(group: any[], key: string): number {
        let sum = this.applySum(group, key);
        let avg = sum.toNumber() / group.length;
        return Number(avg.toFixed(2));
    }

    private static applySum(group: any[], key: string): Decimal {
        let sum = new Decimal(0);

        for (const result of group) {
            sum = sum.add(new Decimal(result.data[key]));
        }

        return sum;
    }

    private static applyCount(group: any[], key: string): number {
        let unique = new Set();

        for (const result of group) {
            unique.add(result.data[key]);
        }

        return unique.size;
    }
}

export default class ApplyOrderHelper {
    public static applyOrder(order: any, results: any[]): any[] {
        if (typeof order === "object") {
            return this.applyObjectOrder(order, results);
        }
        return this.applySingleColumnOrder(order, results);
    }

    private static applyObjectOrder(order: any, results: any[]): any[] {
        const fields = order.keys;

        if (order.dir === "DOWN") {
            return this.sortDescendingOrder(fields, results);
        } else {
            return this.sortAscendingOrder(fields, results);
        }
    }

    private static applySingleColumnOrder(order: string, results: any[]): any[] {
        results.sort((firstResult, secondResult) => {
            const firstValue = firstResult.data[order];
            const secondValue = secondResult.data[order];
            return this.compareAscending(firstValue, secondValue);
        });
        return results;
    }

    private static sortDescendingOrder(fields: string[], results: any[]): any[] {
        results.sort((firstResult, secondResult) => {
            for (const field of fields) {
                const comparison = this.compareDescending(firstResult.data[field], secondResult.data[field]);
                if (comparison !== 0) {
                    return comparison;
                }
            }
            return 0;
        });
        return results;
    }

    private static sortAscendingOrder(fields: string[], results: any[]): any[] {
        results.sort((firstResult, secondResult) => {
            for (const field of fields) {
                const comparison = this.compareAscending(firstResult.data[field], secondResult.data[field]);
                if (comparison !== 0) {
                    return comparison;
                }
            }
            return 0;
        });
        return results;
    }

    private static compareDescending(firstValue: any, secondValue: any): number {
        return firstValue > secondValue ? -1 : firstValue < secondValue ? 1 : 0;
    }

    private static compareAscending(firstValue: any, secondValue: any): number {
        return firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;
    }
}

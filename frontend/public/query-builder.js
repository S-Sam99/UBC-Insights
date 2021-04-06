/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = () => {
    let query = {};
    let activePanel = document.getElementsByClassName("tab-panel active");

    if (activePanel.length === 1) {
        if (activePanel[0].children.length === 1) {
            query = generateQueryFromForm(activePanel[0].children[0]);
        }
    }
    return query;
};

generateQueryFromForm = (form) => {
    const database = form.getAttribute("data-type");
    const body = generateQueryBody(form.getElementsByClassName("conditions"), database);
    const transformations = generateQueryTransformations(
        form.getElementsByClassName("groups"),
        form.getElementsByClassName("transformations"),
        database
    );
    const options = generateQueryOptions(
        form.getElementsByClassName("columns"),
        form.getElementsByClassName("order"),
        database
    );
    return generateQuery(body, options, transformations);
}

generateQueryBody = (conditions, database) => {
    return setFilter(conditions, database);
}

setFilter = (conditions, database) => {
    if (conditions.length < 1) {
        return {};
    }
    let conditionTypes = conditions[0].getElementsByClassName("condition-type");
    let filters = conditions[0].getElementsByClassName("conditions-container");

    if (filters.length < 1 || conditionTypes.length < 1 || filters[0].children.length < 1) {
        return {};
    }
    const checkedConditionType = getCheckedConditionType(conditionTypes[0]);

    if (filters[0].children.length === 1) {
        if (checkedConditionType !== "NOT") {
            return getFilter(filters[0], database);
        } else {
            return {
                "NOT": getFilter(filters[0], database)
            };
        }
    }

    return {
        [checkedConditionType]: checkedConditionType !== "NOT" ? getFilter(filters[0]) : {"OR": getFilter(filters[0])}
    };
}

getCheckedConditionType = (conditionTypes) => {
    for (const type of conditionTypes.children) {
        if (type.children.length > 0) {
            const condition = type.children[0];
            if (condition.hasAttribute("checked")) {
                const value = condition.getAttribute("value");
                return value === "all" ? "AND" :
                    value === "any" ? "OR" :
                        "NOT";
            }
        }
    }
    return "";
}

getFilter = (conditions, database) => {
    let filter = [];
    for (const condition of conditions.children) {
        const not = condition.getElementsByClassName("not")[0];
        const field = getSelectedField(condition.getElementsByClassName("fields")[0]);
        const operator = getSelectedField(condition.getElementsByClassName("operators")[0]);
        const value = getValue(condition.getElementsByClassName("term")[0]);
        const cond = {
            [operator]: {
                [`${database}_${field}`]: value
            }
        };

        if (not.getElementsByTagName("input")[0].hasAttribute("checked")) {
            filter.push({
                "NOT": cond
            });
        } else {
            filter.push(cond);
        }
    }
    return filter.length === 1 ? filter[0] : filter;
}

getSelectedField = (conditions) => {
    const fields = conditions.children[0].children;

    for (const field of fields) {
        if (field.hasAttribute("selected")) {
            return field.getAttribute("value");
        }
    }
    return "";
}

getValue = (term) => {
    const input = term.getElementsByTagName("input")[0];
    if (input.hasAttribute("value")) {
        return input.getAttribute("value");
    } else {
        return "";
    }
}

generateQueryOptions = (columns, order, database) => {
    const checkedColumns = getCheckedColumns(
        columns[0].getElementsByClassName("control-group")[0],
        database
    );
    const selectedOrder = getSelectedOrder(
        order[0].getElementsByClassName("control-group")[0],
        database
    );
    return {
        "COLUMNS": checkedColumns,
        "ORDER": selectedOrder
    }
};

getCheckedColumns = (columns, database) => {
    let checkedColumns = [];

    for (const field of columns.children) {
        const input = field.getElementsByTagName("input")[0];

        if (input.hasAttribute("checked")) {
            checkedColumns.push(`${database}_${input.getAttribute("value")}`);
        }
    }

    return checkedColumns;
}

getSelectedOrder = (order, database) => {
    let selectedFields = getSelectedFields(
        order.getElementsByClassName("order")[0].getElementsByTagName("select")[0].children,
        database
    );
    const isDescending = order
        .getElementsByClassName("descending")[0]
        .getElementsByTagName("input")[0]
        .hasAttribute("checked");

    if (isDescending) {
        return {
            "dir": "DOWN",
            "keys": selectedFields
        }
    } else {
        return {
            "dir": "UP",
            "keys": selectedFields
        }
    }
}

getSelectedFields = (fields, database) => {
    let selectedFields = [];

    for (const field of fields) {
        if (field.hasAttribute("selected")) {
            selectedFields.push(`${database}_${field.getAttribute("value")}`);
        }
    }
    return selectedFields;
}

generateQueryTransformations = (groups, transformations, database) => {
    const checkedGroupFields = getCheckedGroupFields(groups, database);
    const applyFields = getApplyFields(transformations, database);

    if (checkedGroupFields.length < 1 && applyFields.length < 1) {
        return null;
    } else {
        return {
            "GROUP": checkedGroupFields,
            "APPLY": applyFields
        };
    }
}

getCheckedGroupFields = (groups, database) => {
    let checkedGroupFields = [];

    if (groups.children < 1 || groups[0].getElementsByClassName("control-group").children < 1) {
        return checkedGroupFields;
    }
    for (const groupField of groups[0].getElementsByClassName("control-group")[0].children) {
        const field = groupField.getElementsByTagName("input")[0];
        if (field.hasAttribute("checked")) {
            checkedGroupFields.push(`${database}_${field.getAttribute("value")}`);
        }
    }
    return checkedGroupFields;
}

getApplyFields = (transformations, database) => {
    let applyFields = [];

    if (transformations.children < 1 ||
        transformations[0].getElementsByClassName("transformations-container").children < 1
    ) {
        return applyFields;
    }
    for (const applyField of transformations[0].getElementsByClassName("transformations-container")[0].children) {
        const field = getSelectedField(applyField.getElementsByClassName("fields")[0]);
        const operator = getSelectedField(applyField.getElementsByClassName("operators")[0]);
        const value = getValue(applyField.getElementsByClassName("term")[0]);
        applyFields.push({
            [value]: {
                [operator]: `${database}_${field}`
            }
        });
    }
    return applyFields;
}

generateQuery = (body, options, transformations) => {
    let query = {
        "WHERE": body,
        "OPTIONS": options
    };

    if (transformations !== null) {
        query["TRANSFORMATIONS"] = transformations;
    }

    return query;
}

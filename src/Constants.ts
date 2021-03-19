/**
 * Centralized location for constants.
 */
const KEY_MAP_COURSES = {
    dept: {
        name: "Subject",
        type: "string"
    },
    id: {
        name: "Course",
        type: "string"
    },
    avg: {
        name: "Avg",
        type: "number"
    },
    instructor: {
        name: "Professor",
        type: "string"
    },
    title: {
        name: "Title",
        type: "string"
    },
    pass: {
        name: "Pass",
        type: "number"
    },
    fail: {
        name: "Fail",
        type: "number"
    },
    audit: {
        name: "Audit",
        type: "number"
    },
    uuid: {
        name: "id",
        type: "string"
    },
    year: {
        name: "Year",
        type: "number"
    }
};

const KEY_MAP_ROOMS = {
    fullname: {
        name: "fullname",
        type: "string"
    },
    shortname: {
        name: "shortname",
        type: "string"
    },
    number: {
        name: "number",
        type: "string"
    },
    name: {
        name: "name",
        type: "string"
    },
    address: {
        name: "address",
        type: "string"
    },
    lat: {
        name: "lat",
        type: "number"
    },
    lon: {
        name: "lon",
        type: "number"
    },
    seats: {
        name: "seats",
        type: "number"
    },
    type: {
        name: "name",
        type: "string"
    },
    furniture: {
        name: "furniture",
        type: "string"
    },
    href: {
        name: "href",
        type: "string"
    }
};

const REQUIRED_DIR_COURSES = "courses/";

const REQUIRED_DIR_ROOMS = "rooms/";

const MAX_RESULTS_SIZE = 5000;

const QUERY_RESULT_TOO_LARGE =
    `The result is too big. Only queries with a maximum of ${MAX_RESULTS_SIZE} results are supported.`;

const MKEYS = [
    "avg",
    "pass",
    "fail",
    "audit",
    "year"
];

const SKEYS = [
    "dept",
    "id",
    "instructor",
    "title",
    "uuid"
];

enum FILTER_OPERATIONS {
    Logic = "LOGIC",
    MComparison = "MCOMPARISON",
    SComparison = "SCOMPARISON",
    Negation = "NEGATION"
}

enum FILTER_FUNCTIONS {
    And = "AND",
    Or = "OR",
    LessThan = "LESS THAN",
    GreaterThan = "GREATER THAN",
    Equal = "EQUAL",
    Is = "IS",
    Negation = "NEGATION"
}

const FILTERS: any = {
    AND: {
        operation: FILTER_OPERATIONS.Logic,
        function: FILTER_FUNCTIONS.And
    },
    OR: {
        operation: FILTER_OPERATIONS.Logic,
        function: FILTER_FUNCTIONS.Or
    },
    LT: {
        operation: FILTER_OPERATIONS.MComparison,
        key: MKEYS,
        function: FILTER_FUNCTIONS.LessThan
    },
    GT: {
        operation: FILTER_OPERATIONS.MComparison,
        key: MKEYS,
        function: FILTER_FUNCTIONS.GreaterThan
    },
    EQ: {
        operation: FILTER_OPERATIONS.MComparison,
        key: MKEYS,
        function: FILTER_FUNCTIONS.Equal
    },
    IS: {
        operation: FILTER_OPERATIONS.SComparison,
        key: SKEYS,
        function: FILTER_FUNCTIONS.Is
    },
    NOT: {
        operation: FILTER_OPERATIONS.Negation,
        function: FILTER_FUNCTIONS.Negation
    }
};

const REQUIRED_QUERY_KEYS = [
    "WHERE",
    "OPTIONS"
];

const ORDER_DIRECTIONS = [
    "DOWN",
    "UP"
];

const DATASET_NOT_ZIP = "Dataset file is not a ZIP.";

const INVALID_ID = "Invalid ID for dataset for:";

const INVALID_KIND_COURSES = "Invalid Kind for Course Dataset";

const INVALID_CONTENT = "Invalid Content for Dataset";

const MISSING_MAIN_FOLDER = "Missing \"courses\" or \"rooms\" folder in root directory.";

const MISSING_COURSES = "Missing valid courses for dataset.";

const MISSING_COURSE_SECTION = "Missing valid course section for dataset.";

const MISSING_BUILDINGS = "Missing valid buildings for dataset.";

const MISSING_ROOMS = "Missing valid Rooms for dataset.";

const DATASET_ALREADY_ADDED = "Dataset has already been added.";

const DATASET_NOT_YET_ADDED = "Dataset has not been added yet.";

export default class Constants {
    public static get KEY_MAP_COURSES() {
        return KEY_MAP_COURSES;
    }

    public static get KEY_MAP_ROOMS() {
        return KEY_MAP_ROOMS;
    }

    public static get MAX_RESULTS_SIZE() {
        return MAX_RESULTS_SIZE;
    }

    public static get QUERY_RESULT_TOO_LARGE() {
        return QUERY_RESULT_TOO_LARGE;
    }

    public static get MKEYS() {
        return MKEYS;
    }

    public static get SKEYS() {
        return SKEYS;
    }

    public static get REQUIRED_QUERY_KEYS() {
        return REQUIRED_QUERY_KEYS;
    }

    public static get FILTERS() {
        return FILTERS;
    }

    public static get FILTER_OPERATIONS() {
        return FILTER_OPERATIONS;
    }

    public static get FILTER_FUNCTIONS() {
        return FILTER_FUNCTIONS;
    }

    public static get REQUIRED_DIR_COURSES() {
        return REQUIRED_DIR_COURSES;
    }

    public static get REQUIRED_DIR_ROOMS() {
        return REQUIRED_DIR_ROOMS;
    }

    public static get DATASET_NOT_ZIP() {
        return DATASET_NOT_ZIP;
    }

    public static get INVALID_ID() {
        return INVALID_ID;
    }

    public static get ORDER_DIRECTIONS() {
        return ORDER_DIRECTIONS;
    }

    public static get INVALID_KIND_COURSES() {
        return INVALID_KIND_COURSES;
    }

    public static get INVALID_CONTENT() {
        return INVALID_CONTENT;
    }

    public static get MISSING_MAIN_FOLDER() {
        return MISSING_MAIN_FOLDER;
    }

    public static get MISSING_COURSES() {
        return MISSING_COURSES;
    }

    public static get MISSING_COURSE_SECTION() {
        return MISSING_COURSE_SECTION;
    }

    public static get MISSING_BUILDINGS() {
        return MISSING_BUILDINGS;
    }

    public static get MISSING_ROOMS() {
        return MISSING_ROOMS;
    }

    public static get DATASET_ALREADY_ADDED() {
        return DATASET_ALREADY_ADDED;
    }

    public static get DATASET_NOT_YET_ADDED() {
        return DATASET_NOT_YET_ADDED;
    }
}

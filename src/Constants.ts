/**
 * Centralized location for constants.
 */
const KEY_MAP = {
    dept: "Subject",
    id: "Course",
    avg: "Avg",
    instructor: "Professor",
    title: "Title",
    pass: "Pass",
    fail: "Fail",
    audit: "Audit",
    uuid: "id",
    year: "Year"
};

const REQUIRED_DIR = "courses/";

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

const FILTERS: any = {
    AND: {
        operation: FILTER_OPERATIONS.Logic
    },
    OR: {
        operation: FILTER_OPERATIONS.Logic
    },
    LT: {
        operation: FILTER_OPERATIONS.MComparison,
        key: MKEYS
    },
    GT: {
        operation: FILTER_OPERATIONS.MComparison,
        key: MKEYS
    },
    EQ: {
        operation: FILTER_OPERATIONS.MComparison,
        key: MKEYS
    },
    IS: {
        operation: FILTER_OPERATIONS.SComparison,
        key: SKEYS
    },
    NOT: {
        operation: FILTER_OPERATIONS.Negation
    }
};

const REQUIRED_QUERY_KEYS = [
    "WHERE",
    "OPTIONS"
];

const DATASET_NOT_ZIP = "Dataset file is not a ZIP.";

const INVALID_ID = "Invalid ID for dataset for:";

const INVALID_KIND_COURSES = "Invalid Kind for Course Dataset";

const INVALID_CONTENT = "Invalid Content for Dataset";

const MISSING_COURSES_FOLDER = "Missing \"courses\" folder in root directory.";

const MISSING_COURSES = "Missing valid courses for dataset.";

const MISSING_COURSE_SECTION = "Missing valid course section for dataset.";

const DATASET_ALREADY_ADDED = "Dataset has already been added.";

const DATASET_NOT_YET_ADDED = "Dataset has not been added yet.";

export default class Constants {
    public static get KEY_MAP() {
        return KEY_MAP;
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

    public static get REQUIRED_DIR() {
        return REQUIRED_DIR;
    }

    public static get DATASET_NOT_ZIP() {
        return DATASET_NOT_ZIP;
    }

    public static get INVALID_ID() {
        return INVALID_ID;
    }

    public static get INVALID_KIND_COURSES() {
        return INVALID_KIND_COURSES;
    }

    public static get INVALID_CONTENT() {
        return INVALID_CONTENT;
    }

    public static get MISSING_COURSES_FOLDER() {
        return MISSING_COURSES_FOLDER;
    }

    public static get MISSING_COURSES() {
        return MISSING_COURSES;
    }

    public static get MISSING_COURSE_SECTION() {
        return MISSING_COURSE_SECTION;
    }

    public static get DATASET_ALREADY_ADDED() {
        return DATASET_ALREADY_ADDED;
    }

    public static get DATASET_NOT_YET_ADDED() {
        return DATASET_NOT_YET_ADDED;
    }
}

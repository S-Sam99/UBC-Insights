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

const DATASET_NOT_ZIP = "Dataset file is not a ZIP.";

const INVALID_ID = "Invalid ID for dataset for:";

const INVALID_KIND_COURSES = "Invalid Kind for Course Dataset";

const INVALID_CONTENT = "Invalid Content for Dataset";

const MISSING_COURSES_FOLDER = "Missing \"courses\" folder in root directory.";

const MISSING_COURSES = "Missing valid courses for dataset.";

const MISSING_COURSE_SECTION = "Missing valid course section for dataset.";

export default class Constants {
    public static get KEY_MAP() {
        return KEY_MAP;
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
}

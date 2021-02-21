import Course from "./Course";

/**
 * Category Class
 */
export default class Category {
    public name: string;
    public courses: Course[];
    public numRows: number;

    constructor(name: string) {
        this.name = name;
        this.courses = [];
        this.numRows = 0;
    }

    public addCourse(course: Course) {
        this.numRows += course.numRows;
        this.courses.push(course);
    }
}

import Course from "./Course";

/**
 * Category Class
 */
export default class Category {
    public name: string;
    public courses: Course[];
    public numCategoryRows: number;

    constructor(name: string) {
        this.name = name;
        this.courses = [];
        this.numCategoryRows = 0;
    }

    public addCourse(course: Course) {
        this.numCategoryRows += course.numCourseRows;
        this.courses.push(course);
    }
}

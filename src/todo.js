import { format, isToday, isThisWeek, parseISO } from "date-fns";

const Todo = (title, details, date, priority, id = crypto.randomUUID()) => {
    let completed = false;
    // Handle both Date objects and date strings
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;

    return {
        title,
        details,
        date: parsedDate,
        priority,
        id,

        markCompleted() {
            completed = true;
        },

        unmarkCompleted() {
            completed = false;
        },

        toggleCompleted() {
            completed = !completed;
            return completed;
        },

        EditTask(title, details, date, priority) {
            this.title = title;
            this.details = details;
            // Handle both Date objects and date strings
            this.date = typeof date === 'string' ? parseISO(date) : date;
            this.priority = priority;
        },

        get isCompleted() {
            return completed;
        },

        get formattedDate() {
            return format(this.date, "do MMM yyyy");
        },

        get isDueToday() {
            return isToday(this.date);
        },

        get isDueThisWeek() {
            return isThisWeek(this.date, { weekStartsOn: 1 }); // Mon-Sun
        },

        get isImportant() {
            return this.priority === "high";
        }
    };
};

function AddTask(name, details, date, priority, id) {
    return Todo(name, details, date, priority, id);
}

export { Todo, AddTask };
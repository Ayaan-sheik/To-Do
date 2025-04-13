

const Todo = (title,details,date,priority) => {
    const id = crypto.randomUUID();
    let completed =false;
    return{
        title,details,date,priority,id,
        
        markCompleted(){
            completed = true;
        },
        EditTask(title,details,date,priority){
            this.title = title;
            this.details =details;
            this.date = date;
            this.priority = priority
        },
        get isCompleted() {
            return completed;
        }
    }
}

function AddTask(name,details,date,priority){
    let newTask = Todo(name,details,date,priority)
    return newTask;
}

export {Todo,AddTask}
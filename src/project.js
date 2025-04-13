import { Todo,AddTask } from "./todo";

let projects = [];

function project(name){
    const id = crypto.randomUUID();
    const tasklist = [];
    const taskNum = tasklist.length;
    return{
        tasklist,
        name,
        taskNum,
        AddTasks(title,details,date,priority){
            const newTask = AddTask(title,details,date,priority);
            tasklist.push(newTask);
        },
        DeleteTask(id){
            const index = tasklist.findIndex(project => project.id == id);
        
            if (index != -1){
                tasklist.splice(index,1);
            }
        },

        EditTask(id,title,details,date,priority){
            const index = tasklist.findIndex(project => project.id == id)
            if (index != -1){
                tasklist[index] = AddTask(title,details,date,priority)
            }
        },
        get projectID(){
            return id;
        }
    }
}

function AddProject(name){
    const newProject = project(name);
    projects.push(newProject);
}

function EditProject(id,name){
    const index = projects.findIndex(project => project.id == id);

    if (index !== -1) {
        projects[index].name = name;
    }
}

function DeleteProject(id){
    const index = projects.findIndex(project => project.id == id);

    if (index != -1){
        projects.splice(index,1);
    }
}
function getProjects() {
    return projects;
}

// Update your export statement
export { project, AddProject, DeleteProject, EditProject, getProjects }

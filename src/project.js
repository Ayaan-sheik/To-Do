import { Todo, AddTask } from "./todo";

let projects = [];

function project(name){
    const id = crypto.randomUUID();
    const tasklist = [];
    const taskNum = tasklist.length;
    return{
        tasklist,
        name,
        taskNum,
        AddTasks(title, details, date, priority){
            const newTask = AddTask(title, details, date, priority);
            tasklist.push(newTask);
        },
        DeleteTask(id){
            const index = tasklist.findIndex(project => project.id == id);
        
            if (index != -1){
                tasklist.splice(index, 1);
            }
        },
        EditTask(id, title, details, date, priority){
            const index = tasklist.findIndex(project => project.id == id)
            if (index != -1){
                tasklist[index] = AddTask(title, details, date, priority)
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
    return newProject;
}

function EditProject(id, name){
    const index = projects.findIndex(project => project.projectID === id);

    if (index !== -1) {
        projects[index].name = name;
        return projects[index];
    }
    return null;
}

function DeleteProject(id){
    console.log("DeleteProject called with ID:", id);
    console.log("Projects before deletion:", projects.length);
    
    const index = projects.findIndex(project => project.projectID === id);
    console.log("Found project at index:", index);

    if (index !== -1){
        projects.splice(index, 1);
        console.log("Projects after deletion:", projects.length);
        return true;
    }
    return false;
}

function getProjects() {
    return projects;
}

// Update your export statement
export { project, AddProject, DeleteProject, EditProject, getProjects }

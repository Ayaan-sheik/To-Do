import { Todo, AddTask } from "./todo.js";
import { isToday, isThisWeek, parseISO } from 'date-fns';
import { saveProjects, loadProjects } from './storage.js';

let projects = [];

function project(name, id = crypto.randomUUID()) {
    // Make tasklist a property of the returned object instead of a closure variable
    return {
        tasklist: [],
        name,
        projectID: id,
        
        AddTasks(title, details, date, priority) {
            console.log(`Adding task to project ${this.name} (${this.projectID}):`, {title, details, date, priority});
            const newTask = AddTask(title, details, date, priority);
            this.tasklist.push(newTask);
            saveProjects(projects);
            return newTask;
        },
        
        DeleteTask(id) {
            const index = this.tasklist.findIndex(task => task.id === id);
            if (index !== -1) {
                this.tasklist.splice(index, 1);
                saveProjects(projects);
            }
        },
        
        EditTask(id, title, details, date, priority) {
            const index = this.tasklist.findIndex(task => task.id === id);
            if (index !== -1) {
                const newTask = AddTask(title, details, date, priority, id);
                if (this.tasklist[index].isCompleted) {
                    newTask.markCompleted();
                }
                this.tasklist[index] = newTask;
                saveProjects(projects);
            }
        },
        
        getTodayTasks() {
            return this.tasklist.filter(task => task.isDueToday);
        },
        
        getWeekTasks() {
            return this.tasklist.filter(task => task.isDueThisWeek);
        },
        
        getImportantTasks() {
            return this.tasklist.filter(task => task.isImportant);
        },
        
        getCompletedTasks() {
            return this.tasklist.filter(task => task.isCompleted);
        }
    };
}

function AddProject(name) {
    const newProject = project(name);
    projects.push(newProject);
    saveProjects(projects);
    return newProject;
}

function DeleteProject(id) {
    const index = projects.findIndex(project => project.projectID === id);
    if (index !== -1) {
        projects.splice(index, 1);
        saveProjects(projects);
        return true;
    }
    return false;
}

function EditProject(id, name) {
    const index = projects.findIndex(project => project.projectID === id);
    if (index !== -1) {
        projects[index].name = name;
        saveProjects(projects);
        return projects[index];
    }
    return null;
}

// Get all tasks across all projects
function getAllTasks() {
    return projects.flatMap(project => project.tasklist);
}

// Get all tasks due today across all projects
function getAllTodayTasks() {
    return projects.flatMap(project => project.getTodayTasks());
}

// Get all tasks due this week across all projects
function getAllWeekTasks() {
    return projects.flatMap(project => project.getWeekTasks());
}

// Get all important tasks across all projects
function getAllImportantTasks() {
    return projects.flatMap(project => project.getImportantTasks());
}

// Get all completed tasks across all projects
function getAllCompletedTasks() {
    return projects.flatMap(project => project.getCompletedTasks());
}

function getProjects() {
    return projects;
}

function initializeProjects() {
    const savedProjects = loadProjects();
    projects = [];
    
    if (savedProjects && savedProjects.length > 0) {
        savedProjects.forEach(savedProject => {
            // Create a new project with the saved name and ID
            const restoredProject = project(savedProject.name, savedProject.projectID);
            
            // Restore tasks if they exist
            if (savedProject.tasklist && Array.isArray(savedProject.tasklist)) {
                savedProject.tasklist.forEach(task => {
                    // Parse the date string back to a Date object
                    let taskDate;
                    if (typeof task.date === 'string') {
                        try {
                            taskDate = parseISO(task.date);
                            if (isNaN(taskDate.getTime())) {
                                taskDate = new Date();
                            }
                        } catch (e) {
                            console.log("Error parsing date:", e);
                            taskDate = new Date();
                        }
                    } else {
                        taskDate = new Date();
                    }
                    
                    // Create a new task with the saved properties
                    const newTask = AddTask(
                        task.title,
                        task.details || "",
                        taskDate,
                        task.priority || "medium",
                        task.id
                    );
                    
                    // Restore completed status
                    if (task.isCompleted) {
                        newTask.markCompleted();
                    }
                    
                    // Add the task to the project's tasklist
                    restoredProject.tasklist.push(newTask);
                });
            }
            
            // Add the restored project to the projects array
            projects.push(restoredProject);
        });
    } else {
        // Create a default project if no projects exist
        AddProject("Default Project");
    }
    
    console.log("Projects initialized:", projects);
    return projects;
}

export {
    project,
    AddProject,
    DeleteProject,
    EditProject,
    getProjects,
    getAllTasks,
    getAllTodayTasks,
    getAllWeekTasks,
    getAllImportantTasks,
    getAllCompletedTasks,
    initializeProjects
};

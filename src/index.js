import './styles.css';

import {AddProject, DeleteProject, EditProject, initializeProjects, getProjects} from './project.js';
import {Todo} from './todo.js';
import UI from './ui.js';

// For debugging
window.debugApp = {
    getProjects,
    AddProject,
    DeleteProject,
    EditProject,
    UI
};

// Initialize projects from localStorage
const projects = initializeProjects();
console.log("Projects loaded:", projects);

// Initialize the UI after loading projects
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded, initializing UI");
    UI.init();
});
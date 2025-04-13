// UI module for Todo App
import { AddProject as createProject, DeleteProject as removeProject, EditProject as updateProject } from './project.js';

const UI = (() => {
    // Cache DOM elements
    const projectsContainer = document.querySelector('.projects-section');
    const taskListContainer = document.querySelector('.task-list');
    const tasksHeader = document.querySelector('.tasks-header');
    const addProjectButton = document.querySelector('.add-project');
    
    // Initialize the UI
    function init() {
        displayProjectsSidebar();
        setupEventListeners();
    }
    
    // Display projects in the sidebar
    function displayProjectsSidebar() {
        // Get all projects from the imported module
        const projects = getProjects();
        
        // Clear previous project listings (except the header and add button)
        const existingProjects = document.querySelectorAll('.project-item');
        existingProjects.forEach(project => project.remove());
        
        // Update projects count in header
        const projectsHeader = document.querySelector('.projects-header span:first-child');
        projectsHeader.textContent = `Projects (${projects.length})`;
        
        // Create project items
        projects.forEach(project => {
            const projectElement = createProjectElement(project);
            // Insert before the "Add Project" button
            projectsContainer.insertBefore(projectElement, addProjectButton);
        });
    }
    
    // Create a single project element
    function createProjectElement(project) {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.dataset.projectId = project.projectID;
        
        // Project name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = `✂️ ${project.name}`;
        
        // Actions container
        const actionsDiv = document.createElement('div');
        
        // Edit button
        const editSpan = document.createElement('span');
        editSpan.textContent = '✏️';
        editSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            promptEditProject(project);
        });
        
        // Delete button
        const deleteSpan = document.createElement('span');
        deleteSpan.textContent = '🗑️';
        deleteSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteProjectHandler(project.projectID);
        });
        
        // Add elements to the container
        actionsDiv.appendChild(editSpan);
        actionsDiv.appendChild(deleteSpan);
        projectItem.appendChild(nameSpan);
        projectItem.appendChild(actionsDiv);
        
        // Add click event to show project tasks
        projectItem.addEventListener('click', () => {
            displayProjectTasks(project);
        });
        
        return projectItem;
    }
    
    // Display tasks for a selected project
    function displayProjectTasks(project) {
        // Update header
        tasksHeader.querySelector('h2').textContent = project.name;
        tasksHeader.querySelector('div').textContent = `Tasks (${project.tasklist.length})`;
        
        // Clear existing tasks
        taskListContainer.innerHTML = '';
        
        // Display project tasks
        project.tasklist.forEach(task => {
            const taskElement = createTaskElement(task, project.projectID);
            taskListContainer.appendChild(taskElement);
        });
        
        // Highlight selected project
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`.project-item[data-project-id="${project.projectID}"]`).classList.add('selected');
    }
    
    // Create a single task element
    function createTaskElement(task, projectID) {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        if (task.isCompleted) {
            taskItem.classList.add('completed');
        }
        
        // Task title
        const titleDiv = document.createElement('div');
        titleDiv.textContent = task.title;
        
        // Task accessories (date and actions)
        const accessoriesDiv = document.createElement('div');
        accessoriesDiv.className = 'task-accessories';
        
        // Date
        const dateDiv = document.createElement('div');
        dateDiv.textContent = task.date;
        
        // Actions
        const iconsDiv = document.createElement('div');
        iconsDiv.className = 'task-icons';
        
        // Edit button
        const editDiv = document.createElement('div');
        editDiv.textContent = '✏️';
        editDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            promptEditTask(task, projectID);
        });
        
        // Delete button
        const deleteDiv = document.createElement('div');
        deleteDiv.textContent = '🗑️';
        deleteDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTaskHandler(task.id, projectID);
        });
        
        // Info button
        const infoDiv = document.createElement('div');
        infoDiv.textContent = 'ℹ️';
        infoDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            showTaskDetails(task);
        });
        
        // Add elements to containers
        iconsDiv.appendChild(editDiv);
        iconsDiv.appendChild(deleteDiv);
        iconsDiv.appendChild(infoDiv);
        
        accessoriesDiv.appendChild(dateDiv);
        accessoriesDiv.appendChild(iconsDiv);
        
        taskItem.appendChild(titleDiv);
        taskItem.appendChild(accessoriesDiv);
        
        // Toggle completion on click
        taskItem.addEventListener('click', () => {
            toggleTaskCompletion(task, projectID, taskItem);
        });
        
        return taskItem;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Add project button
        addProjectButton.addEventListener('click', promptAddProject);
        
        // Home menu items
        const menuItems = document.querySelectorAll('.sidebar-menu li');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const filter = item.textContent.trim();
                displayFilteredTasks(filter);
            });
        });
    }
    
    // Filter tasks based on selected menu
    function displayFilteredTasks(filter) {
        // Implementation for filtering tasks by All, Today, Week, etc.
        // To be implemented based on your requirements
    }
    
    // Helper functions for CRUD operations
    function promptAddProject() {
        const name = prompt('Enter project name:');
        if (name && name.trim()) {
            createProject(name.trim());
            displayProjectsSidebar();
        }
    }
    
    function promptEditProject(project) {
        const newName = prompt('Edit project name:', project.name);
        if (newName && newName.trim()) {
            updateProject(project.projectID, newName.trim());
            displayProjectsSidebar();
        }
    }
    
    function deleteProjectHandler(projectID) {
        if (confirm('Are you sure you want to delete this project?')) {
            removeProject(projectID);
            displayProjectsSidebar();
            // Reset task view
            tasksHeader.querySelector('h2').textContent = 'All';
            tasksHeader.querySelector('div').textContent = 'Tasks (0)';
            taskListContainer.innerHTML = '';
        }
    }
    
    function promptAddTask(projectID) {
        // To be implemented
    }
    
    function promptEditTask(task, projectID) {
        // To be implemented
    }
    
    function deleteTaskHandler(taskID, projectID) {
        // To be implemented
    }
    
    function toggleTaskCompletion(task, projectID, taskElement) {
        // To be implemented
    }
    
    function showTaskDetails(task) {
        alert(`Title: ${task.title}\nDetails: ${task.details}\nDate: ${task.date}\nPriority: ${task.priority}`);
    }
    
    // Helper function to get projects
    function getProjects() {
        // This should be replaced with actual access to your projects array
        // Since your projects array is not exported, you'll need to modify your project.js
        // to export the projects array or create a getter function
        return window.projects || []; // Fallback if projects not accessible
    }
    
    // Public API
    return {
        init,
        displayProjectsSidebar,
        displayProjectTasks,
        refreshUI: displayProjectsSidebar
    };
})();

export default UI;
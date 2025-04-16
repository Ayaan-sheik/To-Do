// UI module for Todo App
import { AddProject as createProject, DeleteProject as removeProject, EditProject as updateProject, getProjects } from './project.js';

const UI = (() => {
    // Cache DOM elements
    const projectsContainer = document.querySelector('.projects-section');
    const taskListContainer = document.querySelector('.task-list');
    const tasksHeader = document.querySelector('.tasks-header');
    const addProjectButton = document.querySelector('.add-project');
    let modalOverlay = null;
    
    // Initialize the UI
    function init() {
        displayProjectsSidebar();
        setupEventListeners();
        createModalElements();
    }
    
    // Create modal elements for forms
    function createModalElements() {
        // Create modal overlay if it doesn't exist
        if (!document.querySelector('.modal-overlay')) {
            modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            document.body.appendChild(modalOverlay);
            
            // Close modal when clicking outside
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
        }
    }
    
    // Open modal with content
    function openModal(modalContent) {
        modalOverlay.innerHTML = '';
        modalOverlay.appendChild(modalContent);
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    // Close modal
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
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
            // Fix: Pass the correct project ID
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
        
        // Store the current project ID for future operations
        taskListContainer.dataset.currentProjectId = project.projectID;
        
        // Clear existing tasks and "Add Task" button if it exists
        taskListContainer.innerHTML = '';
        const existingAddTaskButton = document.querySelector('.add-task-button');
        if (existingAddTaskButton) {
            existingAddTaskButton.remove();
        }
        
        // Display project tasks
        project.tasklist.forEach(task => {
            const taskElement = createTaskElement(task, project.projectID);
            taskListContainer.appendChild(taskElement);
        });
        
        // Create an "Add Task" button below the task list
        const addTaskButtonContainer = document.createElement('div');
        addTaskButtonContainer.className = 'add-task-button';
        addTaskButtonContainer.style.cssText = 'display: flex; justify-content: center; margin-top: 20px;';
        
        const addTaskButton = document.createElement('button');
        addTaskButton.textContent = '+ Add Task';
        addTaskButton.className = 'btn-submit';
        addTaskButton.addEventListener('click', () => promptAddTask(project.projectID));
        
        addTaskButtonContainer.appendChild(addTaskButton);
        
        // Add the button after the task list
        taskListContainer.parentNode.insertBefore(addTaskButtonContainer, taskListContainer.nextSibling);
        
        // Highlight selected project
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedProject = document.querySelector(`.project-item[data-project-id="${project.projectID}"]`);
        if (selectedProject) {
            selectedProject.classList.add('selected');
        }
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
        addProjectButton.addEventListener('click', showAddProjectForm);
        
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
    
    // Show add project form in a modal
    function showAddProjectForm() {
        const formContainer = document.createElement('div');
        formContainer.className = 'modal-content';
        
        formContainer.innerHTML = `
            <div class="modal-header">
                <h2>Add New Project</h2>
                <span class="close-modal">&times;</span>
            </div>
            <form id="add-project-form">
                <div class="form-group">
                    <label for="project-name">Project Name:</label>
                    <input type="text" id="project-name" name="project-name" required>
                </div>
                <div class="form-group">
                    <label for="project-description">Description (Optional):</label>
                    <textarea id="project-description" name="project-description" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-submit">Add Project</button>
                </div>
            </form>
        `;
        
        // Open the modal
        openModal(formContainer);
        
        // Close button event
        formContainer.querySelector('.close-modal').addEventListener('click', closeModal);
        formContainer.querySelector('.btn-cancel').addEventListener('click', closeModal);
        
        // Form submission
        const form = formContainer.querySelector('#add-project-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const projectName = form.querySelector('#project-name').value.trim();
            if (projectName) {
                createProject(projectName);
                displayProjectsSidebar();
                closeModal();
            }
        });
    }
    
    // Helper functions for project CRUD operations
    function promptEditProject(project) {
        const formContainer = document.createElement('div');
        formContainer.className = 'modal-content';
        
        formContainer.innerHTML = `
            <div class="modal-header">
                <h2>Edit Project</h2>
                <span class="close-modal">&times;</span>
            </div>
            <form id="edit-project-form">
                <div class="form-group">
                    <label for="project-name">Project Name:</label>
                    <input type="text" id="project-name" name="project-name" value="${project.name}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-submit">Update Project</button>
                </div>
            </form>
        `;
        
        // Open the modal
        openModal(formContainer);
        
        // Close button event
        formContainer.querySelector('.close-modal').addEventListener('click', closeModal);
        formContainer.querySelector('.btn-cancel').addEventListener('click', closeModal);
        
        // Form submission
        const form = formContainer.querySelector('#edit-project-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const projectName = form.querySelector('#project-name').value.trim();
            if (projectName) {
                updateProject(project.projectID, projectName);
                displayProjectsSidebar();
                closeModal();
                
                // Refresh task view if this was the selected project
                const selectedProject = document.querySelector('.project-item.selected');
                if (selectedProject && selectedProject.dataset.projectId === project.projectID) {
                    displayProjectTasks(project);
                }
            }
        });
    }
    
    function deleteProjectHandler(projectID) {
        console.log("Deleting project with ID:", projectID); // Debug
        
        const confirmContainer = document.createElement('div');
        confirmContainer.className = 'modal-content';
        
        confirmContainer.innerHTML = `
            <div class="modal-header">
                <h2>Delete Project</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this project? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-cancel">Cancel</button>
                <button type="button" class="btn-delete">Delete</button>
            </div>
        `;
        
        // Open the modal
        openModal(confirmContainer);
        
        // Close button event
        confirmContainer.querySelector('.close-modal').addEventListener('click', closeModal);
        confirmContainer.querySelector('.btn-cancel').addEventListener('click', closeModal);
        
        // Delete confirmation
        confirmContainer.querySelector('.btn-delete').addEventListener('click', () => {
            console.log("Confirmed deletion of project ID:", projectID); // Debug
            removeProject(projectID);
            displayProjectsSidebar();
            
            // Reset task view
            tasksHeader.querySelector('h2').textContent = 'All';
            tasksHeader.querySelector('div').textContent = 'Tasks (0)';
            taskListContainer.innerHTML = '';
            
            closeModal();
        });
    }
    
    // Function to show add task form
function promptAddTask(projectID) {
    const formContainer = document.createElement('div');
    formContainer.className = 'modal-content';
    
    // Find the project to add the task to
    const projects = getProjects();
    const project = projects.find(p => p.projectID === projectID);
    
    if (!project) {
        console.error("Project not found");
        return;
    }

    formContainer.className = 'modal-content add-task-modal';
    
    formContainer.innerHTML = `
        <div class="modal-header">
            <h2>Add New Task</h2>
            <span class="close-modal">&times;</span>
        </div>
        <form id="add-task-form">
            <div class="form-group">
                <label for="task-title">Task Title:</label>
                <input type="text" id="task-title" name="task-title" required>
            </div>
            <div class="form-group">
                <label for="task-details">Details:</label>
                <textarea id="task-details" name="task-details" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="task-date">Due Date:</label>
                <input type="date" id="task-date" name="task-date" required>
            </div>
            <div class="form-group">
                <label for="task-priority">Priority:</label>
                <select id="task-priority" name="task-priority">
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel">Cancel</button>
                <button type="submit" class="btn-submit">Add Task</button>
            </div>
        </form>
    `;
    
    // Open the modal
    openModal(formContainer);
    
    // Close button event
    formContainer.querySelector('.close-modal').addEventListener('click', closeModal);
    formContainer.querySelector('.btn-cancel').addEventListener('click', closeModal);
    
    // Form submission
    const form = formContainer.querySelector('#add-task-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const taskTitle = form.querySelector('#task-title').value.trim();
        const taskDetails = form.querySelector('#task-details').value.trim();
        const taskDate = form.querySelector('#task-date').value;
        const taskPriority = form.querySelector('#task-priority').value;
        
        if (taskTitle && taskDate) {
            // Add task to the project
            project.AddTasks(taskTitle, taskDetails, taskDate, taskPriority);
            
            // Refresh the UI
            displayProjectTasks(project);
            closeModal();
        }
    });
}

// Function to show edit task form
function promptEditTask(task, projectID) {
    const formContainer = document.createElement('div');
    formContainer.className = 'modal-content';
    
    // Find the project containing the task
    const projects = getProjects();
    const project = projects.find(p => p.projectID === projectID);
    
    if (!project) {
        console.error("Project not found");
        return;
    }
    
    formContainer.innerHTML = `
        <div class="modal-header">
            <h2>Edit Task</h2>
            <span class="close-modal">&times;</span>
        </div>
        <form id="edit-task-form">
            <div class="form-group">
                <label for="task-title">Task Title:</label>
                <input type="text" id="task-title" name="task-title" value="${task.title}" required>
            </div>
            <div class="form-group">
                <label for="task-details">Details:</label>
                <textarea id="task-details" name="task-details" rows="3">${task.details || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="task-date">Due Date:</label>
                <input type="date" id="task-date" name="task-date" value="${task.date}" required>
            </div>
            <div class="form-group">
                <label for="task-priority">Priority:</label>
                <select id="task-priority" name="task-priority">
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-cancel">Cancel</button>
                <button type="submit" class="btn-submit">Update Task</button>
            </div>
        </form>
    `;
    
    // Open the modal
    openModal(formContainer);
    
    // Close button event
    formContainer.querySelector('.close-modal').addEventListener('click', closeModal);
    formContainer.querySelector('.btn-cancel').addEventListener('click', closeModal);
    
    // Form submission
    const form = formContainer.querySelector('#edit-task-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const taskTitle = form.querySelector('#task-title').value.trim();
        const taskDetails = form.querySelector('#task-details').value.trim();
        const taskDate = form.querySelector('#task-date').value;
        const taskPriority = form.querySelector('#task-priority').value;
        
        if (taskTitle && taskDate) {
            // Edit the task in the project
            project.EditTask(task.id, taskTitle, taskDetails, taskDate, taskPriority);
            
            // Refresh the UI
            displayProjectTasks(project);
            closeModal();
        }
    });
}

// Function to handle task deletion
function deleteTaskHandler(taskID, projectID) {
    const confirmContainer = document.createElement('div');
    confirmContainer.className = 'modal-content';
    
    // Find the project containing the task
    const projects = getProjects();
    const project = projects.find(p => p.projectID === projectID);
    
    if (!project) {
        console.error("Project not found");
        return;
    }
    
    confirmContainer.innerHTML = `
        <div class="modal-header">
            <h2>Delete Task</h2>
            <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body">
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn-cancel">Cancel</button>
            <button type="button" class="btn-delete">Delete</button>
        </div>
    `;
    
    // Open the modal
    openModal(confirmContainer);
    
    // Close button event
    confirmContainer.querySelector('.close-modal').addEventListener('click', closeModal);
    confirmContainer.querySelector('.btn-cancel').addEventListener('click', closeModal);
    
    // Delete confirmation
    confirmContainer.querySelector('.btn-delete').addEventListener('click', () => {
        // Delete the task from the project
        project.DeleteTask(taskID);
        
        // Refresh the UI
        displayProjectTasks(project);
        closeModal();
    });
}

// Function to toggle task completion status
function toggleTaskCompletion(task, projectID, taskElement) {
    // Find the project containing the task
    const projects = getProjects();
    const project = projects.find(p => p.projectID === projectID);
    
    if (!project) {
        console.error("Project not found");
        return;
    }
    
    // Find the task in the project
    const taskIndex = project.tasklist.findIndex(t => t.id === task.id);
    
    if (taskIndex === -1) {
        console.error("Task not found");
        return;
    }
    
    // Toggle completion status
    if (!task.isCompleted) {
        task.markCompleted();
        taskElement.classList.add('completed');
    } else {
        // If you want to allow un-completing tasks, you would need to add that functionality to the Todo class
        // For now, we'll just log a message
        console.log("Task is already completed. Un-completing is not implemented yet.");
    }
    
    // Update the task in the project (not needed since objects are passed by reference,
    // but included for completeness and future-proofing)
    project.tasklist[taskIndex] = task;
    
    // You might want to update the UI to show the new completion status
    displayProjectTasks(project);
}
    
    function showTaskDetails(task) {
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'modal-content';
        
        detailsContainer.innerHTML = `
            <div class="modal-header">
                <h2>Task Details</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="task-detail-item">
                    <strong>Title:</strong> ${task.title}
                </div>
                <div class="task-detail-item">
                    <strong>Details:</strong> ${task.details || 'None'}
                </div>
                <div class="task-detail-item">
                    <strong>Date:</strong> ${task.date}
                </div>
                <div class="task-detail-item">
                    <strong>Priority:</strong> ${task.priority}
                </div>
                <div class="task-detail-item">
                    <strong>Status:</strong> ${task.isCompleted ? 'Completed' : 'Pending'}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-close">Close</button>
            </div>
        `;
        
        // Open the modal
        openModal(detailsContainer);
        
        // Close button events
        detailsContainer.querySelector('.close-modal').addEventListener('click', closeModal);
        detailsContainer.querySelector('.btn-close').addEventListener('click', closeModal);
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

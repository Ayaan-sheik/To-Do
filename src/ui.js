// UI module for Todo App
import { AddProject as createProject, DeleteProject as removeProject, EditProject as updateProject, getProjects } from './project.js';
import { format } from 'date-fns'; // Import format from date-fns

// New imports for filtering functionality
import { 
    getAllTasks, 
    getAllTodayTasks, 
    getAllWeekTasks, 
    getAllImportantTasks, 
    getAllCompletedTasks 
} from './project.js';

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
        restoreCurrentView();
    }

    // Add this new function
    function restoreCurrentView() {
        // Get the last selected project or view from localStorage
        const lastView = localStorage.getItem('lastView') || 'all';
        
        if (lastView.startsWith('project-')) {
            const projectId = lastView.replace('project-', '');
            const projects = getProjects();
            const project = projects.find(p => p.projectID === projectId);
            
            if (project) {
                console.log("Restoring project view:", project.name, project.projectID);
                displayProjectTasks(project);
            } else {
                // Fallback to all tasks if project not found
                console.log("Project not found, displaying all tasks");
                displayFilteredTasks('📅 All Tasks');
            }
        } else {
            // Map stored view to menu item text
            let filterText;
            switch(lastView) {
                case 'all': filterText = '📅 All Tasks'; break;
                case 'today': filterText = '📆 Today'; break;
                case 'week': filterText = '📊 Week'; break;
                case 'important': filterText = '⭐ Important'; break;
                case 'completed': filterText = '✅ Completed'; break;
                default: filterText = '📅 All Tasks';
            }
            displayFilteredTasks(filterText);
        }
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
    // Fix for the displayProjectTasks function in ui.js
function displayProjectTasks(project) {
    // Update header
    tasksHeader.querySelector('h2').textContent = project.name;
    tasksHeader.querySelector('div').textContent = `Tasks (${project.tasklist.length})`;
    
    // Store the current project ID for future operations
    taskListContainer.dataset.currentProjectId = project.projectID;
    
    // Clear existing tasks
    taskListContainer.innerHTML = '';
    
    // Always remove any existing Add Task button before adding a new one
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
    
    // Make sure to pass the correct project ID
    const projectID = project.projectID;
    addTaskButton.addEventListener('click', () => promptAddTask(projectID));
    
    addTaskButtonContainer.appendChild(addTaskButton);
    
    // Add the button after the task list
    taskListContainer.parentNode.insertBefore(addTaskButtonContainer, taskListContainer.nextSibling);
    
    // Highlight selected project
    document.querySelectorAll('.project-item, .sidebar-menu li').forEach(item => {
        item.classList.remove('selected');
    });
    
    const selectedProject = document.querySelector(`.project-item[data-project-id="${project.projectID}"]`);
    if (selectedProject) {
        selectedProject.classList.add('selected');
    }
    
    // Save current view
    localStorage.setItem('lastView', `project-${project.projectID}`);
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
        
        // Date - Use formattedDate getter instead of date property
        const dateDiv = document.createElement('div');
        dateDiv.textContent = task.formattedDate;
        
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
                // Remove selected class from all menu items
                menuItems.forEach(menuItem => {
                    menuItem.classList.remove('selected');
                });
      
                // Add selected class to clicked item
                item.classList.add('selected');
                const filter = item.textContent.trim();
                displayFilteredTasks(filter);
            });
        });
    }
    
    // Filter tasks based on selected menu
    function displayFilteredTasks(filter) {
        let tasks = [];
        let headerTitle = '';
        let currentView = '';
        
        switch (filter) {
            case '📅 All Tasks':
                tasks = getAllTasks();
                headerTitle = 'All Tasks';
                currentView = 'all';
                break;
            case '📆 Today':
                tasks = getAllTodayTasks();
                headerTitle = 'Today\'s Tasks';
                currentView = 'today';
                break;
            case '📊 Week':
                tasks = getAllWeekTasks();
                headerTitle = 'This Week\'s Tasks';
                currentView = 'week';
                break;
            case '⭐ Important':
                tasks = getAllImportantTasks();
                headerTitle = 'Important Tasks';
                currentView = 'important';
                break;
            case '✅ Completed':
                tasks = getAllCompletedTasks();
                headerTitle = 'Completed Tasks';
                currentView = 'completed';
                break;
            default:
                tasks = getAllTasks();
                headerTitle = 'All Tasks';
                currentView = 'all';
        }
        
        // Update header
        tasksHeader.querySelector('h2').textContent = headerTitle;
        tasksHeader.querySelector('div').textContent = `Tasks (${tasks.length})`;
        
        // Clear task container
        taskListContainer.innerHTML = '';
        
        // Remove Add Task button if it exists
        const existingAddTaskButton = document.querySelector('.add-task-button');
        if (existingAddTaskButton) {
            existingAddTaskButton.remove();
        }
        
        // Add tasks to container
        if (tasks.length === 0) {
            const noTasksMessage = document.createElement('div');
            noTasksMessage.textContent = `No ${headerTitle.toLowerCase()} found.`;
            noTasksMessage.style.textAlign = 'center';
            noTasksMessage.style.margin = '20px 0';
            noTasksMessage.style.color = '#888';
            taskListContainer.appendChild(noTasksMessage);
        } else {
            // Create a map to keep track of which project each task belongs to
            const taskProjectMap = new Map();
            
            // Populate the map
            getProjects().forEach(project => {
                project.tasklist.forEach(task => {
                    taskProjectMap.set(task.id, project.projectID);
                });
            });
            
            // Sort tasks by date
            tasks.sort((a, b) => a.date - b.date);
            
            // Display tasks
            tasks.forEach(task => {
                const projectID = taskProjectMap.get(task.id);
                if (projectID) {
                    const taskElement = createTaskElement(task, projectID);
                    taskListContainer.appendChild(taskElement);
                }
            });
        }

        // Save current view
        localStorage.setItem('lastView', currentView);
        
        // For filtered views, we don't need an "Add Task" button
        // If we want to add a task, the user should select a specific project
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
// Function to show add task form
function promptAddTask(projectID) {
    console.log("promptAddTask called with projectID:", projectID);
    
    // Find the project to add the task to
    const projects = getProjects();
    const project = projects.find(p => p.projectID === projectID);
    
    if (!project) {
        console.error("Project not found with ID:", projectID);
        console.log("Available projects:", projects.map(p => ({ id: p.projectID, name: p.name })));
        return;
    }
    
    console.log("Found project:", project.name);
    
    const formContainer = document.createElement('div');
    formContainer.className = 'modal-content add-task-modal';
    
    // Set today's date as default in yyyy-MM-dd format
    const today = format(new Date(), 'yyyy-MM-dd');
    
    formContainer.innerHTML = `
        <div class="modal-header">
            <h2>Add New Task to "${project.name}"</h2>
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
                <input type="date" id="task-date" name="task-date" value="${today}" required>
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
            console.log(`Submitting new task for project ${project.name} (${project.projectID}):`, 
                {taskTitle, taskDetails, taskDate, taskPriority});
            
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
    
    // Format the date for the input field (yyyy-MM-dd)
    const formattedDateForInput = format(task.date, 'yyyy-MM-dd');
    
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
                <input type="date" id="task-date" name="task-date" value="${formattedDateForInput}" required>
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
    if (task.isCompleted) {
        uncompleteTask(task, projectID, taskElement);
    } else {
        task.markCompleted();
        taskElement.classList.add('completed');
    }
    
    // Update the task in the project (not needed since objects are passed by reference,
    // but included for completeness and future-proofing)
    project.tasklist[taskIndex] = task;
    // If we're in the completed tasks view, we might need to refresh the UI
    const currentView = document.querySelector('.sidebar-menu li.selected');
      if (currentView && currentView.textContent.trim() === '✅ Completed') {
        displayFilteredTasks('✅ Completed');
      }
    // You might want to update the UI to show the new completion status
    displayProjectTasks(project);
}

// Function to uncomplete a task
function uncompleteTask(task, projectID, taskElement) {
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
    
    // Use the unmarkCompleted method to mark the task as incomplete
    task.unmarkCompleted(); // Call the method to uncomplete the task
    
    // Update the UI
    taskElement.classList.remove('completed');
    
    // Refresh the UI if needed
    const currentView = document.querySelector('.sidebar-menu li.selected');
    if (currentView && currentView.textContent.trim() === '✅ Completed') {
        displayFilteredTasks('✅ Completed');
    } else {
        displayProjectTasks(project);
    }
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
                    <strong>Due Date:</strong> ${task.formattedDate}
                </div>
                <div class="task-detail-item">
                    <strong>Priority:</strong> ${task.priority}
                </div>
                <div class="task-detail-item">
                    <strong>Status:</strong> ${task.isCompleted ? 'Completed' : 'Pending'}
                </div>
                <div class="task-detail-item">
                    <strong>Due Today:</strong> ${task.isDueToday ? 'Yes' : 'No'}
                </div>
                <div class="task-detail-item">
                    <strong>Due This Week:</strong> ${task.isDueThisWeek ? 'Yes' : 'No'}
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
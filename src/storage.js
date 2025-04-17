// storage.js - Handles all localStorage operations for the Todo application

// Key used for storing projects in localStorage
const STORAGE_KEY = 'todoProjects';

/**
 * Prepares projects for storage by creating a storable representation
 * @param {Array} projects - Array of project objects
 * @returns {Array} - Array of simplified project objects ready for storage
 */
function prepareProjectsForStorage(projects) {
  return projects.map(project => {
    // Create a simplified representation of tasks
    const simplifiedTasks = project.tasklist.map(task => ({
      id: task.id,
      title: task.title,
      details: task.details || "",
      date: task.date instanceof Date ? task.date.toISOString() : task.date, // Convert Date to string
      priority: task.priority,
      isCompleted: task.isCompleted
    }));

    // Create a simplified representation of project
    return {
      name: project.name,
      projectID: project.projectID,
      tasklist: simplifiedTasks
    };
  });
}

/**
 * Saves projects data to localStorage
 * @param {Array} projects - Array of project objects to be saved
 */
function saveProjects(projects) {
  try {
    // Convert projects to a storable format
    const storableProjects = prepareProjectsForStorage(projects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storableProjects));
    console.log("Projects saved to localStorage:", storableProjects);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Loads projects data from localStorage
 * @returns {Array} Array of project objects or empty array if none found
 */
function loadProjects() {
  try {
    const savedProjects = localStorage.getItem(STORAGE_KEY);
    const parsedProjects = savedProjects ? JSON.parse(savedProjects) : [];
    console.log("Projects loaded from localStorage:", parsedProjects);
    return parsedProjects;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
}

/**
 * Clears all project data from localStorage
 */
function clearProjects() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Projects cleared from localStorage");
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Checks if there is any saved project data
 * @returns {Boolean} True if projects exist in storage
 */
function hasStoredProjects() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Gets the approximate size of data in localStorage
 * @returns {Number} Size in KB
 */
function getStorageSize() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return 0;
  
  // Approximate size calculation (2 bytes per character)
  const size = (data.length * 2) / 1024;
  return parseFloat(size.toFixed(2));
}

export {
  saveProjects,
  loadProjects,
  clearProjects,
  hasStoredProjects,
  getStorageSize
};
const Task = require('../models/Task');

// Get all tasks for the authenticated user
exports.getAllTasks = async (req, res) => {
  try {
    // Only fetch tasks for the authenticated user
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving tasks',
      error: error.message
    });
  }
};

// Get single task by ID (only if it belongs to the user)
exports.getTaskById = async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to view it'
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving task',
      error: error.message
    });
  }
};

// Create new task for the authenticated user
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    
    // Validation
    if (!title || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: title, description, and dueDate are required'
      });
    }
    
    if (title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: title cannot be empty'
      });
    }
    
    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: title cannot exceed 100 characters'
      });
    }
    
    if (description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: description cannot be empty'
      });
    }
    
    if (description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: description cannot exceed 500 characters'
      });
    }
    
    if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: status must be pending, in-progress, or completed'
      });
    }

    // Validate date format
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: invalid date format for dueDate'
      });
    }
    
    // Create task with authenticated user's ID
    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      userId: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    res.status(400).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// Update task (only if it belongs to the user)
exports.updateTask = async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    const { title, description, status, dueDate } = req.body;
    
    // Validation for fields if they are provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation error: title cannot be empty'
        });
      }
      if (title.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Validation error: title cannot exceed 100 characters'
        });
      }
    }
    
    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation error: description cannot be empty'
        });
      }
      if (description.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Validation error: description cannot exceed 500 characters'
        });
      }
    }
    
    if (status !== undefined && !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: status must be pending, in-progress, or completed'
      });
    }

    if (dueDate !== undefined) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Validation error: invalid date format for dueDate'
        });
      }
    }
    
    // Only update if task belongs to the authenticated user
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to update it'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data type provided'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// Delete task (only if it belongs to the user)
exports.deleteTask = async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format'
      });
    }

    // Only delete if task belongs to the authenticated user
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

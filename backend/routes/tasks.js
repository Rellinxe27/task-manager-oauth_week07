const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// Apply authentication middleware to all task routes
router.use(ensureAuthenticated);

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - dueDate
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated task ID
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *           description: Task status
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Task due date
 *         userId:
 *           type: string
 *           description: ID of the user who owns this task
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Task creation timestamp
 *       example:
 *         _id: 507f1f77bcf86cd799439011
 *         title: Complete project documentation
 *         description: Write comprehensive API documentation
 *         status: in-progress
 *         dueDate: 2025-11-15
 *         userId: 507f1f77bcf86cd799439022
 *         createdAt: 2025-10-28T10:00:00.000Z
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Retrieve all tasks for authenticated user
 *     tags: [Tasks]
 *     security:
 *       - OAuth2: []
 *     responses:
 *       200:
 *         description: List of all tasks for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Server error
 */
router.get('/', getAllTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a task by ID (must belong to authenticated user)
 *     tags: [Tasks]
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found or access denied
 *       500:
 *         description: Server error
 */
router.get('/:id', getTaskById);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task for authenticated user
 *     tags: [Tasks]
 *     security:
 *       - OAuth2: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 description: Task title (max 100 characters)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Task description (max 500 characters)
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 description: Task status (default is pending)
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Task due date
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error or invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task by ID (must belong to authenticated user)
 *     tags: [Tasks]
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 description: Task title (max 100 characters)
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Task description (max 500 characters)
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 description: Task status
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Task due date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error or invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found or access denied
 */
router.put('/:id', updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID (must belong to authenticated user)
 *     tags: [Tasks]
 *     security:
 *       - OAuth2: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found or access denied
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteTask);

module.exports = router;

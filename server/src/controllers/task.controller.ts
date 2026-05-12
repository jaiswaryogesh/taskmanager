import { Request, Response } from 'express';
import Task from '../models/Task';
import { io } from '../index';

export const getTasks = async (req: any, res: Response) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    const tasks = await Task.find({ workspace: workspaceId })
      .populate('completedBy', 'name email avatar')
      .sort('-createdAt');
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description, priority, dueDate, workspace, tags } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      workspace,
      tags,
      createdBy: req.user._id,
      completedBy: [],
    });

    const populatedTask = await Task.findById(task._id).populate('completedBy', 'name email avatar');

    // Emit real-time event
    io.to(workspace).emit('task_created', populatedTask);

    res.status(201).json(populatedTask);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const updateTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndUpdate(id, req.body, { new: true })
      .populate('completedBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Emit real-time event
    io.to(task.workspace.toString()).emit('task_updated', task);

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const deleteTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();

    // Emit real-time event
    io.to(task.workspace.toString()).emit('task_deleted', id);

    res.json({ message: 'Task removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const toggleTaskCompletion = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const completedByIndex = task.completedBy.findIndex(
      (uid: any) => uid.toString() === userId.toString()
    );

    if (completedByIndex !== -1) {
      // User already completed it, mark as pending (remove)
      task.completedBy.splice(completedByIndex, 1);
    } else {
      // User hasn't completed it, mark as complete (add)
      task.completedBy.push(userId);
    }

    await task.save();

    const populatedTask = await Task.findById(task._id).populate('completedBy', 'name email avatar');

    // Emit real-time event
    io.to(task.workspace.toString()).emit('task_updated', populatedTask);

    res.json(populatedTask);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

import { Request, Response } from 'express';
import Workspace from '../models/Workspace';

export const getWorkspaces = async (req: any, res: Response) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });
    res.json(workspaces);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const createWorkspace = async (req: any, res: Response) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
    });

    res.status(201).json(workspace);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

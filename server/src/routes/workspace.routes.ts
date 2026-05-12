import express from 'express';
import { getWorkspaces, createWorkspace } from '../controllers/workspace.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/').get(getWorkspaces).post(createWorkspace);

export default router;

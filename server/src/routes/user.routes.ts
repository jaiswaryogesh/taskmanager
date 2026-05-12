import express from 'express';
import { updateProfile, getTeamMembers, inviteToTeam, removeFromTeam, respondToInvitation } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/profile').put(updateProfile);
router.route('/team').get(getTeamMembers);
router.route('/team/invite').post(inviteToTeam);
router.route('/team/invitations/:teamId/respond').put(respondToInvitation);
router.route('/team/:id').delete(removeFromTeam);

export default router;

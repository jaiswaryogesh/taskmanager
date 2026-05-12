import { Request, Response } from 'express';
import User from '../models/User';
import Workspace from '../models/Workspace';

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      if (req.body.role) {
        user.role = req.body.role;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        team: updatedUser.team,
        pendingInvitations: updatedUser.pendingInvitations,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const getTeamMembers = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // If user has no team, they are the only member
    if (!user.team) {
      res.json([
        { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
      ]);
      return;
    }

    const members = await User.find({ team: user.team }).select('-password');
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const inviteToTeam = async (req: any, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const admin = await User.findById(req.user._id);

    const adminRole = admin?.role || 'admin';
    if (!admin || adminRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized as admin' });
      return;
    }

    let teamId = admin.team;
    
    // Create a team if admin doesn't have one
    if (!teamId) {
      const workspace = await Workspace.create({
        name: `${admin.name}'s Team`,
        owner: admin._id,
        members: [{ user: admin._id, role: 'admin' }]
      });
      teamId = workspace._id;
      admin.team = teamId;
      await admin.save();
    }

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      res.status(404).json({ message: 'User with this email not found. They must register first.' });
      return;
    }

    // Check if already in team
    if (targetUser.team?.toString() === teamId.toString()) {
      res.status(400).json({ message: 'User is already in your team' });
      return;
    }

    // Check if already invited
    const alreadyInvited = targetUser.pendingInvitations?.some(
      (inv: any) => inv.teamId.toString() === teamId.toString()
    );

    if (alreadyInvited) {
      res.status(400).json({ message: 'User has already been invited' });
      return;
    }

    targetUser.pendingInvitations = targetUser.pendingInvitations || [];
    targetUser.pendingInvitations.push({
      teamId: teamId,
      adminName: admin.name,
      adminEmail: admin.email,
    } as any);

    await targetUser.save();

    res.json({ message: 'Invitation sent successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const removeFromTeam = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const admin = await User.findById(req.user._id);

    const adminRole = admin?.role || 'admin';
    if (!admin || adminRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized as admin' });
      return;
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    if (targetUser.team?.toString() !== admin.team?.toString()) {
       res.status(400).json({ message: 'User is not in your team' });
       return;
    }

    if (targetUser._id.toString() === admin._id.toString()) {
       res.status(400).json({ message: 'You cannot remove yourself' });
       return;
    }

    targetUser.team = undefined as any; // remove from team
    await targetUser.save();

    res.json({ message: 'User removed from team' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const respondToInvitation = async (req: any, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const invitationIndex = user.pendingInvitations?.findIndex(
      (inv: any) => inv.teamId.toString() === teamId.toString()
    );

    if (invitationIndex === undefined || invitationIndex === -1) {
      res.status(404).json({ message: 'Invitation not found' });
      return;
    }

    if (action === 'accept') {
      user.team = teamId;
      // Also clear all other pending invitations since a user can only be in one team
      user.pendingInvitations = [] as any;
    } else if (action === 'reject') {
      user.pendingInvitations.splice(invitationIndex, 1);
    } else {
      res.status(400).json({ message: 'Invalid action' });
      return;
    }

    await user.save();
    res.json({ message: `Invitation ${action}ed successfully`, user });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

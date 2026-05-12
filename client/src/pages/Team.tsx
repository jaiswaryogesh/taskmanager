import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Mail, UserPlus, Loader2, Trash2 } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const Team = () => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/users/team');
      setMembers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setInviteLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      await api.post('/users/team/invite', { email: inviteEmail });
      setMessage({ text: 'User successfully added to team!', type: 'success' });
      setInviteEmail('');
      fetchMembers(); // refresh list
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to invite user', 
        type: 'error' 
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
    
    try {
      await api.delete(`/users/team/${memberId}`);
      fetchMembers(); // refresh list
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-2">Manage your team and collaborate efficiently.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-4">
          {members.map((member) => (
            <Card key={member._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar fallback={member.name.charAt(0).toUpperCase()} src={member.avatar} />
                  <div>
                    <h3 className="font-semibold">{member.name} {user?._id === member._id && "(You)"}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                    {member.role}
                  </Badge>
                  {user?.role === 'admin' && member._id !== user?._id && (
                    <button 
                      onClick={() => handleRemove(member._id)}
                      className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {members.length === 1 && user?.role !== 'admin' && (
            <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/50">
              <h3 className="font-semibold mb-2">You're the only one here</h3>
              <p className="text-sm text-muted-foreground">Ask your admin to invite you to their team, or change your role to Admin in settings to create your own team.</p>
            </div>
          )}
        </div>

        {user?.role === 'admin' && (
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Invite Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <p className="text-xs text-muted-foreground">User must have already registered an account.</p>
                </div>
                
                {message.text && (
                  <div className={`p-3 text-sm rounded-md ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={inviteLoading || !inviteEmail}
                  className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50"
                >
                  {inviteLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Send Invite
                </button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Team;

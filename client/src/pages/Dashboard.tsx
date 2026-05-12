import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { CheckCircle2, CircleDashed, ListTodo, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const [teamMemberCount, setTeamMemberCount] = useState(1);

  useEffect(() => {
    if (user?.team) {
      fetchTasks(user.team);
      import('../lib/axios').then(({ default: api }) => {
        api.get('/users/team').then(({ data }) => {
          const membersOnly = data.filter((m: any) => m.role !== 'admin');
          setTeamMemberCount(membersOnly.length > 0 ? membersOnly.length : 1);
        }).catch(() => {});
      });
    }
  }, [user, fetchTasks]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    
    if (user?.role === 'admin') {
      const totalPossibleCompletions = totalTasks * teamMemberCount;
      const actualCompletions = tasks.reduce((sum, t) => sum + (t.completedBy?.length || 0), 0);
      const pendingCompletions = totalPossibleCompletions - actualCompletions;
      const progressPercentage = totalPossibleCompletions === 0 ? 0 : Math.round((actualCompletions / totalPossibleCompletions) * 100);
      
      return { total: totalTasks, completed: actualCompletions, pending: pendingCompletions, progressPercentage, isTeamStats: true };
    } else {
      const myCompletions = tasks.filter(t => t.completedBy?.some((u: any) => (u._id || u) === user?._id)).length;
      const pending = totalTasks - myCompletions;
      const progressPercentage = totalTasks === 0 ? 0 : Math.round((myCompletions / totalTasks) * 100);
      
      return { total: totalTasks, completed: myCompletions, pending, progressPercentage, isTeamStats: false };
    }
  }, [tasks, teamMemberCount, user]);

  const chartData = [
    { name: 'Pending', value: stats.pending, color: '#e4e4e7' }, // zinc-200
    { name: 'Completed', value: stats.completed, color: '#10b981' }, // emerald-500
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>)}
          </div>
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full"></div>
        </div>
      </div>
    );
  }

  if (!user?.team) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">No Team Assigned</h2>
        <p className="text-muted-foreground">
          You are not part of any team yet. {user?.role === 'admin' ? 'Go to Team settings to create one.' : 'Please wait for an admin to invite you.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">
          {user.role === 'admin' ? "Here's what your team is working on." : "Here's the progress of the tasks."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <ListTodo className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Items</CardTitle>
            <CircleDashed className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Progress</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.progressPercentage}%</div>
            <Progress value={stats.progressPercentage} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{stats.isTeamStats ? 'Team Completion Overview' : 'Your Completion Status'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

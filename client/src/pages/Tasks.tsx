import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import api from '../lib/axios';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Tasks = () => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, toggleTaskCompletion, createTask, isLoading } = useTaskStore();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  useEffect(() => {
    if (user?.team) {
      fetchTasks(user.team);
      // Fetch team members for the checklist
      const fetchTeam = async () => {
        try {
          const { data } = await api.get('/users/team');
          setTeamMembers(data.filter((m: any) => m.role !== 'admin'));
        } catch (error) {
          console.error("Failed to fetch team members");
        }
      };
      fetchTeam();
    }
  }, [user, fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    await createTask({
      title: newTaskTitle,
      description: newTaskDesc,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      workspace: user?.team,
    });
    
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setIsModalOpen(false);
  };

  const priorityColors = {
    low: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  };

  if (!user?.team) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">You are not part of any team yet.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {user.role === 'admin' 
              ? 'Manage tasks and track your team\'s progress.' 
              : 'Complete your assigned tasks.'}
          </p>
        </div>
        {user.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl bg-muted/30">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No tasks found</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            {user.role === 'admin' ? 'Get started by creating a new task for your team.' : 'You have no tasks assigned at the moment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {tasks.map((task) => {
            const isCompletedByMe = task.completedBy?.some((u: any) => (u._id || u) === user._id);
            const totalMembers = teamMembers.length;
            const completedCount = task.completedBy?.length || 0;
            
            return (
              <Card key={task._id} className="p-5 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    {user.role === 'user' && (
                      <button
                        onClick={() => toggleTaskCompletion(task._id)}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isCompletedByMe 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50' 
                            : 'bg-primary text-primary-foreground hover:opacity-90'
                        }`}
                      >
                        {isCompletedByMe ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            Completed
                          </>
                        ) : (
                          <>
                            <div className="w-5 h-5 rounded-full border-2 border-current"></div>
                            Mark as Done
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className={priorityColors[task.priority]}>
                      {task.priority} Priority
                    </Badge>
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-accent/50 px-2.5 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>

                {user.role === 'admin' && (
                  <div className="md:w-72 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">Team Progress</h4>
                      <span className="text-xs font-medium bg-accent px-2 py-0.5 rounded-full">
                        {completedCount} / {totalMembers}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {teamMembers.map(member => {
                        const hasCompleted = task.completedBy?.some((u: any) => (u._id || u) === member._id);
                        return (
                          <div key={member._id} className="flex items-center justify-between text-sm">
                            <span className="truncate pr-2">{member.name}</span>
                            {hasCompleted ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs">Done</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium shrink-0">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs">Pending</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Update website hero section"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description (Optional)</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                  placeholder="Add some details..."
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-input/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;

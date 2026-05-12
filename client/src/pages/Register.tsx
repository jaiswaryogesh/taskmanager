import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Layout, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await register({ name, email, password, role });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background flex-row-reverse">
      {/* Left Panel (Visuals) - now on the right side for variety */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 overflow-hidden items-center justify-center border-l border-white/5">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-violet-600/20 to-fuchsia-600/20 z-0"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000"></div>
        
        {/* Glassmorphic Overlay Card */}
        <div className="relative z-10 w-full max-w-lg p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Layout className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">TaskFlow</h1>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Start organizing your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
              best work today.
            </span>
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-zinc-300">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
              <p>Unlimited workspaces and projects</p>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
              <p>Real-time collaboration with your team</p>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
              <p>Advanced Kanban boards and analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel (Form) - now on the left side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter your details below to get started for free.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">Must be at least 6 characters long.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Account Type</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                  className="w-full pl-4 pr-4 py-3 bg-input/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 appearance-none"
                >
                  <option value="admin">Admin (Create a new team)</option>
                  <option value="user">Team Member (Join via invite)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                {role === 'admin' ? "You will be the owner of a new workspace." : "Wait for an admin to invite you to their workspace."}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-xl font-semibold hover:opacity-90 hover:scale-[1.01] transition-all duration-200 active:scale-[0.98] shadow-md mt-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-border mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-foreground hover:text-primary transition-colors">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

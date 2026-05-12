import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Layout, LogOut, Settings, Users, Bell, Search, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Avatar } from '../components/ui/avatar';

export const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

const MainLayout = () => {
  const { user, logout, respondToInvitation } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (user?.team) {
      socket.emit('join_workspace', user.team);
    }
    return () => {
      socket.off('join_workspace');
    };
  }, [user]);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: Layout },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const pendingInvitations = user?.pendingInvitations || [];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border
        transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Layout className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">TaskFlow</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">
              Overview
            </p>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  <span className="font-medium text-sm">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-accent/50 text-accent-foreground">
            <Avatar fallback={user?.name?.charAt(0).toUpperCase() || 'U'} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-md hover:bg-accent text-muted-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-muted-foreground border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:outline-none text-sm w-48 text-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                className="relative p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {pendingInvitations.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-background"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-border bg-muted/30">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {pendingInvitations.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No new notifications
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {pendingInvitations.map((inv: any, idx: number) => (
                            <div key={idx} className="p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                              <p className="text-sm">
                                <span className="font-semibold">{inv.adminName}</span> invited you to join their team.
                              </p>
                              <div className="flex gap-2 mt-3">
                                <button 
                                  onClick={() => {
                                    respondToInvitation(inv.teamId, 'accept');
                                    setIsNotificationsOpen(false);
                                  }}
                                  className="flex-1 bg-primary text-primary-foreground text-xs font-medium py-1.5 rounded-md hover:opacity-90"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => {
                                    respondToInvitation(inv.teamId, 'reject');
                                    if (pendingInvitations.length === 1) setIsNotificationsOpen(false);
                                  }}
                                  className="flex-1 bg-destructive/10 text-destructive text-xs font-medium py-1.5 rounded-md hover:bg-destructive/20"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

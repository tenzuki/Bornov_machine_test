import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { apiClient } from '../api/client';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, User as UserIcon, Users, Copy, Check, X } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenUsersModal = async () => {
    setIsUsersModalOpen(true);
    try {
      const res = await apiClient.get('/auth/users');
      setUsersList(res.data.data || []);
    } catch {
      // Ignore
    }
  };

  const handleCopyId = (idToCopy: string) => {
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(idToCopy);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'MANAGER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FolderKanban className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              TaskCollaborate
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>

            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <FolderKanban className="h-4 w-4" />
              Projects
            </NavLink>

            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <CheckSquare className="h-4 w-4" />
              Tasks
            </NavLink>
          </nav>

          {/* User Profile & Directory */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenUsersModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-all"
              title="View All Users & Copy User IDs"
            >
              <Users className="h-4 w-4 text-indigo-400" />
              <span className="hidden md:inline">Users Directory</span>
            </button>

            {user && (
              <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <div className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-none">{user.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{user.email}</div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${getRoleBadge(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Users Directory Modal */}
      {isUsersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">System Users Directory</h3>
                  <p className="text-xs text-slate-400">View user profiles and copy User IDs to manage project team members and task assignments</p>
                </div>
              </div>
              <button
                onClick={() => setIsUsersModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-2xl max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-3">User Name & Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">User ID (UUID)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-indigo-400 select-all">{u.id}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleCopyId(u.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
                        >
                          {copiedId === u.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-slate-400" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsUsersModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

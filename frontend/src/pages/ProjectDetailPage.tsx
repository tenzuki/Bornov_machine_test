import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchProjectById, addProjectMember, removeProjectMember } from '../store/slices/projectSlice';
import { Task } from '../types';
import { apiClient } from '../api/client';
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  CheckSquare,
  User as UserIcon,
  Loader2,
  AlertCircle,
  X,
  Calendar,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentProject, loading, error } = useSelector((state: RootState) => state.project);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSystemUsers = async () => {
      try {
        const res = await apiClient.get('/auth/users');
        setSystemUsers(res.data.data || []);
      } catch {
        // ignore
      }
    };
    fetchSystemUsers();
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));

      const fetchProjectTasks = async () => {
        setTasksLoading(true);
        try {
          const res = await apiClient.get(`/tasks?projectId=${id}&limit=50`);
          setTasks(res.data.data);
        } catch {
          // Ignore
        } finally {
          setTasksLoading(false);
        }
      };

      fetchProjectTasks();
    }
  }, [dispatch, id]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !memberUserId.trim()) return;

    setMemberSubmitting(true);
    setMemberError(null);
    const result = await dispatch(addProjectMember({ projectId: id, userId: memberUserId.trim() }));
    if (addProjectMember.fulfilled.match(result)) {
      setIsMemberModalOpen(false);
      setMemberUserId('');
    } else {
      setMemberError(result.payload as string);
    }
    setMemberSubmitting(false);
  };

  const handleRemoveMember = async (userIdToRemove: string) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to remove this member from the project?')) {
      await dispatch(removeProjectMember({ projectId: id, userId: userIdToRemove }));
    }
  };

  const canManageMembers =
    currentUser?.role === 'ADMIN' ||
    (currentProject && currentProject.createdById === currentUser?.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-xs">Loading project details...</span>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'You do not have access to view this project.'}</p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation Back Link */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      {/* Project Banner Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{currentProject.name}</h1>
            <p className="text-sm text-slate-400 mt-1">{currentProject.description || 'No description provided.'}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl">
              Created by <span className="font-semibold text-white">{currentProject.createdBy?.name}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Members & Project Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members Column (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Team Members</h2>
            </div>

            {canManageMembers && (
              <button
                onClick={() => {
                  setMemberError(null);
                  setIsMemberModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg divide-y divide-slate-800/60">
            {currentProject.members && currentProject.members.length > 0 ? (
              currentProject.members.map((member) => (
                <div key={member.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{member.user?.name}</div>
                      <div className="text-[10px] text-slate-400">{member.user?.email}</div>
                    </div>
                  </div>

                  {canManageMembers && member.userId !== currentProject.createdById && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">No members assigned.</div>
            )}
          </div>
        </div>

        {/* Tasks Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Project Tasks</h2>
            </div>

            <Link
              to="/tasks"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Task</span>
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {tasksLoading ? (
              <div className="p-8 flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                <span className="text-xs">Loading tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tasks created in this project yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-slate-800/40 transition-all flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-100 truncate">{task.title}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {task.assignedTo && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <UserIcon className="h-3 w-3" />
                            {task.assignedTo.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Team Member</h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {memberError && (
              <div className="flex items-center gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{memberError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select User to Add</label>
                <select
                  value={memberUserId}
                  onChange={(e) => setMemberUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                >
                  <option value="">-- Choose User --</option>
                  {systemUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Or Enter User ID (UUID)</label>
                <input
                  type="text"
                  required
                  value={memberUserId}
                  onChange={(e) => setMemberUserId(e.target.value)}
                  placeholder="e.g. 8f2d677e-1bbe-45be-a54c-e720ccd78156"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* System Users Directory helper list inside modal */}
              {systemUsers.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 space-y-2 max-h-40 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    📋 System User IDs Reference
                  </div>
                  <div className="space-y-1.5">
                    {systemUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between text-[11px] p-1.5 bg-slate-900/90 rounded-lg border border-slate-800">
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-slate-200">{u.name}</span>{' '}
                          <span className="text-slate-400">({u.role})</span>
                          <div className="text-[10px] font-mono text-indigo-400 truncate">{u.id}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMemberUserId(u.id)}
                          className="shrink-0 px-2 py-1 text-[10px] font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md transition-all"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={memberSubmitting || !memberUserId.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {memberSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Add Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

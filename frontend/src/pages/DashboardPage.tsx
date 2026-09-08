import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { apiClient } from '../api/client';
import { Project, Task } from '../types';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          apiClient.get('/projects?limit=5'),
          apiClient.get('/tasks?limit=5&sortBy=createdAt&sortOrder=desc'),
        ]);

        setProjects(projectsRes.data.data);
        setTasks(tasksRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;

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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here is an overview of your active collaborative projects and tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Link>
          )}

          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 rounded-xl transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Projects</div>
            <div className="text-2xl font-bold text-white mt-2">{loading ? '-' : totalProjects}</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FolderKanban className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Total Tasks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</div>
            <div className="text-2xl font-bold text-white mt-2">{loading ? '-' : totalTasks}</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <CheckSquare className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Pending Tasks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Tasks</div>
            <div className="text-2xl font-bold text-amber-400 mt-2">{loading ? '-' : pendingTasks}</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Completed Tasks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Tasks</div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">{loading ? '-' : completedTasks}</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Tasks & Project Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks List (2 cols on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {loading ? (
              <div className="p-8 flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Loading tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No recent tasks found. Create your first task!
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-slate-800/40 transition-all flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-100 truncate">{task.title}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="text-indigo-400 font-medium">{task.project?.name || 'Project'}</span>
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

        {/* Project Summary Column (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Active Projects</h2>
            <Link
              to="/projects"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-8 flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                <span className="text-xs">Loading projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No active projects found.
              </div>
            ) : (
              projects.map((proj) => (
                <div key={proj.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <Link to={`/projects/${proj.id}`} className="font-semibold text-sm text-slate-100 hover:text-indigo-400 transition-colors">
                      {proj.name}
                    </Link>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Created by <span className="text-slate-300">{proj.createdBy?.name || 'Manager'}</span>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg font-medium">
                      {proj._count?.tasks || 0} tasks
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

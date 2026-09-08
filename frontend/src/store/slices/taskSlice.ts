import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, Pagination, TaskStatus, TaskPriority } from '../../types';
import { apiClient } from '../../api/client';

interface TaskFilters {
  search?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  projectId?: string;
  assignedToId?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface TaskState {
  tasks: Task[];
  pagination: Pagination | null;
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  pagination: null,
  filters: {
    search: '',
    status: '',
    priority: '',
    projectId: '',
    assignedToId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      priority?: string;
      projectId?: string;
      assignedToId?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      // Filter out empty string query params
      const cleanParams: any = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanParams[key] = value;
        }
      });

      const response = await apiClient.get('/tasks', { params: cleanParams });
      return {
        tasks: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch tasks.');
    }
  }
);

export const createNewTask = createAsyncThunk(
  'task/createNewTask',
  async (
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string | null;
      projectId: string;
      assignedToId?: string | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post('/tasks', data);
      return response.data.data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to create task.');
    }
  }
);

export const updateExistingTask = createAsyncThunk(
  'task/updateExistingTask',
  async (
    {
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        dueDate?: string | null;
        assignedToId?: string | null;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.patch(`/tasks/${id}`, data);
      return response.data.data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update task.');
    }
  }
);

export const deleteTaskById = createAsyncThunk(
  'task/deleteTaskById',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to delete task.');
    }
  }
);

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTaskFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetTaskFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action: PayloadAction<{ tasks: Task[]; pagination: Pagination }>) => {
      state.tasks = action.payload.tasks;
      state.pagination = action.payload.pagination;
      state.loading = false;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createNewTask.fulfilled, (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    });

    builder.addCase(updateExistingTask.fulfilled, (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });

    builder.addCase(deleteTaskById.fulfilled, (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    });
  },
});

export const { setTaskFilters, resetTaskFilters, clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, Pagination } from '../../types';
import { apiClient } from '../../api/client';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  pagination: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (
    params: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.get('/projects', { params });
      return {
        projects: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch projects.');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'project/fetchProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data.data.project;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch project details.');
    }
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (data: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/projects', data);
      return response.data.data.project;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to create project.');
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ id, data }: { id: string; data: { name?: string; description?: string } }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/projects/${id}`, data);
      return response.data.data.project;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update project.');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/projects/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to delete project.');
    }
  }
);

export const addProjectMember = createAsyncThunk(
  'project/addProjectMember',
  async ({ projectId, userId }: { projectId: string; userId: string }, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.post(`/projects/${projectId}/members`, { userId });
      dispatch(fetchProjectById(projectId));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to add project member.');
    }
  }
);

export const removeProjectMember = createAsyncThunk(
  'project/removeProjectMember',
  async ({ projectId, userId }: { projectId: string; userId: string }, { rejectWithValue, dispatch }) => {
    try {
      await apiClient.delete(`/projects/${projectId}/members/${userId}`);
      dispatch(fetchProjectById(projectId));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to remove project member.');
    }
  }
);

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action: PayloadAction<{ projects: Project[]; pagination: Pagination }>) => {
      state.projects = action.payload.projects;
      state.pagination = action.payload.pagination;
      state.loading = false;
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchProjectById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchProjectById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload);
    });

    builder.addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    });
  },
});

export const { clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;

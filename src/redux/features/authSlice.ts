import type { User, UserCreate, SongInfo } from "@/@types";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  likedSongs: SongInfo[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  likedSongs: [],
  status: "idle",
  error: null,
};

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/users/me");
    return response.data as User;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || "Could not fetch user profile");
  }
});

export const fetchMyLikes = createAsyncThunk("auth/fetchMyLikes", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/users/me/likes");
    return response.data as SongInfo[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || "Could not fetch liked songs");
  }
});

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (loginData: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", loginData.email);
      formData.append("password", loginData.password);
      const response = await api.post("/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      dispatch(fetchMe());
      dispatch(fetchMyLikes());
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Login failed");
    }
  }
);

export const signupUser = createAsyncThunk("auth/signupUser", async (signupData: UserCreate, { rejectWithValue }) => {
  try {
    const response = await api.post("/signup", signupData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || "Signup failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.likedSongs = [];
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.access_token;
        localStorage.setItem("token", action.payload.access_token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      })

      .addCase(fetchMyLikes.fulfilled, (state, action: PayloadAction<SongInfo[]>) => {
        state.likedSongs = action.payload;
      });
  },
});

export const dislikeSong = createAsyncThunk(
  "auth/dislikeSong",
  async (trackName: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/recommend/like/${trackName}`);

      dispatch(fetchMyLikes());
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Could not unlike song");
    }
  }
);

export const { logout } = authSlice.actions;
export default authSlice.reducer;

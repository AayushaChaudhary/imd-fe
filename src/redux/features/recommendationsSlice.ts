import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../lib/api";
import type { RecommendedSong } from "@/@types";

type Song = RecommendedSong;

interface AudioFeatures {
  tempo: number;
  spectral_centroid: number;
  rms_energy: number;
  chroma: number[];
  mfccs: number[];
}

interface RecommendationsState {
  songs: Song[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  queryFileName: string | null;
  queryAudioFeatures: AudioFeatures | null;
  likeStatus: "idle" | "loading";
}

const initialState: RecommendationsState = {
  songs: [],
  status: "idle",
  error: null,
  queryFileName: null,
  queryAudioFeatures: null,
  likeStatus: "idle",
};

export const fetchRecsBySongName = createAsyncThunk(
  "recommendations/fetchBySongName",
  async (songName: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/recommend/metadata`, { song_name: songName });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch recommendations");
    }
  }
);

export const fetchRecsByAudio = createAsyncThunk(
  "recommendations/fetchByAudio",
  async (file: File, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post(`/recommend/audio`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to process audio file");
    }
  }
);

export const fetchRecsForUser = createAsyncThunk(
  "recommendations/fetchForUser",
  async (args: { numRecommendations?: number } = {}, { rejectWithValue }) => {
    const { numRecommendations = 10 } = args;
    try {
      const formData = new FormData();
      formData.append("num_recommendations", String(numRecommendations));
      const response = await api.post(`/recommend/for-me`, formData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to get 'For You' recommendations");
    }
  }
);

export const likeSong = createAsyncThunk("recommendations/likeSong", async (trackName: string, { rejectWithValue }) => {
  try {
    const response = await api.post(`/recommend/like/${trackName}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || "Could not like song");
  }
});

const recommendationsSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.songs = [];
      state.status = "idle";
      state.error = null;
      state.queryFileName = null;
      state.queryAudioFeatures = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchRecsBySongName.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.queryFileName = null;
        state.queryAudioFeatures = null;
      })
      .addCase(fetchRecsBySongName.fulfilled, (state, action: PayloadAction<{ recommendations: Song[] }>) => {
        state.status = "succeeded";
        state.songs = action.payload.recommendations;
      })
      .addCase(fetchRecsBySongName.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(fetchRecsByAudio.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.queryFileName = (action.meta.arg as File).name;
        state.queryAudioFeatures = null;
      })
      .addCase(
        fetchRecsByAudio.fulfilled,
        (state, action: PayloadAction<{ recommendations: Song[]; query_audio_features: AudioFeatures }>) => {
          state.status = "succeeded";
          state.songs = action.payload.recommendations;
          state.queryAudioFeatures = action.payload.query_audio_features;
        }
      )
      .addCase(fetchRecsByAudio.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(likeSong.pending, (state) => {
        state.likeStatus = "loading";
      })
      .addCase(likeSong.fulfilled, (state) => {
        state.likeStatus = "idle";
      })
      .addCase(likeSong.rejected, (state) => {
        state.likeStatus = "idle";
      })

      .addCase(fetchRecsForUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.queryFileName = null;
        state.queryAudioFeatures = null;
      })
      .addCase(fetchRecsForUser.fulfilled, (state, action: PayloadAction<{ recommendations: Song[] }>) => {
        state.status = "succeeded";
        state.songs = action.payload.recommendations;
      })
      .addCase(fetchRecsForUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearRecommendations } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;

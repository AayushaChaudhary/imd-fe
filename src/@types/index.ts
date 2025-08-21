export interface SongInfo {
  track_name: string;
  artist_name: string;
}

export interface RecommendedSong extends SongInfo {
  rank: number;

  similarity_score?: number | null;

  genre?: string;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
}

export interface UserCreate {
  email: string;
  password: string;
}

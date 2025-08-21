import type { SongInfo } from "@/@types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Heart, LogOut, Music, Search, Sparkles, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { logout } from "../redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useDebounce } from "../hooks/useDebounce";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { LikedSongListItem } from "./likedSongListItem";
import { AuthModal } from "./authModal";

interface LibrarySidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSongSelect: (songName: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function useFilteredSongs(songs: SongInfo[], searchQuery: string) {
  const debouncedQuery = useDebounce(searchQuery, 300);

  return useMemo(() => {
    if (!debouncedQuery.trim()) return songs;
    const query = debouncedQuery.toLowerCase();
    return songs.filter(
      (song) => song.track_name.toLowerCase().includes(query) || song.artist_name.toLowerCase().includes(query)
    );
  }, [songs, debouncedQuery]);
}

export function LibrarySidebar({ searchQuery, setSearchQuery, onSongSelect }: LibrarySidebarProps) {
  const dispatch = useAppDispatch();
  const { token, likedSongs } = useAppSelector((state) => state.auth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const {
    data: songList = [],
    isLoading: songsLoading,
    error: songsError,
  } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/songs`)).data,
    staleTime: 30 * 60 * 1000,
  });

  const filteredLibrarySongs = useFilteredSongs(songList, searchQuery);

  const handleLogout = () => dispatch(logout());

  return (
    <>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      <div className="bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
        {/* TOP NON-SCROLLING PART */}
        <div className="flex-shrink-0">
          <div className="flex justify-between items-center p-3">
            <div className="flex gap-2 items-center">
              <Sparkles className="size-4 text-green-500" />
              <h1 className="text-xs font-semibold text-gray-900">Intelligent Music Discovery</h1>
            </div>
            <div className="flex items-center">
              {token ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                      <User className="size-4 flex-shrink-0 text-green-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0" onClick={() => setIsAuthModalOpen(true)}>
                  <User className="size-4 flex-shrink-0" />
                </Button>
              )}
            </div>
          </div>
          <Separator className="bg-gray-200" />
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-7 bg-white border-gray-200"
                placeholder="Filter library..."
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {token && likedSongs.length > 0 && (
            <div className="flex-shrink-0 p-2 pt-0">
              <h2 className="font-semibold text-xs mb-2 text-gray-600 flex items-center gap-1.5">
                <Heart className="size-3 text-pink-500" />
                LIKED SONGS ({likedSongs.length})
              </h2>

              <ScrollArea className="h-auto max-h-48 overflow-y-auto">
                <div className="space-y-2 pr-2">
                  {likedSongs.map((song) => (
                    <LikedSongListItem key={`liked-${song.track_name}`} song={song} onSongSelect={onSongSelect} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          <div className="flex-1 min-h-0 p-2 pt-0 overflow-y-hidden">
            <h2 className="font-semibold text-xs my-2 text-gray-600">
              FULL LIBRARY ({filteredLibrarySongs.length.toLocaleString()})
            </h2>

            <ScrollArea className="h-full">
              <div className="space-y-2 pr-2">
                {songsLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center p-2 rounded-lg">
                      <Skeleton className="w-full h-10" />
                    </div>
                  ))
                ) : songsError ? (
                  <div className="text-center py-6">
                    <p className="text-red-500 text-xs">Error loading songs</p>
                  </div>
                ) : (
                  filteredLibrarySongs.map((song) => (
                    <div
                      key={song.track_name}
                      onClick={() => onSongSelect(song.track_name)}
                      className="flex items-center p-2 rounded-lg border hover:bg-green-50 cursor-pointer group"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded mr-2 flex-shrink-0 flex items-center justify-center">
                        <Music className="h-3 w-3 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs group-hover:text-green-600 truncate max-w-[20ch]">
                          {song.track_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{song.artist_name}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );
}

import type { RecommendedSong, SongInfo } from "@/@types";
import { Heart, Music, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { fetchMyLikes } from "../redux/features/authSlice";
import { likeSong } from "../redux/features/recommendationsSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SongListItemProps {
  song: RecommendedSong;
  onYouTubeSearch: (song: SongInfo) => void;
}

export function SongListItem({ song, onYouTubeSearch }: SongListItemProps) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { likeStatus } = useAppSelector((state) => state.recommendations);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent onClick events
    if (!token || isLiking || likeStatus === "loading") return;

    setIsLiking(true);

    try {
      // .unwrap() ensures that if the 'likeSong' thunk fails, it throws an error
      await dispatch(likeSong(song.track_name)).unwrap();

      dispatch(fetchMyLikes());

      toast.success(`'${song.track_name}' added to your likes!`);
    } catch (error: any) {
      toast.error(error || "Could not like song.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-[#1db954]/30 hover:bg-white group transition-all">
      <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center relative flex-shrink-0">
        <Music className="h-3 w-3 text-gray-500" />
        <div className="absolute -top-1 -left-1 bg-[#1db954] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
          {song.rank}
        </div>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="font-medium text-gray-900 truncate text-xs group-hover:text-[#1db954] transition-colors max-w-[15ch]">
          {song.track_name}
        </p>
        <p className="text-xs text-gray-500 truncate">{song.artist_name}</p>

        {song.similarity_score && (
          <div className="flex gap-2 items-center mt-1">
            <Badge className="bg-[#1db954]/10 text-[#1db954] border border-transparent hover:bg-[#1db954]/20 text-xs">
              {(song.similarity_score * 100).toFixed(0)}% match
            </Badge>

            <TooltipProvider>
              <div className="flex items-center gap-1.5 ml-auto">
                {/* Like Button (Conditional) */}
                {token && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleLike}
                        disabled={isLiking || likeStatus === "loading"}
                        className="transition-opacity h-6 w-6 p-0 rounded-full cursor-pointer flex-shrink-0 hover:bg-pink-100 disabled:opacity-50"
                      >
                        <Heart className="h-3 w-3 text-pink-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Like this song</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* YouTube Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onYouTubeSearch(song);
                      }}
                      className="transition-opacity bg-red-600 hover:bg-red-700 h-6 w-6 p-0 rounded-full cursor-pointer flex-shrink-0"
                    >
                      <Play className="h-3 w-3 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search on YouTube</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}

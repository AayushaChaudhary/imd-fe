import type { SongInfo } from "@/@types";
import { Music, X } from "lucide-react";
import { toast } from "sonner";
import { dislikeSong } from "../redux/features/authSlice";
import { useAppDispatch } from "../redux/hooks";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface LikedSongListItemProps {
  song: SongInfo;
  onSongSelect: (songName: string) => void;
}

export function LikedSongListItem({ song, onSongSelect }: LikedSongListItemProps) {
  const dispatch = useAppDispatch();

  const handleDislike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dispatch(dislikeSong(song.track_name)).unwrap();
      toast.success(`'${song.track_name}' removed from your likes.`);
    } catch (error: any) {
      toast.error(error || "Failed to remove like.");
    }
  };

  return (
    <div
      onClick={() => onSongSelect(song.track_name)}
      className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 cursor-pointer group transition-all"
    >
      <div className="w-8 h-8 bg-gray-200 rounded mr-2 flex items-center justify-center flex-shrink-0">
        <Music className="h-3 w-3 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="font-medium text-gray-900 text-xs group-hover:text-pink-600 transition-colors leading-tight mb-0.5 truncate">
          {song.track_name}
        </p>
        <p className="text-xs text-gray-500 truncate leading-tight">{song.artist_name}</p>
      </div>

      {/* Dislike Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDislike}
              className="ml-auto h-6 w-6 p-0 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
            >
              <X className="h-3 w-3 text-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove from likes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

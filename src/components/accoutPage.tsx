import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ArrowLeft, LogOut, Music, Sparkles, User, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Link } from "react-router";
import { dislikeSong, logout } from "@/redux/features/authSlice";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";

export function AccountPage() {
  const dispatch = useAppDispatch();
  const { user, likedSongs } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleDislike = async (trackName: string) => {
    try {
      await dispatch(dislikeSong(trackName)).unwrap();
      toast.success(`'${trackName}' removed from your likes.`);
    } catch (error: any) {
      toast.error(error || "Failed to remove like.");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- NEW HEADER SECTION --- */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center p-3 max-w-7xl mx-auto">
          <div className="flex gap-4 items-center">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex gap-2 items-center">
              <Sparkles className="size-4 text-green-500" />
              <h1 className="text-xs font-semibold text-gray-900">Intelligent Music Discovery</h1>
            </div>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <User className="size-4 flex-shrink-0 text-green-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="p-2 text-xs text-center text-gray-500 border-b">
                  Signed in as <span className="font-medium text-gray-800">{user.email}</span>
                </div>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT SECTION --- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="text-green-500" />
              My Account
            </CardTitle>
            <CardDescription>View your profile details and manage your liked songs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-800">Email Address</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-gray-800">Liked Songs ({likedSongs.length})</h3>
                <ScrollArea className="h-96 mt-2 border rounded-md p-2 bg-white">
                  <div className="space-y-2">
                    {likedSongs.length > 0 ? (
                      likedSongs.map((song) => (
                        <div
                          key={`${song.track_name}-${song.artist_name}`}
                          className="flex items-center gap-3 p-2 rounded-md bg-gray-50 group"
                        >
                          <Music className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{song.track_name}</p>
                            <p className="text-xs text-gray-500 truncate">{song.artist_name}</p>
                          </div>
                          {/* --- NEW DISLIKE BUTTON --- */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDislike(song.track_name)}
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
                      ))
                    ) : (
                      <p className="text-center text-sm text-gray-500 py-4">No liked songs yet.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Archive,
  MessageSquare,
  MoreVertical,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
};

interface ChatHistoryProps {
  onSelectSession: (messages: Message[]) => void;
  currentMessages: Message[];
  className?: string;
}

export function ChatHistory({
  onSelectSession,
  currentMessages,
  className,
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("openai-chat-sessions");
    if (savedSessions) {
      try {
        // Parse the saved sessions string and convert date strings back to Date objects
        const parsedSessions = JSON.parse(savedSessions).map(
          (session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
          })
        );
        setSessions(parsedSessions);
      } catch (error) {
        console.error("Failed to parse saved sessions:", error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("openai-chat-sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  const saveCurrentSession = () => {
    // Filter out system messages for the title generation
    const userMessages = currentMessages.filter((m) => m.role === "user");

    if (userMessages.length === 0) {
      return; // Don't save empty sessions
    }

    // Create a title from the first user message
    const title =
      userMessages[0].content.slice(0, 30) +
      (userMessages[0].content.length > 30 ? "..." : "");

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title,
      createdAt: new Date(),
      messages: currentMessages,
    };

    setSessions((prev) => [newSession, ...prev]);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
    setIsDeleteDialogOpen(false);
  };

  const confirmDelete = (id: string) => {
    setSelectedSessionId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectSession = (session: ChatSession) => {
    onSelectSession(session.messages);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Chat History</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={saveCurrentSession}
          disabled={
            currentMessages.filter((m) => m.role === "user").length === 0
          }
        >
          <Save className="h-4 w-4 mr-2" />
          Save Current Chat
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="p-6 text-center">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No saved chats yet. Have a conversation and save it to see it
              here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="hover:bg-accent/10 transition-colors"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 justify-start font-medium text-left"
                      onClick={() => handleSelectSession(session)}
                    >
                      <span className="truncate max-w-[200px]">
                        {session.title}
                      </span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleSelectSession(session)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Load chat
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(session.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(session.createdAt)}
                  </p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {session.messages.filter((m) => m.role !== "system").length}{" "}
                    messages
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedSessionId && deleteSession(selectedSessionId)
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface UserAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fallback?: string;
}

export function UserAvatar({
  className,
  size = "md",
  fallback,
}: UserAvatarProps) {
  const { user, isLoaded } = useUser();

  // Set size in pixels based on the size prop
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  // Generate user initials for the fallback
  const getUserInitials = () => {
    if (!isLoaded || !user) return fallback || "?";

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    } else if (firstName) {
      return firstName.charAt(0);
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    } else {
      return "U";
    }
  };

  return (
    <Avatar className={cn(sizeMap[size], "border", className)}>
      <AvatarImage
        src={isLoaded ? user?.imageUrl : undefined}
        alt={
          isLoaded
            ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
              "User avatar"
            : "Loading"
        }
      />
      <AvatarFallback className="font-medium">
        {getUserInitials()}
      </AvatarFallback>
    </Avatar>
  );
}

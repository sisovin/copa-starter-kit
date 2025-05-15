"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { useFileManager } from "@/hooks/use-convex";
import {
  File,
  FileArchive,
  FileCode,
  FilePlus,
  FileText,
  FolderPlus,
  Image,
  MoreVertical,
  Music,
  Pencil,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import * as React from "react";

export function FileManager({
  onSelect,
  multiple = false,
  showUploadButton = true,
  title = "File Manager",
  description = "Upload and manage your files",
  acceptTypes,
}: {
  onSelect?: (fileIds: Id<"fileUploads"> | Id<"fileUploads">[]) => void;
  multiple?: boolean;
  showUploadButton?: boolean;
  title?: string;
  description?: string;
  acceptTypes?: string;
}) {
  const { toast } = useToast();
  const {
    files,
    folders,
    hasMore,
    loadMore,
    loading,
    uploadFile,
    updateFile,
    deleteFile,
    createFolder,
  } = useFileManager();

  // State for file selection
  const [selectedFiles, setSelectedFiles] = React.useState<Id<"fileUploads">[]>(
    []
  );

  // State for file upload dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  // State for new folder dialog
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] =
    React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");

  // State for edit file dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [fileToEdit, setFileToEdit] = React.useState<any>(null);
  const [editedTitle, setEditedTitle] = React.useState("");
  const [editedAlt, setEditedAlt] = React.useState("");

  // Handler for file selection
  const handleFileSelect = (fileId: Id<"fileUploads">) => {
    if (multiple) {
      setSelectedFiles((prev) => {
        if (prev.includes(fileId)) {
          return prev.filter((id) => id !== fileId);
        } else {
          return [...prev, fileId];
        }
      });
    } else {
      if (onSelect) {
        onSelect(fileId);
      }
    }
  };

  // Handler for confirming selected files
  const handleConfirmSelection = () => {
    if (onSelect && selectedFiles.length > 0) {
      onSelect(multiple ? selectedFiles : selectedFiles[0]);
    }
  };

  // Handler for file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Set progress
        setUploadProgress(Math.round((i / files.length) * 100));

        await uploadFile(file);
      }

      setIsUploadDialogOpen(false);
      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${files.length} file(s)`,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handler for creating a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for the folder.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFolder({
        name: newFolderName.trim(),
      });

      setIsNewFolderDialogOpen(false);
      setNewFolderName("");

      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" has been created.`,
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error creating folder",
        description: "There was an error creating the folder.",
        variant: "destructive",
      });
    }
  };

  // Handler for edit file
  const handleEditFile = (file: any) => {
    setFileToEdit(file);
    setEditedTitle(file.title || file.filename);
    setEditedAlt(file.alt || "");
    setIsEditDialogOpen(true);
  };

  // Handler for saving file edits
  const handleSaveFileEdit = async () => {
    if (!fileToEdit) return;

    try {
      await updateFile({
        id: fileToEdit._id,
        metadata: {
          title: editedTitle,
          alt: editedAlt,
        },
      });

      setIsEditDialogOpen(false);
      toast({
        title: "File updated",
        description: "File information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating file:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the file.",
        variant: "destructive",
      });
    }
  };

  // Handler for deleting a file
  const handleDeleteFile = async (fileId: Id<"fileUploads">) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteFile({ id: fileId });
      toast({
        title: "File deleted",
        description: "The file has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Deletion failed",
        description:
          "There was an error deleting the file. It might be in use.",
        variant: "destructive",
      });
    }
  };

  // Function to get icon based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (mimeType.startsWith("text/")) return <FileText className="h-5 w-5" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-5 w-5" />;
    if (mimeType.startsWith("video/")) return <Video className="h-5 w-5" />;
    if (
      mimeType.includes("javascript") ||
      mimeType.includes("json") ||
      mimeType.includes("html")
    ) {
      return <FileCode className="h-5 w-5" />;
    }
    if (
      mimeType.includes("zip") ||
      mimeType.includes("compressed") ||
      mimeType.includes("archive")
    ) {
      return <FileArchive className="h-5 w-5" />;
    }
    return <FilePlus className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Toolbar */}
        <div className="mb-4 flex justify-between">
          <div className="flex gap-2">
            {showUploadButton && (
              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                      Select files from your device to upload.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="files">Files</Label>
                      <Input
                        id="files"
                        type="file"
                        accept={acceptTypes}
                        disabled={isUploading}
                        multiple
                        onChange={handleFileUpload}
                      />
                      {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Dialog
              open={isNewFolderDialogOpen}
              onOpenChange={setIsNewFolderDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                    Enter a name for the new folder.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="My Folder"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsNewFolderDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {multiple && onSelect && (
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedFiles.length === 0}
            >
              Select ({selectedFiles.length})
            </Button>
          )}
        </div>

        {/* Folders */}
        {folders && folders.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Folders</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder._id}
                  className="border rounded-md p-4 flex flex-col items-center cursor-pointer hover:bg-gray-50"
                >
                  <File className="h-8 w-8 mb-2" />
                  <span className="text-sm text-center truncate w-full">
                    {folder.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <h3 className="text-sm font-medium mb-2">Files</h3>
          {loading ? (
            <div className="text-center py-8">Loading files...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No files found. Upload some files to get started.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file._id}
                  className={`border rounded-md overflow-hidden flex flex-col ${
                    selectedFiles.includes(file._id)
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => handleFileSelect(file._id)}
                >
                  {/* Preview */}
                  <div className="aspect-square bg-gray-100 relative">
                    {file.mimeType.startsWith("image/") ? (
                      <img
                        src={file.url}
                        alt={file.alt || file.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}

                    {/* Select indicator for multiple selection */}
                    {multiple && (
                      <div
                        className={`absolute top-2 right-2 w-5 h-5 rounded-full border ${
                          selectedFiles.includes(file._id)
                            ? "bg-blue-500 border-blue-500"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {selectedFiles.includes(file._id) && (
                          <X className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2 flex justify-between items-center bg-white">
                    <div className="truncate flex-1">
                      <p className="text-sm font-medium truncate">
                        {file.title || file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFile(file);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file._id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit file dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File</DialogTitle>
            <DialogDescription>Update file information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file-title">Title</Label>
              <Input
                id="file-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>

            {fileToEdit?.mimeType.startsWith("image/") && (
              <div className="grid gap-2">
                <Label htmlFor="file-alt">Alt Text</Label>
                <Input
                  id="file-alt"
                  value={editedAlt}
                  onChange={(e) => setEditedAlt(e.target.value)}
                  placeholder="Description for accessibility"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFileEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

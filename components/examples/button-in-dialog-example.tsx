import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash, X } from "lucide-react";

export function ButtonInDialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" leftIcon={<Trash />}>
          Delete Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="ghost" leftIcon={<X />}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            leftIcon={<Trash />}
            isLoading={false}
            onClick={() => {
              // Simulate loading state
              const btn = document.activeElement as HTMLButtonElement;
              if (btn) {
                btn.classList.add("opacity-50", "pointer-events-none");
                const loader = document.createElement("span");
                loader.className =
                  "animate-spin mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full";
                btn.prepend(loader);
                btn.disabled = true;

                setTimeout(() => {
                  btn.classList.remove("opacity-50", "pointer-events-none");
                  if (loader.parentNode === btn) btn.removeChild(loader);
                  btn.disabled = false;
                }, 2000);
              }
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

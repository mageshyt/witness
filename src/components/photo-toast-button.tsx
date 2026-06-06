"use client";

import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export function PhotoToastButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-muted-foreground"
      onClick={() => toast.info("Photo upload coming soon")}>
      <Camera size={14} />
      Progress photo
    </Button>
  );
}

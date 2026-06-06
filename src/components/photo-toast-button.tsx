"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PhotoToastButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-muted-foreground"
      onClick={() => toast.info("Photo upload coming soon")}>
      📷 Progress photo
    </Button>
  );
}

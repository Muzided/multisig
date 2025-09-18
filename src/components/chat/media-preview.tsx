"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import type { Media } from "@/types/chat";

export default function MediaPreview({
  media,
  onRemove,
}: {
  media: Media;
  onRemove: () => void;
}) {
  return (
    <div className="mb-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
            <Paperclip className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {media.originalName || "Uploaded file"}
            </p>
            <p className="text-xs text-gray-500">{media.type || "File uploaded"}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 text-gray-500 hover:text-red-500">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

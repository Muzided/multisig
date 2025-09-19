"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";
import MediaPreview from "./media-preview";
import type { Media } from "@/types/chat";

export default function MessageInput({
  message,
  setMessage,
  media,
  setMedia,
  onFileChosen,
  onSend,
  sendDisabled,
}: {
  message: string;
  setMessage: (v: string) => void;
  media: Media | null;
  setMedia: (m: Media | null) => void;
  onFileChosen: (file: File) => Promise<void>;
  onSend: () => void;
  sendDisabled: boolean;
}) {
  return (
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
      {media && <MediaPreview media={media} onRemove={() => setMedia(null)} />}

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={media ? "Add a message (optional)..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
          className="flex-1"
        />

        <label className="cursor-pointer">
          <>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFileChosen(f).finally(() => (e.currentTarget.value = ""));
              }}
              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,image/*,application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain,.md,text/markdown,.csv,text/csv,.html,text/html,.htm,.xml,text/xml,application/rtf,.rtf,application/json,.json,application/xml,application/x-apple-pages,application/x-iwork-pages-sffpages"
            />
            <Button asChild variant="outline" size="icon">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Paperclip className="w-4 h-4" />
              </label>
            </Button>
          </>
        </label>

        <Button onClick={onSend} disabled={sendDisabled}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

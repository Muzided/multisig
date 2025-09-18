import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EmailRegistrationModal({
  open,
  onOpenChange,
  userEmail,
  setUserEmail,
  isUpdating,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userEmail: string;
  setUserEmail: (v: string) => void;
  isUpdating: boolean;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/80 border-zinc-800 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Email Registration Required</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-zinc-400">Please register your email address to continue creating an escrow.</p>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-[#BB7333] 
                transition-all duration-200 hover:border-[#BB7333]/50 focus:shadow-md"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={onSubmit}
              disabled={isUpdating || !userEmail}
              className="bg-gradient-to-r from-[#BB7333] to-[#965C29] text-white hover:from-[#965C29] hover:to-[#7A4A21]"
            >
              {isUpdating ? "Updating..." : "Register Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

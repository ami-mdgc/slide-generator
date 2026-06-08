import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface UserNameModalProps {
  open: boolean;
  onSave: (name: string) => void;
}

export function UserNameModal({ open, onSave }: UserNameModalProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>あなたの名前を入力してください</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：田中"
            className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            maxLength={20}
          />
          <Button type="submit" disabled={!name.trim()}>
            開始する
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

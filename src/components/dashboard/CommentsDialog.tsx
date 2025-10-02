import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const CommentsDialog = ({ open, onOpenChange, planId }: CommentsDialogProps) => {
  const [comments, setComments] = useState("");
  const [attachments, setAttachments] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Comentários e Anexos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="comments">Comentários</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="bg-muted/50 min-h-[100px]"
              placeholder="Adicione seus comentários aqui..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attachments">Anexos</Label>
            <Textarea
              id="attachments"
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
              className="bg-muted/50 min-h-[100px]"
              placeholder="Adicione informações sobre anexos..."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

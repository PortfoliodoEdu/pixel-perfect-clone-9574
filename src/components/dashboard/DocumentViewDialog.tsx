import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DocumentViewDialogProps {
  tipo: 'cnh' | 'selfie_rg';
  label: string;
  hasDocument: boolean;
  documentUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadClick: () => void;
}

export const DocumentViewDialog = ({ 
  tipo, 
  label, 
  hasDocument, 
  documentUrl,
  open,
  onOpenChange,
  onUploadClick 
}: DocumentViewDialogProps) => {
  return (
    <>
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-foreground/70" />
        <button
          type="button"
          onClick={onUploadClick}
          className={`text-sm underline transition-colors ${
            hasDocument
              ? 'text-green-600 hover:text-green-700'
              : 'text-red-600 hover:text-red-700'
          }`}
        >
          {label}
        </button>
        {hasDocument && documentUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(true)}
            className="h-8 px-2"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Visualizar {label}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-lg overflow-hidden">
            {documentUrl?.endsWith('.pdf') ? (
              <iframe
                src={documentUrl}
                className="w-full h-full"
                title={label}
              />
            ) : (
              <img
                src={documentUrl}
                alt={label}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

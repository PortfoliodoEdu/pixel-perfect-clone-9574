import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SecondChanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const SecondChanceDialog = ({ open, onOpenChange, planId }: SecondChanceDialogProps) => {
  const { toast } = useToast();

  const handleRequest = () => {
    toast({
      title: "Segunda chance solicitada",
      description: "Sua solicitação de segunda chance foi enviada.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Deseja solicitar a segunda chance no teste?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-center text-sm text-foreground/70">
            Caso solicite uma segunda chance e passe de fase, você deverá estar ciente que isso acarreta o reestabelecimento do primeiro teste.
          </p>
          <Button 
            onClick={handleRequest}
            className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white font-bold"
          >
            QUERO SOLICITAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

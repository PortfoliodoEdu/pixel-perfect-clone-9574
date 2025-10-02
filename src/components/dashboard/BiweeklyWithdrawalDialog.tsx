import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BiweeklyWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const BiweeklyWithdrawalDialog = ({ open, onOpenChange, planId }: BiweeklyWithdrawalDialogProps) => {
  const { toast } = useToast();

  const handleActivate = () => {
    toast({
      title: "Saque quinzenal ativado",
      description: "O saque quinzenal foi ativado com sucesso.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Deseja ativar o saque quinzenal?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-center text-foreground/70">
            Para ativar o saque quinzenal, há uma taxa única de R$ 237,00 por plano ativado.
          </p>
          <Button 
            onClick={handleActivate}
            className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white font-bold"
          >
            QUERO ATIVAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

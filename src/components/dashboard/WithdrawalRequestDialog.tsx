import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WithdrawalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const WithdrawalRequestDialog = ({ open, onOpenChange, planId }: WithdrawalRequestDialogProps) => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação de saque foi enviada com sucesso.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Solicitação de Saque</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor do saque</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-muted/50"
              />
            </div>
          </div>
          <p className="text-sm text-foreground/70">
            Ao solicitar o saque, você está de acordo com o regulamento e está ciente que o PIX irá ser enviado na chave CPF.
          </p>
          <Button 
            onClick={handleSubmit}
            className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white font-bold"
          >
            SOLICITAR SAQUE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

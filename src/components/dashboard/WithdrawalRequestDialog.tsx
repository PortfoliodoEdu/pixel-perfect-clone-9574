import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuditLogger } from "@/lib/auditLogger";

interface WithdrawalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const WithdrawalRequestDialog = ({ open, onOpenChange, planId }: WithdrawalRequestDialogProps) => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateInput = () => {
    if (!name.trim() || name.length > 100) {
      toast({
        title: "Erro de validação",
        description: "Nome inválido",
        variant: "destructive"
      });
      return false;
    }

    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(cpf.replace(/\D/g, ''))) {
      toast({
        title: "Erro de validação",
        description: "CPF inválido",
        variant: "destructive"
      });
      return false;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 1000000) {
      toast({
        title: "Erro de validação",
        description: "Valor inválido",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const sanitizedData = {
        user_id: user.id,
        plano_adquirido_id: planId,
        tipo_solicitacao: "saque",
        descricao: `Solicitação de saque - Nome: ${name.trim()}, CPF: ${cpf.replace(/\D/g, '')}, Valor: R$ ${parseFloat(amount).toFixed(2)}`,
        status: "pendente"
      };

      const { error } = await supabase
        .from("solicitacoes")
        .insert(sanitizedData);

      if (error) throw error;

      await AuditLogger.logWithdrawalRequest(parseFloat(amount));

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de saque foi enviada com sucesso.",
      });
      setName("");
      setCpf("");
      setAmount("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
            className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white font-bold"
          >
            {loading ? "Enviando..." : "SOLICITAR SAQUE"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

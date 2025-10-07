import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface BiweeklyWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const BiweeklyWithdrawalDialog = ({ open, onOpenChange, planId }: BiweeklyWithdrawalDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const sanitizedData = {
        user_id: user.id,
        plano_adquirido_id: planId,
        tipo_solicitacao: "saque_quinzenal",
        descricao: "Solicitação para ativar saque quinzenal (taxa de R$ 237,00)",
        status: "pendente"
      };

      const { error } = await supabase
        .from("solicitacoes")
        .insert(sanitizedData);

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de saque quinzenal foi enviada com sucesso.",
      });
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
            disabled={loading}
            className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white font-bold"
          >
            {loading ? "Enviando..." : "QUERO ATIVAR"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuditLogger } from "@/lib/auditLogger";

interface BiweeklyWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const BiweeklyWithdrawalDialog = ({
  open,
  onOpenChange,
  planId,
}: BiweeklyWithdrawalDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: solicitacao, error } = await supabase
        .from("solicitacoes")
        .insert({
          user_id: user.id,
          plano_adquirido_id: planId,
          tipo_solicitacao: "saque_quinzenal",
          descricao: "Solicitação de ativação de saque quinzenal",
        })
        .select()
        .single();

      if (error) throw error;

      // Criar entrada automática na linha do tempo
      const { error: historicoError } = await supabase
        .from("historico_observacoes")
        .insert({
          plano_adquirido_id: planId,
          solicitacao_id: solicitacao.id,
          tipo_evento: "saque_quinzenal",
          observacao: "Solicitação de ativação de saque quinzenal",
          status_evento: "pendente",
        });

      if (historicoError) throw historicoError;

      await AuditLogger.logBiweeklyWithdrawalRequest();
      toast.success("Solicitação enviada com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao enviar solicitação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white p-12">
        <div className="flex flex-col items-center text-center space-y-8">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-4xl font-bold text-foreground leading-tight">
              Deseja ativar o saque quinzenal?
            </DialogTitle>
          </DialogHeader>

          <p className="text-foreground/80 text-lg max-w-md">
            Para ativar o saque quinzenal, há uma taxa única de R$ 237,00 por plano ativado.
          </p>

          <Button
            onClick={handleActivate}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xl px-16 py-7 rounded-xl uppercase"
          >
            {loading ? "PROCESSANDO..." : "QUERO ATIVAR"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

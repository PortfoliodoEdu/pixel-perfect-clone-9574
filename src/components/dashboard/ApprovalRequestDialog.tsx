import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

interface ApprovalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planoId: string;
}

export const ApprovalRequestDialog = ({
  open,
  onOpenChange,
  planoId,
}: ApprovalRequestDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("solicitacoes").insert({
        user_id: user.id,
        plano_adquirido_id: planoId,
        tipo_solicitacao: "aprovacao_teste",
        descricao: "Solicitação de aprovação no teste",
      });

      if (error) throw error;

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
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col items-center text-center space-y-8">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-4xl font-bold text-foreground leading-tight">
              Deseja solicitar a aprovação no seu teste?
            </DialogTitle>
          </DialogHeader>

          <p className="text-foreground/80 text-lg max-w-md">
            Caso tenha batido a meta, solicite a análise clicando no botão abaixo.
          </p>

          <Button
            onClick={handleRequest}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xl px-16 py-7 rounded-xl uppercase"
          >
            {loading ? "PROCESSANDO..." : "SOLICITAR APROVAÇÃO"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

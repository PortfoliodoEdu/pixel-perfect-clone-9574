import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface SecondChanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

export const SecondChanceDialog = ({ open, onOpenChange, planId }: SecondChanceDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("solicitacoes")
        .insert({
          user_id: user.id,
          plano_adquirido_id: planId,
          tipo_solicitacao: "segunda_chance",
          descricao: "Solicitação de segunda chance no teste",
          status: "pendente"
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de segunda chance foi enviada com sucesso.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
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
            disabled={loading}
            className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white font-bold"
          >
            {loading ? "Enviando..." : "QUERO SOLICITAR"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

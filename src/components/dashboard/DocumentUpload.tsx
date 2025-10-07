import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentUploadProps {
  userId: string;
  onUploadComplete: () => void;
}

type DocumentType = "cnh" | "rg" | "cpf" | "selfie_rg";

interface UploadedDocument {
  tipo: DocumentType;
  status: "pendente" | "aprovado" | "rejeitado";
  url?: string;
}

export const DocumentUpload = ({ userId, onUploadComplete }: DocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const documentLabels: Record<DocumentType, string> = {
    cnh: "CNH, RG ou CPF",
    rg: "RG",
    cpf: "CPF",
    selfie_rg: "Selfie segurando seu RG",
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG, WEBP ou PDF");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Tamanho máximo: 10MB");
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${tipo}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("documentos")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from("user_documents")
        .insert({
          user_id: userId,
          tipo_documento: tipo,
          arquivo_url: publicUrl,
          status: "pendente",
        });

      if (dbError) throw dbError;

      setDocuments((prev) => [
        ...prev.filter((d) => d.tipo !== tipo),
        { tipo, status: "pendente", url: publicUrl },
      ]);

      toast.success("Documento enviado com sucesso!");
      onUploadComplete();
    } catch (error: any) {
      toast.error("Erro ao enviar documento: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getDocumentStatus = (tipo: DocumentType) => {
    const doc = documents.find((d) => d.tipo === tipo);
    if (!doc) return null;

    const statusConfig = {
      pendente: { icon: AlertCircle, color: "text-orange-500", label: "Pendente" },
      aprovado: { icon: CheckCircle2, color: "text-green-500", label: "Aprovado" },
      rejeitado: { icon: X, color: "text-red-500", label: "Rejeitado" },
    };

    const config = statusConfig[doc.status];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm">{config.label}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-8 space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Documentos necessários</h3>
        <p className="text-foreground/70">
          Preencha todos os dados para que você não tenha nenhum problema ao solicitar um saque.
        </p>
      </div>

      <div className="space-y-4">
        {/* CNH/RG/CPF Upload */}
        <div className="space-y-2">
          <Label className="text-base font-normal flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Anexar CNH, RG ou CPF
          </Label>
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleFileUpload(e, "cnh")}
                disabled={uploading}
              />
              <div className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload (JPG, PNG ou PDF)
                </p>
              </div>
            </label>
            {getDocumentStatus("cnh")}
          </div>
        </div>

        {/* Selfie Upload */}
        <div className="space-y-2">
          <Label className="text-base font-normal flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Anexar Selfie segurando seu RG
          </Label>
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => handleFileUpload(e, "selfie_rg")}
                disabled={uploading}
              />
              <div className="border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload (JPG, PNG ou WEBP)
                </p>
              </div>
            </label>
            {getDocumentStatus("selfie_rg")}
          </div>
        </div>
      </div>
    </div>
  );
};

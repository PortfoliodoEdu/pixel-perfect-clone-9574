import { useState, useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfilePictureUploadProps {
  userId: string;
  currentPhotoUrl?: string;
  userName: string;
  onUploadComplete: (url: string) => void;
}

export const ProfilePictureUpload = ({
  userId,
  currentPhotoUrl,
  userName,
  onUploadComplete,
}: ProfilePictureUploadProps) => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Tamanho máximo: 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview || !fileInputRef.current?.files?.[0]) return;

    setUploading(true);

    try {
      const file = fileInputRef.current.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/profile_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("fotos-perfil")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("fotos-perfil")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ foto_perfil: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Foto de perfil atualizada!");
      onUploadComplete(publicUrl);
      setOpen(false);
      setPreview(null);
    } catch (error: any) {
      toast.error("Erro ao atualizar foto: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <Avatar className="w-40 h-40 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {currentPhotoUrl ? (
            <AvatarImage src={currentPhotoUrl} />
          ) : (
            <AvatarFallback className="bg-muted text-4xl">
              {userName?.split(" ").map((n: string) => n[0]).join("").substring(0, 2) || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        <div
          className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-8 h-8 text-white" />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar foto de perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ajuste o tamanho e a posição da sua foto de perfil antes de confirmá-la.
            </p>
            {preview && (
              <div className="flex justify-center">
                <div className="relative w-64 h-64 rounded-full overflow-hidden bg-muted">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setPreview(null);
                }}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

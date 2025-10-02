import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: formData.nome,
          },
        },
      });

      if (error) throw error;
      
      toast.success("Cadastro realizado! Você já pode fazer login.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with gradient */}
      <header className="gradient-header px-8 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
            <span className="text-primary font-bold text-xl italic">pi</span>
          </div>
          <h1 className="text-white text-3xl font-light">
            prime<span className="font-light italic">capital</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white text-2xl font-bold">Painel do Trader</span>
          <button className="text-white flex items-center gap-2 text-sm hover:opacity-90 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o site
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl font-bold text-foreground mb-4">Cadastro</h2>
              <p className="text-foreground/80 text-lg">
                Preencha todos os dados para realizar o cadastro.
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Nome completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground text-base font-normal">
                  Nome completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="h-14 text-base border-input bg-muted/50"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-base font-normal">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-14 text-base border-input bg-muted/50"
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground text-base font-normal">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-14 text-base border-input bg-muted/50"
                />
              </div>

              {/* Buttons and agreement text */}
              <div className="flex items-center gap-6 pt-6">
                <Button
                  type="button"
                  onClick={() => navigate("/")}
                  disabled={loading}
                  className="bg-foreground hover:bg-foreground/90 text-white font-bold text-lg px-12 py-6 rounded-lg transition-all"
                >
                  CANCELAR
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-12 py-6 rounded-lg shadow-lg transition-all hover:shadow-xl"
                >
                  {loading ? "CADASTRANDO..." : "CADASTRAR"}
                </Button>
                <p className="text-foreground/70 text-sm flex-1">
                  Ao cadastrar, você está de acordo com o nosso regulamento atual.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;

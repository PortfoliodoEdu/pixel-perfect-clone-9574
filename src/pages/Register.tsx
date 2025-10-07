import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  telefone: z.string().trim().min(10, "Telefone deve ter no mínimo 10 dígitos").max(15),
  email: z.string().trim().email("Email inválido").max(255),
  cpf: z.string().trim().length(11, "CPF deve ter 11 dígitos"),
  ruaBairro: z.string().trim().min(1, "Rua e bairro são obrigatórios").max(200),
  numeroResidencial: z.string().trim().min(1, "Número é obrigatório").max(10),
  cep: z.string().trim().length(8, "CEP deve ter 8 dígitos"),
  cidade: z.string().trim().min(1, "Cidade é obrigatória").max(100),
  estado: z.string().trim().length(2, "Estado deve ter 2 letras").toUpperCase(),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    telefone: "",
    email: "",
    cpf: "",
    ruaBairro: "",
    numeroResidencial: "",
    cep: "",
    cidade: "",
    estado: "",
    password: "",
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      const validatedData = registerSchema.parse(formData);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: validatedData.nome,
          },
        },
      });

      if (error) throw error;
      
      // Update profile with additional data
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            data_nascimento: validatedData.dataNascimento,
            telefone: validatedData.telefone,
            cpf: validatedData.cpf,
            rua_bairro: validatedData.ruaBairro,
            numero_residencial: validatedData.numeroResidencial,
            cep: validatedData.cep,
            cidade: validatedData.cidade,
            estado: validatedData.estado,
          })
          .eq("id", data.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
      }
      
      toast.success("Cadastro realizado! Você já pode fazer login.");
      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Erro ao criar conta");
      }
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
              {/* Row 1: Nome completo + Data de nascimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento" className="text-foreground text-base font-normal">
                    Data de nascimento
                  </Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    required
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
              </div>

              {/* Row 2: Telefone + Email + CPF */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-foreground text-base font-normal">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value.replace(/\D/g, "") })}
                    className="h-14 text-base border-input bg-muted/50"
                    placeholder="11999999999"
                  />
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-foreground text-base font-normal">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    required
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, "") })}
                    className="h-14 text-base border-input bg-muted/50"
                    placeholder="12345678901"
                    maxLength={11}
                  />
                </div>
              </div>

              {/* Row 3: Rua e Bairro + Número */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ruaBairro" className="text-foreground text-base font-normal">
                    Rua e Bairro
                  </Label>
                  <Input
                    id="ruaBairro"
                    type="text"
                    required
                    value={formData.ruaBairro}
                    onChange={(e) => setFormData({ ...formData, ruaBairro: e.target.value })}
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroResidencial" className="text-foreground text-base font-normal">
                    Número residencial
                  </Label>
                  <Input
                    id="numeroResidencial"
                    type="text"
                    required
                    value={formData.numeroResidencial}
                    onChange={(e) => setFormData({ ...formData, numeroResidencial: e.target.value })}
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
              </div>

              {/* Row 4: CEP + Cidade + Estado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cep" className="text-foreground text-base font-normal">
                    CEP
                  </Label>
                  <Input
                    id="cep"
                    type="text"
                    required
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value.replace(/\D/g, "") })}
                    className="h-14 text-base border-input bg-muted/50"
                    placeholder="12345678"
                    maxLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-foreground text-base font-normal">
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    type="text"
                    required
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="h-14 text-base border-input bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-foreground text-base font-normal">
                    Estado
                  </Label>
                  <Input
                    id="estado"
                    type="text"
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    className="h-14 text-base border-input bg-muted/50"
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
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

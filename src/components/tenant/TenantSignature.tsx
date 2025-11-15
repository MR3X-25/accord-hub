import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PenTool, Shield, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TenantSignatureProps {
  onSign: () => void;
}

const TenantSignature = ({ onSign }: TenantSignatureProps) => {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (!fullName || !cpf) {
      toast({
        title: "Erro",
        description: "Preencha seu nome e CPF para continuar",
        variant: "destructive",
      });
      return;
    }

    setOtpSent(true);
    toast({
      title: "Código Enviado",
      description: "Verifique seu e-mail e SMS para o código de verificação",
    });
  };

  const handleSign = () => {
    if (!agreed) {
      toast({
        title: "Erro",
        description: "Você precisa concordar com os termos do acordo",
        variant: "destructive",
      });
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Erro",
        description: "Digite o código de verificação de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Acordo Assinado com Sucesso!",
      description: "Sua assinatura foi registrada com hash criptográfico",
    });
    onSign();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <PenTool className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Assinatura Eletrônica</h3>
          <p className="text-sm text-muted-foreground">Assine digitalmente este acordo de pagamento</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Nome Completo *</Label>
          <Input
            id="fullName"
            placeholder="Digite seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={otpSent}
          />
        </div>

        <div>
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            disabled={otpSent}
          />
        </div>

        {!otpSent && (
          <Button onClick={handleSendOtp} className="w-full gradient-primary">
            <Shield className="w-4 h-4 mr-2" />
            Enviar Código de Verificação
          </Button>
        )}

        {otpSent && (
          <>
            <div>
              <Label htmlFor="otpCode">Código de Verificação (6 dígitos) *</Label>
              <Input
                id="otpCode"
                placeholder="000000"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Código enviado para seu e-mail e SMS cadastrados
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <label htmlFor="agree" className="text-sm cursor-pointer">
                Eu li e concordo com todos os termos deste acordo de pagamento. Declaro que as
                informações fornecidas são verdadeiras e assumo o compromisso de quitar o débito
                conforme os valores e prazos estabelecidos.
              </label>
            </div>

            <Button onClick={handleSign} className="w-full gradient-primary" disabled={!agreed}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Assinar Digitalmente
            </Button>

            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Segurança da Assinatura</p>
                <p>
                  Sua assinatura será registrada com hash criptográfico SHA-256, timestamp UTC,
                  e endereço IP, garantindo autenticidade e não-repúdio conforme a Lei 14.063/2020.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TenantSignature;

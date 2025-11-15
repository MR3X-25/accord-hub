import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_NOTIFICATION_TEXT = `NOTIFICAÇÃO EXTRAJUDICIAL PARA COBRANÇA DE DÉBITO

Notificante: [NOME DO CREDOR], CPF/CNPJ: [CPF_CNPJ_CREDOR], endereço: [ENDEREÇO_CREDOR].

Notificado: [NOME DO DEVEDOR], CPF/CNPJ: [CPF_CNPJ_DEVEDOR], endereço: [ENDEREÇO_DEVEDOR].

Imóvel objeto: [ENDEREÇO_IMOVEL]; Contrato: [Nº CONTRATO]; Período em atraso: [PERÍODO]; Valor devido: R$ [VALOR_TOTAL].

Pelo presente, notificamos V.Sa. para que, no prazo máximo de 48 horas para medidas iniciais e 10 dias para regularização plena, proceda ao pagamento do débito descrito, sob pena de prosseguimento das medidas legais cabíveis para cobrança, inclusive inscrição em cadastros de proteção ao crédito e ajuizamento de ação de cobrança/execução.

Cláusulas:

1. Do débito — O débito tem origem no contrato de locação n.º [Nº], sendo composto por R$ [PRINCIPAL], acrescido de juros de [X]% ao mês e multa contratual de [Y]%.

2. Da proposta de acordo — É facultado ao notificado optar por acordo nos termos propostos eletronicamente por meio desta plataforma, sujeitando-se o acordo à confirmação mediante assinatura eletrônica e à quitação conforme as formas de pagamento disponibilizadas (PIX, boleto, cartão).

3. Das comunicações — As comunicações entre as partes poderão ser efetuadas por e-mail e SMS informados no cadastro, ficando as partes notificadas desde o envio do aviso eletrônico comprovado por logs de sistema.

4. Da responsabilidade — O credor declara que as informações declaradas neste instrumento são verdadeiras. A plataforma MR3X atua unicamente como meio tecnológico de emissão e armazenamento; não se responsabiliza por informações incorretas fornecidas pelas partes.

5. Do prazo — Se o débito não for regularizado no prazo ajustado, o credor poderá adotar medidas administrativas e judiciais, incluindo inclusão em cadastros de proteção ao crédito, sem prejuízo de cobrança de custas e honorários advocatícios.

6. Do aceite e prova — Este documento será gravado com hash criptográfico, carimbo de data/hora em UTC e registro de IP e user-agent do emissor, constituindo prova de sua emissão.

Local e data: [CIDADE], [DATA UTC].

Assinatura eletrônica: [NOME_EMISSOR] — CPF: [CPF_EMISSOR].

— FIM DO MODELO —
(Texto padrão adaptável; deve-se verificar caso a caso com assessor jurídico para efeitos de litígio.)`;

const NotificationForm = () => {
  const { toast } = useToast();
  const [notificationText, setNotificationText] = useState(DEFAULT_NOTIFICATION_TEXT);
  const [recipientEmail, setRecipientEmail] = useState("");

  const handleGeneratePdf = () => {
    toast({
      title: "PDF Gerado",
      description: "Notificação extrajudicial gerada com sucesso. Hash: a3f5b2...9d8c4e",
    });
  };

  const handleSendEmail = () => {
    if (!recipientEmail) {
      toast({
        title: "Erro",
        description: "Por favor, informe o e-mail do destinatário",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "E-mail Enviado",
      description: `Notificação enviada para ${recipientEmail}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Notificação Extrajudicial</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Este documento serve como notificação formal ao devedor para regularização do débito.
          Edite o texto conforme necessário para adequar ao seu caso específico.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="notificationText">Texto da Notificação</Label>
            <Textarea
              id="notificationText"
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
              className="min-h-[500px] font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="recipientEmail">E-mail do Destinatário</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="devedor@exemplo.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleGeneratePdf} className="flex-1 gradient-primary">
          <FileText className="w-4 h-4 mr-2" />
          Gerar PDF com Hash
        </Button>
        <Button onClick={handleSendEmail} variant="outline" className="flex-1">
          <Mail className="w-4 h-4 mr-2" />
          Enviar por E-mail
        </Button>
        <Button variant="outline" className="flex-1">
          <Send className="w-4 h-4 mr-2" />
          Carta Registrada
        </Button>
      </div>
    </div>
  );
};

export default NotificationForm;

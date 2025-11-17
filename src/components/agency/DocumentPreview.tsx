import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Send } from "lucide-react";
import { downloadPDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentPreviewProps {
  agreementData: any;
}

const DocumentPreview = ({ agreementData }: DocumentPreviewProps) => {
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    if (!agreementData) {
      toast({ title: "Erro", description: "Nenhum acordo para gerar PDF", variant: "destructive" });
      return;
    }

    try {
      await downloadPDF(agreementData);
      toast({ title: "PDF gerado", description: "Download iniciado com sucesso" });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({ title: "Erro", description: "Erro ao gerar PDF", variant: "destructive" });
    }
  };

  const handleSendEmail = async () => {
    if (!agreementData || !agreementData.debtorEmail) {
      toast({ title: "Erro", description: "Email do devedor não informado", variant: "destructive" });
      return;
    }

    try {
      const agreementUrl = `${window.location.origin}/inquilino?id=${agreementData.id}`;

      const { data, error } = await supabase.functions.invoke("send-agreement-email", {
        body: {
          to: agreementData.debtorEmail,
          agreementId: agreementData.id,
          debtorName: agreementData.debtorName,
          agencyName: agreementData.agencyName,
          totalAmount: agreementData.calculatedTotal.toFixed(2),
          agreementUrl,
        },
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: `Acordo enviado para ${agreementData.debtorEmail}`,
      });
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast({ title: "Erro", description: "Erro ao enviar email", variant: "destructive" });
    }
  };

  if (!agreementData) {
    return (
      <Card className="glass-card p-6">
        <p className="text-center text-muted-foreground">Salve o acordo para visualizar o preview.</p>
      </Card>
    );
  }

  const interest = (parseFloat(agreementData.principalAmount) * parseFloat(agreementData.interestRate)) / 100;
  const penalty = (parseFloat(agreementData.principalAmount) * parseFloat(agreementData.penaltyRate)) / 100;

  return (
    <div className="space-y-6">
      <Card className="glass-card p-8 relative overflow-hidden">
        <div className="watermark">CONFIDENCIAL</div>

        <div className="relative z-10">
          <div className="mb-8 pb-4 border-b text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">ACORDO DE PAGAMENTO</h1>
            <p className="text-lg font-serif italic text-muted-foreground">MR3X - Gestão e Tecnologia em Pagamentos de Aluguéis</p>
            <div className="mt-4 text-sm">
              <p className="font-semibold">Doc ID: {agreementData.id}</p>
              <p className="text-muted-foreground">
                Data: {new Date(agreementData.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Agência Responsável</h3>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <p><span className="font-semibold">Nome:</span> {agreementData.agencyName}</p>
              <p><span className="font-semibold">CNPJ:</span> {agreementData.agencyCnpj}</p>
              <p className="md:col-span-2"><span className="font-semibold">Endereço:</span> {agreementData.agencyAddress}</p>
              <p className="md:col-span-2">
                <span className="font-semibold">Corretor:</span> {agreementData.brokerName}
                {agreementData.brokerCreci && ` - CRECI: ${agreementData.brokerCreci}`}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">Credor</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Nome:</span> {agreementData.creditorName}</p>
                <p><span className="font-semibold">CPF/CNPJ:</span> {agreementData.creditorCpfCnpj}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">Devedor</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Nome:</span> {agreementData.debtorName}</p>
                <p><span className="font-semibold">CPF/CNPJ:</span> {agreementData.debtorCpfCnpj}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Objeto do Contrato</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Contrato:</span> {agreementData.contractId}</p>
              <p><span className="font-semibold">Imóvel:</span> {agreementData.propertyAddress}</p>
              {agreementData.propertyCity && (
                <p><span className="font-semibold">Cidade/UF:</span> {agreementData.propertyCity} - {agreementData.propertyState}</p>
              )}
              <p><span className="font-semibold">Período em Atraso:</span> {agreementData.debtPeriod}</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-primary/5 rounded-lg">
            <h3 className="text-lg font-bold text-foreground mb-3">Valores</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Valor Principal:</span>
                <span className="font-semibold">R$ {agreementData.principalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Juros ({agreementData.interestRate}%):</span>
                <span className="font-semibold">R$ {interest.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Multa ({agreementData.penaltyRate}%):</span>
                <span className="font-semibold">R$ {penalty.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
                <span>Total:</span>
                <span>R$ {agreementData.calculatedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {agreementData.paymentOptions && agreementData.paymentOptions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground mb-3">Formas de Pagamento Disponíveis</h3>
              <div className="space-y-2 text-sm">
                {agreementData.paymentOptions.map((option: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-semibold capitalize">{option.method.replace("_", " ")}</p>
                    <p className="text-muted-foreground">
                      {option.installments}x de R$ {option.installmentValue.toFixed(2)} = R$ {option.totalValue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {agreementData.hash && (
            <div className="mt-8 pt-4 border-t text-xs text-muted-foreground">
              <p><span className="font-semibold">Hash SHA-256:</span> {agreementData.hash}</p>
              <p><span className="font-semibold">IP:</span> {agreementData.ip} | <span className="font-semibold">Data/Hora UTC:</span> {agreementData.createdAt}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Baixar PDF
        </Button>
        <Button onClick={handleSendEmail} className="gap-2 gradient-primary">
          <Send className="w-4 h-4" />
          Enviar para Inquilino
        </Button>
      </div>

      <style>{`
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 4rem;
          font-weight: bold;
          color: rgba(200, 200, 200, 0.1);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default DocumentPreview;

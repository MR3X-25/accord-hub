import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import logo from "@/assets/mr3x-logo.png";
import { getAgreementById, AgreementData } from "@/lib/storage";

const TenantAgreementView = () => {
  const [searchParams] = useSearchParams();
  const [agreement, setAgreement] = useState<AgreementData | null>(null);
  
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const data = getAgreementById(id);
      setAgreement(data);
    }
  }, [searchParams]);

  if (!agreement) {
    return (
      <Card className="glass-card p-6">
        <p className="text-center text-muted-foreground">Carregando acordo...</p>
      </Card>
    );
  }

  const interest = (parseFloat(agreement.principalAmount) * parseFloat(agreement.interestRate)) / 100;
  const penalty = (parseFloat(agreement.principalAmount) * parseFloat(agreement.penaltyRate)) / 100;

  return (
    <Card className="bg-background p-6 md:p-8 shadow-xl relative overflow-hidden">
      <div className="watermark">CONFIDENCIAL</div>
      
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div className="pb-6 border-b-2 text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="MR3X" className="w-16 h-16 rounded-lg" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">ACORDO DE PAGAMENTO</h2>
          <p className="text-lg font-serif italic text-muted-foreground">MR3X - Gestão e Tecnologia em Pagamentos de Aluguéis</p>
          <div className="mt-4 text-sm">
            <p className="font-semibold">Doc ID: {agreement.id}</p>
            <p className="text-muted-foreground">Data: {new Date(agreement.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-3 text-foreground">Agência Responsável</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Nome:</span> {agreement.agencyName}</p>
              <p><span className="font-semibold">CNPJ:</span> {agreement.agencyCnpj}</p>
              <p><span className="font-semibold">Endereço:</span> {agreement.agencyAddress}</p>
              <p><span className="font-semibold">Corretor:</span> {agreement.brokerName} {agreement.brokerCreci && `- CRECI: ${agreement.brokerCreci}`}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Credor</h3>
              <p><span className="font-semibold">Nome:</span> {agreement.creditorName}</p>
              <p><span className="font-semibold">CPF/CNPJ:</span> {agreement.creditorCpfCnpj}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Devedor</h3>
              <p><span className="font-semibold">Nome:</span> {agreement.debtorName}</p>
              <p><span className="font-semibold">CPF/CNPJ:</span> {agreement.debtorCpfCnpj}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2 text-foreground">Objeto do Contrato</h3>
            <p><span className="font-semibold">Contrato:</span> {agreement.contractId}</p>
            <p><span className="font-semibold">Imóvel:</span> {agreement.propertyAddress}</p>
            {agreement.propertyCity && (
              <p><span className="font-semibold">Cidade/UF:</span> {agreement.propertyCity} - {agreement.propertyState}</p>
            )}
            <p><span className="font-semibold">Período em Atraso:</span> {agreement.debtPeriod}</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2 text-foreground">Valores</h3>
            <div className="bg-primary/5 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Valor Principal:</span>
                <span className="font-semibold">R$ {agreement.principalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Juros ({agreement.interestRate}%):</span>
                <span className="font-semibold">R$ {interest.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Multa ({agreement.penaltyRate}%):</span>
                <span className="font-semibold">R$ {penalty.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg text-primary">R$ {agreement.calculatedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {agreement.paymentOptions && agreement.paymentOptions.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Formas de Pagamento Disponíveis</h3>
              <div className="space-y-2">
                {agreement.paymentOptions.map((option, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold capitalize">{option.method.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.installments}x de R$ {option.installmentValue.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {option.totalValue.toFixed(2)}</p>
                        {option.discount > 0 && (
                          <p className="text-sm text-green-600">Desconto: {option.discount}%</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold text-lg mb-2 text-foreground">Cláusulas do Acordo</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>O devedor reconhece o débito acima descrito e se compromete a quitá-lo conforme os termos deste acordo.</li>
              <li>O pagamento poderá ser efetuado através das formas disponibilizadas: PIX, boleto bancário, cartão de crédito ou link de pagamento.</li>
              <li>Em caso de inadimplência das parcelas acordadas, o credor poderá adotar medidas judiciais cabíveis.</li>
              <li>Este documento possui validade jurídica e é autenticado por hash criptográfico SHA-256.</li>
              <li>As partes elegem o foro da comarca correspondente ao imóvel para dirimir quaisquer questões oriundas deste acordo.</li>
            </ol>
          </div>
        </div>
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
    </Card>
  );
};

export default TenantAgreementView;

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Send, Hash, Calendar, MapPin } from "lucide-react";
import logo from "@/assets/mr3x-logo.png";

interface DocumentPreviewProps {
  agreementData: any;
}

const DocumentPreview = ({ agreementData }: DocumentPreviewProps) => {
  const mockHash = "a3f5b2c8d1e4f7g9h2i5j8k1l4m7n0p3q6r9s2t5u8v1w4x7y0z3";
  const mockTimestamp = new Date().toISOString();
  const mockIp = "200.100.50.123";

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <Card className="bg-white p-8 shadow-xl">
        <div className="space-y-6">
          {/* Header with Logo */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-4">
              <img src={logo} alt="MR3X" className="w-20 h-20 rounded-lg" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ACORDO DE PAGAMENTO</h2>
                <p className="text-sm text-gray-600">MR3X — Gestão de Cobranças</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Doc ID: AGR-2024-001234</p>
              <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Watermark */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <p className="text-8xl font-bold text-gray-400 rotate-[-45deg]">CONFIDENCIAL</p>
            </div>

            {/* Content */}
            <div className="relative space-y-4 text-gray-900">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">Credor</h3>
                  <p>Nome: {agreementData?.creditorName || "[NOME DO CREDOR]"}</p>
                  <p>CPF/CNPJ: {agreementData?.creditorCpfCnpj || "[CPF/CNPJ]"}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Devedor</h3>
                  <p>Nome: {agreementData?.debtorName || "[NOME DO DEVEDOR]"}</p>
                  <p>CPF/CNPJ: {agreementData?.debtorCpfCnpj || "[CPF/CNPJ]"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Objeto do Contrato</h3>
                <p>Contrato: {agreementData?.contractId || "[Nº CONTRATO]"}</p>
                <p>Imóvel: {agreementData?.propertyAddress || "[ENDEREÇO DO IMÓVEL]"}</p>
                <p>Período em Atraso: {agreementData?.debtPeriod || "[PERÍODO]"}</p>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Valores</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Valor Principal:</span>
                    <span className="font-semibold">R$ {agreementData?.principalAmount || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Juros ({agreementData?.interestRate || "2"}%):</span>
                    <span className="font-semibold">R$ {
                      ((parseFloat(agreementData?.principalAmount || "0") * parseFloat(agreementData?.interestRate || "2")) / 100).toFixed(2)
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multa ({agreementData?.penaltyRate || "10"}%):</span>
                    <span className="font-semibold">R$ {
                      ((parseFloat(agreementData?.principalAmount || "0") * parseFloat(agreementData?.penaltyRate || "10")) / 100).toFixed(2)
                    }</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-lg">R$ {agreementData?.calculatedTotal?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Cláusulas do Acordo</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>O devedor reconhece o débito acima descrito e se compromete a quitá-lo conforme os termos deste acordo.</li>
                  <li>O pagamento poderá ser efetuado através das formas disponibilizadas: PIX, boleto bancário, cartão de crédito ou link de pagamento.</li>
                  <li>Em caso de inadimplência das parcelas acordadas, o credor poderá adotar medidas judiciais cabíveis.</li>
                  <li>Este documento possui validade jurídica e é autenticado por hash criptográfico SHA-256.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Digital Signature Section */}
          <div className="pt-6 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-4">Assinaturas Eletrônicas:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">Credor</p>
                <p className="text-sm text-gray-600">___________________________</p>
                <p className="text-xs text-gray-500 mt-1">(Assinatura Eletrônica)</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">Devedor</p>
                <p className="text-sm text-gray-600">___________________________</p>
                <p className="text-xs text-gray-500 mt-1">(Assinatura Eletrônica)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Metadata Card */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" />
          Metadados do Documento
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Hash SHA-256</Label>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mt-1">
              <p className="text-xs font-mono break-all text-blue-900 dark:text-blue-100">{mockHash}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <Label className="text-xs text-muted-foreground">Timestamp UTC</Label>
              </div>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded">{mockTimestamp}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <Label className="text-xs text-muted-foreground">IP de Origem</Label>
              </div>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded">{mockIp}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-3">
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Editar
        </Button>
        <Button className="gap-2 gradient-primary">
          <Download className="w-4 h-4" />
          Gerar PDF
        </Button>
        <Button variant="outline" className="gap-2">
          <Send className="w-4 h-4" />
          Enviar por E-mail
        </Button>
      </div>
    </div>
  );
};

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`block font-semibold ${className}`}>{children}</label>
);

export default DocumentPreview;

import { Card } from "@/components/ui/card";
import logo from "@/assets/mr3x-logo.png";

const TenantAgreementView = () => {
  return (
    <Card className="bg-white p-6 md:p-8 shadow-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-4">
            <img src={logo} alt="MR3X" className="w-16 h-16 rounded-lg" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">ACORDO DE PAGAMENTO</h2>
              <p className="text-sm text-gray-600">MR3X — Gestão de Cobranças</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Doc ID: AGR-2024-001234</p>
            <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-900">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-lg mb-2">Credor</h3>
              <p>Nome: Imobiliária Alpha Ltda</p>
              <p>CNPJ: 12.345.678/0001-90</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Devedor</h3>
              <p>Nome: João Silva</p>
              <p>CPF: 123.456.789-00</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Objeto do Contrato</h3>
            <p>Contrato: CONT-2024-001</p>
            <p>Imóvel: Rua das Flores, 123 - Centro - São Paulo/SP</p>
            <p>Período em Atraso: Janeiro/2024 - Março/2024</p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Valores</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Valor Principal:</span>
                <span className="font-semibold">R$ 6.000,00</span>
              </div>
              <div className="flex justify-between">
                <span>Juros (2% a.m.):</span>
                <span className="font-semibold">R$ 360,00</span>
              </div>
              <div className="flex justify-between">
                <span>Multa (10%):</span>
                <span className="font-semibold">R$ 600,00</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg">R$ 6.960,00</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Parcelamento Proposto</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Parcela 1 - Vencimento: 20/11/2024</span>
                <span className="font-semibold">R$ 3.480,00</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Parcela 2 - Vencimento: 20/12/2024</span>
                <span className="font-semibold">R$ 3.480,00</span>
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
              <li>As partes elegem o foro da comarca de São Paulo/SP para dirimir quaisquer questões oriundas deste acordo.</li>
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TenantAgreementView;

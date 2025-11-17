import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle2, ArrowLeft, Moon, Sun } from "lucide-react";
import logo from "@/assets/mr3x-logo.png";
import { useTheme } from "@/contexts/ThemeContext";
import TenantAgreementView from "@/components/tenant/TenantAgreementView";
import TenantSignature from "@/components/tenant/TenantSignature";

const Tenant = () => {
  const [signed, setSigned] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={logo} alt="MR3X" className="w-14 h-14 rounded-xl object-contain cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MR3X — Painel Inquilino</h1>
              <p className="text-sm text-muted-foreground">Visualize e assine seu acordo de pagamento</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        <Card className="glass-card p-4 mb-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {signed ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-foreground">Acordo Assinado</p>
                    <p className="text-sm text-muted-foreground">Você já assinou este acordo digitalmente</p>
                  </div>
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Acordo Pendente de Assinatura</p>
                    <p className="text-sm text-muted-foreground">Revise os termos e assine digitalmente</p>
                  </div>
                </>
              )}
            </div>
            <Badge variant={signed ? "default" : "secondary"}>
              {signed ? "Assinado" : "Pendente"}
            </Badge>
          </div>
        </Card>

        {/* Agreement Content */}
        <TenantAgreementView />

        {/* Signature Section */}
        {!signed && (
          <Card className="glass-card p-6 mt-6">
            <TenantSignature onSign={() => setSigned(true)} />
          </Card>
        )}

        {/* Download Options */}
        {signed && (
          <Card className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Documentos Disponíveis</h3>
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="justify-start gap-3"
                onClick={async () => {
                  const { useSearchParams } = await import("react-router-dom");
                  const [searchParams] = useSearchParams();
                  const id = searchParams.get("id");
                  if (id) {
                    const { getAgreementById } = await import("@/lib/storage");
                    const { downloadPDF } = await import("@/lib/pdfGenerator");
                    const agreement = getAgreementById(id);
                    if (agreement) {
                      await downloadPDF(agreement);
                    }
                  }
                }}
              >
                <Download className="w-4 h-4" />
                Baixar Acordo em PDF
              </Button>
              <Button variant="outline" className="justify-start gap-3">
                <Download className="w-4 h-4" />
                Baixar Comprovante de Assinatura
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tenant;

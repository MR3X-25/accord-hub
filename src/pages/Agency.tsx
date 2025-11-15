import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, DollarSign, Hash, ArrowLeft, Moon, Sun } from "lucide-react";
import logo from "@/assets/mr3x-logo.png";
import { useTheme } from "@/contexts/ThemeContext";
import AgreementForm from "@/components/agency/AgreementForm";
import NotificationForm from "@/components/agency/NotificationForm";
import PaymentOptions from "@/components/agency/PaymentOptions";
import DocumentPreview from "@/components/agency/DocumentPreview";

const Agency = () => {
  const [activeTab, setActiveTab] = useState("agreement");
  const [agreementData, setAgreementData] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={logo} alt="MR3X" className="w-16 h-16 rounded-xl object-contain cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">MR3X — Painel Agência</h1>
              <p className="text-sm text-muted-foreground">Gestão de Pagamentos e Cobranças de Aluguéis</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/acordos">
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

        {/* Main Content */}
        <Card className="glass-card shadow-2xl p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="agreement" className="gap-2">
                <FileText className="w-4 h-4" />
                Acordo
              </TabsTrigger>
              <TabsTrigger value="notification" className="gap-2">
                <Users className="w-4 h-4" />
                Notificação
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Pagamentos
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Hash className="w-4 h-4" />
                Preview & PDF
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agreement">
              <AgreementForm onDataChange={setAgreementData} />
            </TabsContent>

            <TabsContent value="notification">
              <NotificationForm />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentOptions agreementData={agreementData} />
            </TabsContent>

            <TabsContent value="preview">
              <DocumentPreview agreementData={agreementData} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Agency;

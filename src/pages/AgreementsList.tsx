import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Eye, Trash2, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/mr3x-logo.png";
import { getAgreements, deleteAgreement, AgreementData } from "@/lib/storage";
import { downloadPDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const AgreementsList = () => {
  const [agreements, setAgreements] = useState<AgreementData[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAgreements();
  }, []);

  const loadAgreements = () => {
    const data = getAgreements();
    setAgreements(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente excluir este acordo?")) {
      deleteAgreement(id);
      loadAgreements();
      toast({
        title: "Acordo excluído",
        description: "O acordo foi removido com sucesso.",
      });
    }
  };

  const handleDownloadPDF = async (agreement: AgreementData) => {
    try {
      await downloadPDF(agreement);
      toast({
        title: "PDF gerado",
        description: "Download do PDF iniciado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      draft: "secondary",
      sent: "default",
      signed: "default",
      paid: "default",
    };
    const labels: Record<string, string> = {
      draft: "Rascunho",
      sent: "Enviado",
      signed: "Assinado",
      paid: "Pago",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-4">
            <img src={logo} alt="MR3X" className="w-16 h-16 rounded-xl object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Acordos Cadastrados</h1>
              <p className="text-sm text-muted-foreground">Gerencie todos os acordos criados</p>
            </div>
          </Link>
          <Button onClick={() => navigate("/agencia")} className="gap-2 gradient-primary">
            <Plus className="w-4 h-4" />
            Novo Acordo
          </Button>
        </div>

        {/* Lista de Acordos */}
        <div className="grid gap-4">
          {agreements.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhum acordo cadastrado</h3>
              <p className="text-muted-foreground mb-6">Crie seu primeiro acordo para começar</p>
              <Button onClick={() => navigate("/agencia")} className="gradient-primary">
                Criar Acordo
              </Button>
            </Card>
          ) : (
            agreements.map((agreement) => (
              <Card key={agreement.id} className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Acordo #{agreement.id.slice(0, 8)}
                      </h3>
                      {getStatusBadge(agreement.status)}
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p>
                        <span className="font-semibold">Credor:</span> {agreement.creditorName}
                      </p>
                      <p>
                        <span className="font-semibold">Devedor:</span> {agreement.debtorName}
                      </p>
                      <p>
                        <span className="font-semibold">Contrato:</span> {agreement.contractId}
                      </p>
                      <p>
                        <span className="font-semibold">Total:</span> R$ {agreement.calculatedTotal.toFixed(2)}
                      </p>
                      <p>
                        <span className="font-semibold">Criado:</span>{" "}
                        {new Date(agreement.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p>
                        <span className="font-semibold">Agência:</span> {agreement.agencyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/agencia?id=${agreement.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownloadPDF(agreement)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(agreement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AgreementsList;

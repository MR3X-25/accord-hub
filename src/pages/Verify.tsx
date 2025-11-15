import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2, XCircle, FileText, Calendar, MapPin, User } from "lucide-react";
import logo from "@/assets/mr3x-logo.png";

const Verify = () => {
  const [hash, setHash] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    // Simulate verification
    setTimeout(() => {
      setVerificationResult({
        valid: true,
        documentId: "AGR-2024-001234",
        hash: hash || "a3f5b2...9d8c4e",
        createdAt: "2024-11-15T10:30:00Z",
        createdBy: "Imobiliária Alpha",
        ip: "200.100.50.123",
        signatures: [
          {
            name: "João Silva",
            cpf: "XXX.XXX.123-45",
            method: "Assinatura Eletrônica Simples",
            timestamp: "2024-11-15T11:45:00Z"
          }
        ],
        status: "VÁLIDO"
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="MR3X" className="w-16 h-16 rounded-xl object-contain" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Verificador de Documentos</h1>
            <p className="text-sm text-muted-foreground">Verifique a autenticidade e integridade de documentos MR3X</p>
          </div>
        </div>

        {/* Verification Form */}
        <Card className="glass-card shadow-2xl p-6 mb-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="hash" className="text-foreground">Hash do Documento (SHA-256)</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="hash"
                  placeholder="Cole o hash SHA-256 do documento aqui..."
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={handleVerify} 
                  disabled={loading}
                  className="gradient-primary shrink-0"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Verificando..." : "Verificar"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                O hash pode ser encontrado no documento PDF ou através do QR Code
              </p>
            </div>
          </div>
        </Card>

        {/* Verification Result */}
        {verificationResult && (
          <Card className="glass-card shadow-2xl p-6">
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-500" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {verificationResult.valid ? "Documento Válido" : "Documento Inválido"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {verificationResult.valid 
                        ? "O documento é autêntico e não foi alterado" 
                        : "O documento pode ter sido modificado ou não existe"}
                    </p>
                  </div>
                </div>
                <Badge variant={verificationResult.valid ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {verificationResult.status}
                </Badge>
              </div>

              {/* Document Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <Label className="text-foreground font-semibold">ID do Documento</Label>
                    </div>
                    <p className="text-sm font-mono bg-muted px-3 py-2 rounded">{verificationResult.documentId}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      <Label className="text-foreground font-semibold">Criado Por</Label>
                    </div>
                    <p className="text-sm bg-muted px-3 py-2 rounded">{verificationResult.createdBy}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <Label className="text-foreground font-semibold">Data de Criação (UTC)</Label>
                    </div>
                    <p className="text-sm bg-muted px-3 py-2 rounded">
                      {new Date(verificationResult.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <Label className="text-foreground font-semibold">IP de Origem</Label>
                    </div>
                    <p className="text-sm font-mono bg-muted px-3 py-2 rounded">{verificationResult.ip}</p>
                  </div>
                </div>
              </div>

              {/* Hash */}
              <div>
                <Label className="text-foreground font-semibold mb-2 block">Hash SHA-256</Label>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-mono break-all text-blue-900 dark:text-blue-100">
                    {verificationResult.hash}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              {verificationResult.signatures && verificationResult.signatures.length > 0 && (
                <div>
                  <Label className="text-foreground font-semibold mb-3 block">Assinaturas Eletrônicas</Label>
                  <div className="space-y-3">
                    {verificationResult.signatures.map((sig: any, idx: number) => (
                      <div key={idx} className="bg-muted p-4 rounded-lg">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Nome</p>
                            <p className="text-sm font-semibold">{sig.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">CPF</p>
                            <p className="text-sm font-mono">{sig.cpf}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Método</p>
                            <p className="text-sm">{sig.method}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Data/Hora</p>
                            <p className="text-sm">{new Date(sig.timestamp).toLocaleString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Visualizar PDF Original
                </Button>
                <Button variant="outline" className="flex-1">
                  Reportar Divergência
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Verify;

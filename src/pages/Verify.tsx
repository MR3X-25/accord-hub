import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, CheckCircle2, XCircle, MapPin, Download, Eye, Moon, Sun } from "lucide-react";
import logo from "@/assets/mr3x-logo.png";
import { useTheme } from "@/contexts/ThemeContext";
import { getAgreementById } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { downloadPDF } from "@/lib/pdfGenerator";

const Verify = () => {
  const [searchType, setSearchType] = useState<"hash" | "contract">("contract");
  const [searchValue, setSearchValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleVerify = () => {
    if (!searchValue && !uploadedFile) {
      toast({ title: "Erro", description: "Informe um número de contrato/hash ou faça upload de um arquivo", variant: "destructive" });
      return;
    }

    const agreement = getAgreementById(searchValue);
    
    if (agreement) {
      setVerificationResult({
        status: "verified",
        document: agreement,
        verified: true,
      });
      toast({ title: "Verificado", description: "Documento encontrado e verificado com sucesso" });
    } else {
      setVerificationResult({
        status: "not_found",
        verified: false,
      });
      toast({ title: "Não encontrado", description: "Documento não encontrado no sistema", variant: "destructive" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setUploadedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        toast({ title: "Arquivo carregado", description: `${file.name} carregado com sucesso` });
      } else {
        toast({ title: "Erro", description: "Apenas arquivos PDF são aceitos", variant: "destructive" });
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!verificationResult?.document) return;
    
    try {
      await downloadPDF(verificationResult.document);
      toast({ title: "PDF baixado", description: "Download iniciado com sucesso" });
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      toast({ title: "Erro", description: "Erro ao baixar PDF", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={logo} alt="MR3X" className="w-14 h-14 rounded-xl object-contain cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MR3X — Verificador de Documentos</h1>
              <p className="text-sm text-muted-foreground">Verifique a autenticidade e localize documentos</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>

        <Card className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Buscar Documento</h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={searchType === "contract" ? "default" : "outline"}
                onClick={() => setSearchType("contract")}
                className="flex-1"
              >
                Número do Contrato
              </Button>
              <Button
                variant={searchType === "hash" ? "default" : "outline"}
                onClick={() => setSearchType("hash")}
                className="flex-1"
              >
                Hash SHA-256
              </Button>
            </div>

            <div>
              <Label htmlFor="search">
                {searchType === "contract" ? "Número do Contrato (MR3X-ACD-XXXX-XXXXXX)" : "Hash SHA-256"}
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="search"
                  placeholder={searchType === "contract" ? "MR3X-ACD-2024-123456" : "Digite o hash SHA-256"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <Button onClick={handleVerify} className="gap-2">
                  <Search className="w-4 h-4" />
                  Verificar
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label htmlFor="file-upload">Ou faça upload do documento PDF</Label>
              <div className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {uploadedFile ? uploadedFile.name : "Clique para selecionar ou arraste um arquivo PDF"}
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>

        {previewUrl && (
          <Card className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Preview do Documento</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open(previewUrl, "_blank")}>
                  <Eye className="w-4 h-4 mr-2" />
                  Abrir em Nova Aba
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewUrl;
                  link.download = uploadedFile?.name || "documento.pdf";
                  link.click();
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
              </div>
            </div>
            <iframe
              src={previewUrl}
              className="w-full h-[600px] rounded-lg border"
              title="PDF Preview"
            />
          </Card>
        )}

        {verificationResult && (
          <Card className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              {verificationResult.verified ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Documento Verificado</h2>
                    <p className="text-sm text-muted-foreground">Este documento é autêntico e válido</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Documento Não Encontrado</h2>
                    <p className="text-sm text-muted-foreground">Não foi possível verificar este documento</p>
                  </div>
                </>
              )}
            </div>

            {verificationResult.verified && verificationResult.document && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">ID do Documento</p>
                    <p className="font-semibold">{verificationResult.document.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge>{verificationResult.document.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Credor</p>
                    <p className="font-semibold">{verificationResult.document.creditorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Devedor</p>
                    <p className="font-semibold">{verificationResult.document.debtorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="font-semibold">
                      {new Date(verificationResult.document.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="font-semibold">R$ {verificationResult.document.calculatedTotal.toFixed(2)}</p>
                  </div>
                </div>

                {verificationResult.document.hash && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Hash SHA-256</p>
                    <p className="font-mono text-xs break-all">{verificationResult.document.hash}</p>
                  </div>
                )}

                {verificationResult.document.signedAt && (
                  <div className="p-4 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h3 className="font-bold mb-2">Assinatura Eletrônica</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Assinado por:</span> {verificationResult.document.signedBy}</p>
                      <p><span className="font-semibold">Data/Hora:</span> {new Date(verificationResult.document.signedAt).toLocaleString("pt-BR")}</p>
                      <p><span className="font-semibold">IP:</span> {verificationResult.document.ip || "N/A"}</p>
                      
                      {verificationResult.document.latitude && verificationResult.document.longitude && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <a
                            href={`https://www.google.com/maps?q=${verificationResult.document.latitude},${verificationResult.document.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Ver Localização no Mapa ({verificationResult.document.latitude}, {verificationResult.document.longitude})
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={handleDownloadPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF Original
                  </Button>
                  <Button variant="outline">
                    Reportar Divergência
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Verify;

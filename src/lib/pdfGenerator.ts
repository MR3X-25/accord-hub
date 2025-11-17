import jsPDF from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { AgreementData } from "./storage";

export const generatePDF = async (agreement: AgreementData): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Watermark CONFIDENCIAL
  doc.setFontSize(60);
  doc.setTextColor(230, 230, 230);
  doc.saveGraphicsState();
  doc.text("CONFIDENCIAL", 105, 150, {
    angle: 45,
    align: "center",
  });
  doc.restoreGraphicsState();
  
  // Logo
  const logo = document.querySelector('img[alt="MR3X"]') as HTMLImageElement;
  if (logo) {
    doc.addImage(logo.src, "PNG", 15, 10, 30, 30);
  }
  
  // Header - Centralized
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "bold");
  doc.text("ACORDO DE PAGAMENTO", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("times", "italic");
  doc.text("MR3X - Gestão e Tecnologia em Pagamentos de Aluguéis", 105, 28, { align: "center" });
  
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text(`Doc ID: ${agreement.id}`, 150, 38);
  doc.text(`Data: ${new Date(agreement.createdAt).toLocaleDateString("pt-BR")}`, 150, 43);
  
  // Dados da Agência
  let y = 50;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Agência Responsável", 15, y);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  y += 7;
  doc.text(`Nome: ${agreement.agencyName}`, 15, y);
  y += 5;
  doc.text(`CNPJ: ${agreement.agencyCnpj}`, 15, y);
  y += 5;
  doc.text(`Endereço: ${agreement.agencyAddress}`, 15, y);
  y += 5;
  doc.text(`Corretor: ${agreement.brokerName} - CRECI: ${agreement.brokerCreci}`, 15, y);
  
  // Credor e Devedor
  y += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Credor", 15, y);
  doc.text("Devedor", 110, y);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  y += 7;
  doc.text(`Nome: ${agreement.creditorName}`, 15, y);
  doc.text(`Nome: ${agreement.debtorName}`, 110, y);
  y += 5;
  doc.text(`CPF/CNPJ: ${agreement.creditorCpfCnpj}`, 15, y);
  doc.text(`CPF/CNPJ: ${agreement.debtorCpfCnpj}`, 110, y);
  
  // Objeto do Contrato
  y += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Objeto do Contrato", 15, y);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  y += 7;
  doc.text(`Contrato: ${agreement.contractId}`, 15, y);
  y += 5;
  doc.text(`Imóvel: ${agreement.propertyAddress}`, 15, y);
  y += 5;
  doc.text(`Período em Atraso: ${agreement.debtPeriod}`, 15, y);
  
  // Valores
  y += 10;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Valores", 15, y);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  y += 7;
  const interest = (parseFloat(agreement.principalAmount) * parseFloat(agreement.interestRate)) / 100;
  const penalty = (parseFloat(agreement.principalAmount) * parseFloat(agreement.penaltyRate)) / 100;
  doc.text(`Valor Principal: R$ ${agreement.principalAmount}`, 15, y);
  y += 5;
  doc.text(`Juros (${agreement.interestRate}%): R$ ${interest.toFixed(2)}`, 15, y);
  y += 5;
  doc.text(`Multa (${agreement.penaltyRate}%): R$ ${penalty.toFixed(2)}`, 15, y);
  y += 5;
  doc.setFont(undefined, "bold");
  doc.text(`Total: R$ ${agreement.calculatedTotal.toFixed(2)}`, 15, y);
  
  // QR Code
  const qrCodeDataUrl = await QRCode.toDataURL(`https://mr3x.app/verify/${agreement.hash}`);
  doc.addImage(qrCodeDataUrl, "PNG", 15, 200, 30, 30);
  
  // Código de Barras
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, agreement.id, { format: "CODE128", displayValue: false });
  doc.addImage(canvas.toDataURL(), "PNG", 60, 205, 80, 20);
  
  // Metadados
  y = 240;
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text(`Hash SHA-256: ${agreement.hash}`, 15, y);
  y += 4;
  doc.text(`IP: ${agreement.ip} | Data/Hora UTC: ${agreement.createdAt}`, 15, y);
  
  // Assinatura Eletrônica do Inquilino
  if (agreement.signedAt && agreement.signedBy) {
    y += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Assinatura Eletrônica do Inquilino:", 15, y);
    doc.setFont(undefined, "normal");
    y += 7;
    doc.text(`Assinado por: ${agreement.signedBy}`, 15, y);
    y += 5;
    doc.text(`Data/Hora: ${new Date(agreement.signedAt).toLocaleString("pt-BR")}`, 15, y);
    y += 5;
    doc.text(`IP: ${agreement.ip || "N/A"}`, 15, y);
    y += 5;
    
    // Geolocalização (placeholder - será implementado no momento da assinatura)
    if (agreement.latitude && agreement.longitude) {
      const mapLink = `https://www.google.com/maps?q=${agreement.latitude},${agreement.longitude}`;
      doc.setTextColor(0, 0, 255);
      doc.textWithLink(`Localização: ${agreement.latitude}, ${agreement.longitude}`, 15, y, { url: mapLink });
      doc.setTextColor(0, 0, 0);
    }
  }
  
  // Retorna o PDF como Blob para download ou envio
  return doc.output('blob');
};

// Função auxiliar para download do PDF
export const downloadPDF = async (agreement: AgreementData): Promise<void> => {
  const pdfBlob = await generatePDF(agreement);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `acordo_${agreement.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

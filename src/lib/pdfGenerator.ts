import jsPDF from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { AgreementData } from "./storage";

export const generatePDF = async (agreement: AgreementData): Promise<void> => {
  const doc = new jsPDF();
  
  // Watermark
  doc.setFontSize(60);
  doc.setTextColor(220, 220, 220);
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
  
  // Header
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("ACORDO DE PAGAMENTO", 50, 20);
  doc.setFontSize(10);
  doc.text("MR3X - Gestão de Cobranças", 50, 27);
  doc.text(`Doc ID: ${agreement.id}`, 150, 20);
  doc.text(`Data: ${new Date(agreement.createdAt).toLocaleDateString("pt-BR")}`, 150, 27);
  
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
  
  // Assinaturas
  y += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Assinaturas Eletrônicas:", 15, y);
  doc.setFont(undefined, "normal");
  y += 7;
  doc.text("_____________________________", 15, y);
  doc.text("_____________________________", 110, y);
  y += 5;
  doc.text(`${agreement.creditorName}`, 15, y);
  doc.text(`${agreement.debtorName}`, 110, y);
  y += 4;
  doc.text("(Credor)", 15, y);
  doc.text("(Devedor)", 110, y);
  
  // Save
  doc.save(`acordo_${agreement.id}.pdf`);
};

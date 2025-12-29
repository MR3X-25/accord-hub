import jsPDF from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { AgreementData } from "./storage";
import { calculateAgreementValues, formatCurrency, formatDate } from "./calculateAgreement";

export const generatePDF = async (agreement: AgreementData): Promise<Blob> => {
  const doc = new jsPDF();
  const calc = calculateAgreementValues(agreement);

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

  // Resumo Financeiro Detalhado
  y += 12;
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("Resumo Financeiro", 15, y);
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);
  y += 7;

  // Box de valores
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(15, y - 3, 85, 32, 2, 2, "FD");

  doc.text(`Valor Principal:`, 20, y + 2);
  doc.text(formatCurrency(calc.principal), 75, y + 2, { align: "right" });

  doc.text(`Juros (${calc.interestRate}%):`, 20, y + 8);
  doc.text(formatCurrency(calc.interestAmount), 75, y + 8, { align: "right" });

  doc.text(`Multa (${calc.penaltyRate}%):`, 20, y + 14);
  doc.text(formatCurrency(calc.penaltyAmount), 75, y + 14, { align: "right" });

  doc.setDrawColor(0, 0, 0);
  doc.line(20, y + 18, 95, y + 18);

  doc.text(`Total s/ desconto:`, 20, y + 24);
  doc.text(formatCurrency(calc.totalWithCharges), 75, y + 24, { align: "right" });

  // Box desconto e total final
  if (calc.discountAmount > 0) {
    doc.setFillColor(230, 255, 230);
    doc.roundedRect(105, y - 3, 85, 32, 2, 2, "FD");

    doc.setTextColor(34, 139, 34);
    doc.text(`Desconto (${calc.discount.toFixed(1)}%):`, 110, y + 2);
    doc.text(`-${formatCurrency(calc.discountAmount)}`, 170, y + 2, { align: "right" });
    doc.setTextColor(0, 0, 0);

    doc.setFont(undefined, "bold");
    doc.text(`TOTAL A PAGAR:`, 110, y + 14);
    doc.setFontSize(12);
    doc.text(formatCurrency(calc.totalFinal), 170, y + 14, { align: "right" });
    doc.setFontSize(10);

    doc.setTextColor(34, 139, 34);
    doc.text(`Economia:`, 110, y + 24);
    doc.text(formatCurrency(calc.savings), 170, y + 24, { align: "right" });
    doc.setTextColor(0, 0, 0);
  } else {
    doc.setFont(undefined, "bold");
    doc.text(`TOTAL:`, 110, y + 14);
    doc.setFontSize(12);
    doc.text(formatCurrency(calc.totalWithCharges), 170, y + 14, { align: "right" });
    doc.setFontSize(10);
  }
  doc.setFont(undefined, "normal");

  y += 38;

  // Forma de Pagamento e Parcelas
  if (agreement.paymentOptions && agreement.paymentOptions.length > 0) {
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Forma de Pagamento Escolhida", 15, y);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    y += 7;

    const methodLabels: Record<string, string> = {
      pix: "PIX",
      boleto: "Boleto Bancário",
      card: "Cartão de Crédito",
      link: "Link de Pagamento",
    };

    const methods = agreement.paymentOptions.map((opt) => methodLabels[opt.method] || opt.method).join(", ");
    doc.text(`Método(s): ${methods}`, 15, y);
    y += 6;
  }

  // Detalhes das Parcelas
  if (agreement.installmentPlans && agreement.installmentPlans.length > 0) {
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Plano de Parcelas", 15, y);
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    y += 7;

    // Cabeçalho da tabela
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y - 3, 180, 6, "F");
    doc.setFont(undefined, "bold");
    doc.text("Nº", 20, y);
    doc.text("Valor Base", 45, y);
    doc.text("Desconto", 80, y);
    doc.text("Valor Final", 115, y);
    doc.text("Vencimento", 155, y);
    doc.setFont(undefined, "normal");
    y += 6;

    // Linhas das parcelas
    agreement.installmentPlans.forEach((plan, index) => {
      const discountAmt = plan.value - plan.finalValue;
      doc.text(`${plan.installmentNumber}`, 20, y);
      doc.text(formatCurrency(plan.value), 45, y);
      doc.text(`${plan.discount}% (-${formatCurrency(discountAmt)})`, 80, y);
      doc.text(formatCurrency(plan.finalValue), 115, y);
      doc.text(formatDate(plan.dueDate), 155, y);
      y += 5;

      // Nova página se necessário
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Total das parcelas
    y += 2;
    doc.setFont(undefined, "bold");
    const totalParcelas = agreement.installmentPlans.reduce((sum, p) => sum + p.finalValue, 0);
    doc.text(`Total (${agreement.installmentPlans.length} parcela${agreement.installmentPlans.length > 1 ? "s" : ""}):`, 80, y);
    doc.text(formatCurrency(totalParcelas), 115, y);
    doc.setFont(undefined, "normal");
    y += 8;
  }

  // QR Code
  const qrY = Math.min(y + 5, 200);
  const qrCodeDataUrl = await QRCode.toDataURL(`https://mr3x.app/verify/${agreement.hash}`);
  doc.addImage(qrCodeDataUrl, "PNG", 15, qrY, 30, 30);

  // Código de Barras
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, agreement.id, { format: "CODE128", displayValue: false });
  doc.addImage(canvas.toDataURL(), "PNG", 60, qrY + 5, 80, 20);

  // Metadados
  y = qrY + 35;
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

    // Geolocalização
    if (agreement.latitude && agreement.longitude) {
      const mapLink = `https://www.google.com/maps?q=${agreement.latitude},${agreement.longitude}`;
      doc.setTextColor(0, 0, 255);
      doc.textWithLink(`Localização: ${agreement.latitude}, ${agreement.longitude}`, 15, y, { url: mapLink });
      doc.setTextColor(0, 0, 0);
    }
  }

  // Retorna o PDF como Blob para download ou envio
  return doc.output("blob");
};

// Função auxiliar para download do PDF
export const downloadPDF = async (agreement: AgreementData): Promise<void> => {
  const pdfBlob = await generatePDF(agreement);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `acordo_${agreement.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};

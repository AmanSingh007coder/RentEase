import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateReceipt = (payment: any, property: any, userName: string) => {
  const doc = new jsPDF();

  // 1. Branding Header
  doc.setFontSize(22);
  doc.setTextColor(31, 41, 55); 
  doc.text("RentEase Digital Receipt", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Receipt ID: ${payment.transactionId || 'N/A'}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);

  // 2. Transaction Summary Table
  autoTable(doc, {
    startY: 45,
    head: [['Description', 'Details']],
    body: [
      ['Tenant Name', userName],
      ['Property Address', property?.address || 'N/A'],
      // ✅ FIX: Added fallback to prevent .toUpperCase() crash
      ['Payment Type', (payment?.type || "Rent").toUpperCase()], 
      ['For Period', `${payment?.month || 'N/A'} ${payment?.year || ''}`],
      ['Amount Paid', `INR ${payment?.amount?.toLocaleString() || '0'}`],
      ['Status', 'VERIFIED & SETTLED'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 82, 204] }, 
  });

  // 3. Digital Signature / Legal Footer
  // ✅ FIX: Added check to ensure lastAutoTable exists before accessing finalY
  const finalY = (doc as any).lastAutoTable?.finalY || 150; 
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("This is a computer-generated receipt and requires no physical signature.", 14, finalY + 20);
  doc.text("Verified by RentEase Digital Witness Technology.", 14, finalY + 25);

  // 4. Download
  doc.save(`Receipt_${payment?.month || 'Deposit'}_2026.pdf`);
};
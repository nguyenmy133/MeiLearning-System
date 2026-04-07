import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TuitionInvoice } from "@/features/admin/tuition/types";
import { ROBOTO_REGULAR, ROBOTO_BOLD, LOGO_BASE64 } from "./fonts/pdf-assets";
import { formatDate } from "@/lib/dateUtils";

// ── Colors ────────────────────────────────────────────────────────────────────
const COLORS = {
  primary: [13, 148, 136] as [number, number, number],       // teal-600
  primaryDark: [15, 118, 110] as [number, number, number],    // teal-700
  navy: [30, 41, 59] as [number, number, number],             // slate-800
  text: [51, 65, 85] as [number, number, number],             // slate-700
  textLight: [100, 116, 139] as [number, number, number],     // slate-500
  bgLight: [248, 250, 252] as [number, number, number],       // slate-50
  bgCard: [241, 245, 249] as [number, number, number],        // slate-100
  border: [226, 232, 240] as [number, number, number],        // slate-200
  white: [255, 255, 255] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],           // green-600
  orange: [234, 88, 12] as [number, number, number],          // orange-600
  red: [220, 38, 38] as [number, number, number],             // red-600
  blue: [37, 99, 235] as [number, number, number],            // blue-600
  orangeBg: [255, 247, 237] as [number, number, number],      // orange-50
  greenBg: [240, 253, 244] as [number, number, number],       // green-50
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chưa thanh toán",
  paid: "Đã thanh toán",
  overdue: "Quá hạn",
  reviewing: "Chờ đối soát",
};

const STATUS_COLORS: Record<string, { text: [number, number, number]; bg: [number, number, number] }> = {
  pending: { text: COLORS.orange, bg: COLORS.orangeBg },
  paid: { text: COLORS.green, bg: COLORS.greenBg },
  overdue: { text: COLORS.red, bg: [254, 242, 242] },
  reviewing: { text: COLORS.blue, bg: [239, 246, 255] },
};

// ── Font Setup ────────────────────────────────────────────────────────────────
function setupFonts(doc: jsPDF) {
  doc.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", ROBOTO_BOLD);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");
}

// ── Shared Header ─────────────────────────────────────────────────────────────
function drawHeader(doc: jsPDF, pageWidth: number): number {
  const margin = 14;

  // Logo
  try {
    doc.addImage(LOGO_BASE64, "PNG", margin, 8, 22, 22);
  } catch {
    // fallback — draw circle
    doc.setDrawColor(...COLORS.primary);
    doc.circle(margin + 11, 19, 11);
  }

  // Title text
  doc.setFont("Roboto", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.navy);
  doc.text("TRUNG TÂM GIÁO DỤC MEILEARNING", margin + 26, 17);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text("Vocational Education Center", margin + 26, 23);

  // Gradient line
  const lineY = 33;
  const steps = 40;
  const lineLen = pageWidth - margin * 2;
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const r = Math.round(COLORS.primary[0] * (1 - ratio) + COLORS.blue[0] * ratio);
    const g = Math.round(COLORS.primary[1] * (1 - ratio) + COLORS.blue[1] * ratio);
    const b = Math.round(COLORS.primary[2] * (1 - ratio) + COLORS.blue[2] * ratio);
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.8);
    const x1 = margin + (lineLen * i) / steps;
    const x2 = margin + (lineLen * (i + 1)) / steps;
    doc.line(x1, lineY, x2, lineY);
  }

  return lineY + 4; // return Y after header
}

// ── Rounded Rect ──────────────────────────────────────────────────────────────
function drawRoundedRect(
  doc: jsPDF,
  x: number, y: number, w: number, h: number, r: number,
  fill: [number, number, number],
  stroke?: [number, number, number]
) {
  doc.setFillColor(...fill);
  if (stroke) {
    doc.setDrawColor(...stroke);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, r, r, "FD");
  } else {
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function drawStatusBadge(doc: jsPDF, status: string, cx: number, cy: number) {
  const label = STATUS_LABELS[status] ?? status;
  const colors = STATUS_COLORS[status] ?? { text: COLORS.text, bg: COLORS.bgCard };

  doc.setFont("Roboto", "bold");
  doc.setFontSize(9);
  const tw = doc.getTextWidth(label) + 10;
  drawRoundedRect(doc, cx - tw / 2, cy - 4, tw, 8, 2, colors.bg);
  doc.setTextColor(...colors.text);
  doc.text(label, cx, cy + 1, { align: "center" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BẢNG TỔNG HỢP HỌC PHÍ
// ═══════════════════════════════════════════════════════════════════════════════

export function exportInvoiceListPdf(invoices: TuitionInvoice[], title?: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  setupFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  let y = drawHeader(doc, pageWidth);

  // Title
  doc.setFont("Roboto", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.navy);
  doc.text(title ?? "BẢNG TỔNG HỢP HỌC PHÍ", pageWidth / 2, y + 5, { align: "center" });

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    `Ngày xuất: ${formatDate(new Date().toISOString())}  |  Tổng: ${invoices.length} hóa đơn`,
    pageWidth / 2, y + 11, { align: "center" }
  );

  // Table
  autoTable(doc, {
    startY: y + 16,
    head: [["STT", "Học viên", "Lớp", "Tháng", "Có mặt", "Vắng CP", "Vắng KP", "Muộn", "Tính phí", "Đơn giá", "Tổng tiền", "Trạng thái"]],
    body: invoices.map((inv, i) => [
      i + 1,
      inv.studentName ?? "N/A",
      inv.className ?? "N/A",
      inv.month,
      inv.presentSessions ?? 0,
      inv.absentExcusedSessions ?? 0,
      inv.absentUnexcusedSessions ?? 0,
      inv.lateSessions ?? 0,
      inv.billableSessions ?? 0,
      formatCurrency(inv.pricePerSession ?? 0),
      formatCurrency(inv.totalAmount ?? 0),
      STATUS_LABELS[inv.status] ?? inv.status,
    ]),
    styles: {
      font: "Roboto",
      fontSize: 8,
      cellPadding: 3,
      textColor: COLORS.text,
      lineWidth: 0.2,
      lineColor: COLORS.border,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: COLORS.bgLight,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
      7: { halign: "center" },
      8: { halign: "center", fontStyle: "bold" },
      9: { halign: "right" },
      10: { halign: "right", fontStyle: "bold" },
      11: { halign: "center" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 11) {
        const status = invoices[data.row.index]?.status;
        const colors = STATUS_COLORS[status];
        if (colors) {
          data.cell.styles.textColor = colors.text;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  // Footer totals
  const totalAmount = invoices.reduce((s, inv) => s + (inv.totalAmount ?? 0), 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((s, inv) => s + (inv.totalAmount ?? 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  const finalY = (doc as any).lastAutoTable?.finalY ?? 180;

  // Summary box
  drawRoundedRect(doc, margin, finalY + 5, pageWidth - margin * 2, 18, 3, COLORS.bgCard, COLORS.border);

  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text("Tổng doanh thu:", margin + 5, finalY + 13);
  doc.setFont("Roboto", "bold");
  doc.text(formatCurrency(totalAmount), margin + 45, finalY + 13);

  doc.setFont("Roboto", "normal");
  doc.text("Đã thu:", margin + 100, finalY + 13);
  doc.setFont("Roboto", "bold");
  doc.setTextColor(...COLORS.green);
  doc.text(formatCurrency(paidAmount), margin + 120, finalY + 13);

  doc.setFont("Roboto", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text("Chưa thu:", margin + 180, finalY + 13);
  doc.setFont("Roboto", "bold");
  doc.setTextColor(...COLORS.orange);
  doc.text(formatCurrency(pendingAmount), margin + 200, finalY + 13);

  // Footer
  doc.setFont("Roboto", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    "Tài liệu này được tạo tự động bởi hệ thống MeiLearning. Mọi thắc mắc vui lòng liên hệ quản trị viên.",
    pageWidth / 2, finalY + 28, { align: "center" }
  );

  doc.save(`hoc-phi-tong-hop-${new Date().toISOString().slice(0, 10)}.pdf`);
}


// ═══════════════════════════════════════════════════════════════════════════════
// PHIẾU THU HỌC PHÍ  (A5 Portrait)
// ═══════════════════════════════════════════════════════════════════════════════

export function exportReceiptPdf(invoice: TuitionInvoice) {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  setupFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  let y = drawHeader(doc, pageWidth);

  // ── Receipt Title ─────────────────────────────────────────────────────────
  doc.setFont("Roboto", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.navy);
  doc.text("PHIẾU THU HỌC PHÍ", pageWidth / 2, y + 5, { align: "center" });

  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    `Số: #${String(invoice.id).padStart(3, "0")}  |  Ngày: ${invoice.createdAt ? formatDate(invoice.createdAt) : formatDate(new Date().toISOString())}`,
    pageWidth / 2, y + 11, { align: "center" }
  );

  y += 17;

  // ── Student Info Card ─────────────────────────────────────────────────────
  drawRoundedRect(doc, margin, y, contentWidth, 22, 3, COLORS.bgCard, COLORS.border);

  const col1 = margin + 5;
  const col2 = margin + contentWidth / 2 + 5;

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text("Học viên", col1, y + 7);
  doc.text("Lớp", col1, y + 16);
  doc.text("Tháng", col2, y + 7);
  doc.text("Hạn TT", col2, y + 16);

  doc.setFont("Roboto", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text(invoice.studentName ?? "N/A", col1 + 22, y + 7);
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(invoice.className ?? "N/A", col1 + 12, y + 16);
  doc.text(invoice.month, col2 + 16, y + 7);
  doc.text(invoice.dueDate ?? "N/A", col2 + 17, y + 16);

  y += 28;

  // ── Session Breakdown ─────────────────────────────────────────────────────
  doc.setFont("Roboto", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text("Chi tiết buổi học", margin, y);
  y += 4;

  const sessionData = [
    { label: "Có mặt", value: invoice.presentSessions ?? 0, color: COLORS.green },
    { label: "Đi muộn", value: invoice.lateSessions ?? 0, color: COLORS.orange },
    { label: "Vắng không phép", value: invoice.absentUnexcusedSessions ?? 0, color: COLORS.red },
    { label: "Vắng có phép (miễn phí)", value: invoice.absentExcusedSessions ?? 0, color: COLORS.blue },
  ];

  autoTable(doc, {
    startY: y,
    head: [["", "Loại", "Số buổi"]],
    body: [
      ...sessionData.map((s) => ["●", s.label, String(s.value)]),
      ["", "Buổi tính phí", String(invoice.billableSessions ?? 0)],
    ],
    styles: {
      font: "Roboto",
      fontSize: 9,
      cellPadding: 3,
      textColor: COLORS.text,
      lineWidth: 0.2,
      lineColor: COLORS.border,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      2: { halign: "center", cellWidth: 25 },
    },
    didParseCell: (data) => {
      // Color dots
      if (data.section === "body" && data.column.index === 0 && data.row.index < sessionData.length) {
        data.cell.styles.textColor = sessionData[data.row.index].color;
        data.cell.styles.fontStyle = "bold";
      }
      // Bold last row
      if (data.section === "body" && data.row.index === sessionData.length) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = COLORS.bgCard;
      }
    },
    margin: { left: margin, right: margin },
  });

  const tableEndY = (doc as any).lastAutoTable?.finalY ?? y + 50;
  y = tableEndY + 6;

  // ── Financial Section ─────────────────────────────────────────────────────
  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(`Đơn giá:  ${formatCurrency(invoice.pricePerSession ?? 0)} / buổi`, margin, y);
  y += 6;

  if (invoice.discountAmount && invoice.discountAmount > 0) {
    doc.setTextColor(...COLORS.blue);
    doc.text(
      `Giảm giá:  -${formatCurrency(invoice.discountAmount)}` +
        (invoice.discountReason ? `  (${invoice.discountReason})` : ""),
      margin, y
    );
    y += 6;
  }

  // Total amount box
  drawRoundedRect(doc, margin, y, contentWidth, 14, 3, COLORS.bgCard, COLORS.primary);

  doc.setFont("Roboto", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primaryDark);
  doc.text("TỔNG TIỀN:", margin + 5, y + 9);
  doc.text(formatCurrency(invoice.totalAmount ?? 0), margin + contentWidth - 5, y + 9, { align: "right" });

  y += 20;

  // Status badge
  drawStatusBadge(doc, invoice.status, pageWidth / 2, y);

  y += 10;

  // ── Footer ────────────────────────────────────────────────────────────────
  // Separator
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);

  y += 6;
  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text("Cảm ơn quý phụ huynh đã tin tưởng MeiLearning!", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(7);
  doc.text("Hotline: 19001234  |  Email: info@meilearning.vn", pageWidth / 2, y, { align: "center" });

  doc.save(`phieu-thu-${invoice.id}-${invoice.month.replace("/", "-")}.pdf`);
}

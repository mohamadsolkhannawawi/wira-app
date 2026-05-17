import jsPDF from "jspdf";
import type { AnalysisResult } from "@wira-app/shared";

/**
 * Generate a professional analysis report PDF.
 */
export const generateAnalysisPdf = (result: AnalysisResult) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ─── HEADER ─────────────────────────────────────────────────────────
  pdf.setFillColor(10, 79, 61); // primary-800
  pdf.rect(0, 0, pageWidth, 36, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text("WIRA", margin, 16);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Laporan Analisis Lokasi Usaha", margin, 24);

  pdf.setFontSize(8);
  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  pdf.text(dateStr, pageWidth - margin, 24, { align: "right" });
  y = 46;

  // ─── TITLE SECTION ──────────────────────────────────────────────────
  pdf.setTextColor(13, 26, 20);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(result.streetName, margin, y);
  y += 7;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `${result.kelurahan}, ${result.kecamatan} · Jenis Usaha: ${result.bizType}`,
    margin,
    y,
  );
  y += 10;

  // ─── SCORE BOX ──────────────────────────────────────────────────────
  const scoreLabel =
    result.skorPotensi >= 70
      ? "POTENSIAL"
      : result.skorPotensi >= 40
        ? "SEDANG"
        : "RENDAH";
  const scoreColor: [number, number, number] =
    result.skorPotensi >= 70
      ? [34, 197, 94]
      : result.skorPotensi >= 40
        ? [245, 158, 11]
        : [239, 68, 68];

  pdf.setFillColor(245, 248, 246);
  pdf.roundedRect(margin, y, contentWidth, 28, 2, 2, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(32);
  pdf.setTextColor(10, 79, 61);
  pdf.text(result.skorPotensi.toFixed(1), margin + 8, y + 19);

  pdf.setFontSize(10);
  pdf.text("/100", margin + 40, y + 19);

  // Badge
  pdf.setFillColor(...scoreColor);
  const badgeX = margin + 60;
  pdf.roundedRect(badgeX, y + 10, 28, 8, 1, 1, "F");
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text(scoreLabel, badgeX + 14, y + 15.5, { align: "center" });

  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont("helvetica", "normal");
  pdf.text("Skor Potensi Lokasi", margin + 8, y + 7);
  y += 36;

  // ─── METRICS TABLE ──────────────────────────────────────────────────
  y = drawSectionHeader(pdf, "Breakdown Metrik", margin, y, contentWidth);
  y += 2;

  const fitur = result.nilaiFiturJalan;
  const metrics = [
    { label: "Kepadatan Lalu Lintas", value: fitur.traffic_score },
    { label: "Aksesibilitas Transportasi", value: fitur.transit_score },
    { label: "Kepadatan Lokasi Strategis (POI)", value: fitur.poi_score },
    { label: "Tingkat Kompetisi", value: fitur.competitor },
    { label: "Peluang Pasar Tersisa", value: fitur.comp_ratio },
  ];

  metrics.forEach((metric, i) => {
    const rowY = y + i * 9;
    if (i % 2 === 0) {
      pdf.setFillColor(250, 252, 251);
      pdf.rect(margin, rowY - 3, contentWidth, 9, "F");
    }
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    pdf.text(metric.label, margin + 4, rowY + 2);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(10, 79, 61);
    const pct = formatPercent(metric.value);
    pdf.text(pct, pageWidth - margin - 4, rowY + 2, { align: "right" });

    // Mini bar
    const barX = pageWidth - margin - 55;
    const barWidth = 40;
    pdf.setFillColor(230, 235, 232);
    pdf.roundedRect(barX, rowY - 1, barWidth, 3, 1, 1, "F");
    const fillWidth = Math.min(
      barWidth,
      barWidth * (metric.value > 1 ? metric.value / 100 : metric.value),
    );
    pdf.setFillColor(10, 79, 61);
    pdf.roundedRect(barX, rowY - 1, fillWidth, 3, 1, 1, "F");
  });
  y += metrics.length * 9 + 6;

  // ─── AI INSIGHT ─────────────────────────────────────────────────────
  y = checkPageBreak(pdf, y, 40, pageHeight, margin);
  y = drawSectionHeader(pdf, "AI Insight", margin, y, contentWidth);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(60, 60, 60);
  const insightLines = pdf.splitTextToSize(
    result.insight || "Insight tidak tersedia.",
    contentWidth - 8,
  );

  for (const line of insightLines) {
    y = checkPageBreak(pdf, y, 6, pageHeight, margin);
    pdf.text(line as string, margin + 4, y);
    y += 5;
  }
  y += 6;

  // ─── ALTERNATIVES ───────────────────────────────────────────────────
  if (result.rekomendasiAlternatif && result.rekomendasiAlternatif.length > 0) {
    y = checkPageBreak(pdf, y, 30, pageHeight, margin);
    y = drawSectionHeader(
      pdf,
      "Alternatif Lokasi",
      margin,
      y,
      contentWidth,
    );

    result.rekomendasiAlternatif.forEach((alt) => {
      y = checkPageBreak(pdf, y, 18, pageHeight, margin);
      pdf.setFillColor(250, 252, 251);
      pdf.roundedRect(margin, y - 3, contentWidth, 16, 1, 1, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(13, 26, 20);
      pdf.text(
        `#${alt.peringkat} ${alt.nama_jalan}`,
        margin + 4,
        y + 2,
      );
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(alt.kecamatan, margin + 4, y + 8);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(10, 79, 61);
      pdf.text(
        alt.skor_potensi_persen.toFixed(1),
        pageWidth - margin - 4,
        y + 6,
        { align: "right" },
      );
      y += 20;
    });
    y += 4;
  }

  // ─── FOOTER ─────────────────────────────────────────────────────────
  drawFooter(pdf, pageWidth, pageHeight, margin);

  pdf.save(`WIRA_Analisis_${result.streetName.replace(/\s/g, "_")}.pdf`);
};

/**
 * Generate a comparison report PDF.
 */
export const generateComparisonPdf = (
  results: AnalysisResult[],
  narrative: string | null,
  businessType: string,
) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ─── HEADER ─────────────────────────────────────────────────────────
  pdf.setFillColor(10, 79, 61);
  pdf.rect(0, 0, pageWidth, 36, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text("WIRA", margin, 16);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Laporan Perbandingan Lokasi Usaha", margin, 24);

  pdf.setFontSize(8);
  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  pdf.text(dateStr, pageWidth - margin, 24, { align: "right" });
  y = 46;

  pdf.setTextColor(13, 26, 20);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(`Perbandingan Lokasi — ${businessType}`, margin, y);
  y += 10;

  // ─── COMPARISON TABLE ───────────────────────────────────────────────
  const colWidth = contentWidth / results.length;
  const metricLabels = [
    "Skor Potensi",
    "Traffic",
    "Transit",
    "POI",
    "Kompetitor",
    "Peluang",
  ];

  // Column headers
  y = checkPageBreak(pdf, y, 12, pageHeight, margin);
  pdf.setFillColor(10, 79, 61);
  pdf.rect(margin, y - 4, contentWidth, 12, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  results.forEach((r, i) => {
    const cx = margin + colWidth * i + colWidth / 2;
    pdf.text(r.streetName, cx, y + 3, { align: "center", maxWidth: colWidth - 4 });
  });
  y += 12;

  // Sub-header: kelurahan
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  results.forEach((r, i) => {
    const cx = margin + colWidth * i + colWidth / 2;
    pdf.text(`${r.kelurahan}`, cx, y + 2, { align: "center" });
  });
  y += 8;

  // Metric rows
  metricLabels.forEach((label, mi) => {
    y = checkPageBreak(pdf, y, 10, pageHeight, margin);
    if (mi % 2 === 0) {
      pdf.setFillColor(250, 252, 251);
      pdf.rect(margin, y - 3, contentWidth, 9, "F");
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 80);

    results.forEach((r, i) => {
      const cx = margin + colWidth * i + colWidth / 2;
      let val = "";
      const f = r.nilaiFiturJalan;
      switch (mi) {
        case 0:
          val = r.skorPotensi.toFixed(1);
          break;
        case 1:
          val = formatPercent(f.traffic_score);
          break;
        case 2:
          val = formatPercent(f.transit_score);
          break;
        case 3:
          val = formatPercent(f.poi_score);
          break;
        case 4:
          val = formatPercent(f.competitor);
          break;
        case 5:
          val = formatPercent(f.comp_ratio);
          break;
      }

      // Bold the best value in each row
      const allVals = results.map((rr) => {
        const ff = rr.nilaiFiturJalan;
        switch (mi) {
          case 0:
            return rr.skorPotensi;
          case 1:
            return ff.traffic_score;
          case 2:
            return ff.transit_score;
          case 3:
            return ff.poi_score;
          case 4:
            return ff.competitor;
          case 5:
            return ff.comp_ratio;
          default:
            return 0;
        }
      });
      const maxVal = Math.max(...allVals);
      const currentVal = allVals[i];

      if (currentVal === maxVal) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(10, 79, 61);
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(80, 80, 80);
      }

      pdf.text(val, cx, y + 2, { align: "center" });
    });

    // Row label on left
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(130, 130, 130);
    pdf.text(label, margin + 2, y + 2);

    y += 9;
  });
  y += 8;

  // ─── AI NARRATIVE ───────────────────────────────────────────────────
  if (narrative) {
    y = checkPageBreak(pdf, y, 30, pageHeight, margin);
    y = drawSectionHeader(
      pdf,
      "Rekomendasi Strategis AI",
      margin,
      y,
      contentWidth,
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);
    const narrativeLines = pdf.splitTextToSize(narrative, contentWidth - 8);

    for (const line of narrativeLines) {
      y = checkPageBreak(pdf, y, 6, pageHeight, margin);
      pdf.text(line as string, margin + 4, y);
      y += 5;
    }
  }

  // ─── FOOTER ─────────────────────────────────────────────────────────
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    drawFooter(pdf, pageWidth, pageHeight, margin);
  }

  pdf.save(`WIRA_Perbandingan_${businessType}.pdf`);
};

// ─── HELPERS ────────────────────────────────────────────────────────────

function formatPercent(value: number): string {
  const normalized = value > 1 ? value : value * 100;
  return `${Math.round(normalized)}%`;
}

function drawSectionHeader(
  pdf: jsPDF,
  title: string,
  x: number,
  y: number,
  width: number,
): number {
  pdf.setFillColor(10, 79, 61);
  pdf.rect(x, y, 3, 8, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(13, 26, 20);
  pdf.text(title, x + 7, y + 6);

  // Line
  pdf.setDrawColor(230, 235, 232);
  pdf.line(x, y + 10, x + width, y + 10);
  return y + 16;
}

function drawFooter(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
) {
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    "Laporan ini dihasilkan oleh WIRA — Decision Support System untuk UMKM",
    margin,
    pageHeight - 8,
  );
  pdf.text(
    "wira-app.id",
    pageWidth - margin,
    pageHeight - 8,
    { align: "right" },
  );
}

function checkPageBreak(
  pdf: jsPDF,
  y: number,
  neededHeight: number,
  pageHeight: number,
  margin: number,
): number {
  if (y + neededHeight > pageHeight - 20) {
    pdf.addPage();
    return margin;
  }
  return y;
}

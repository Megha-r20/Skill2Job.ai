/**
 * Skill2Job.ai Institutional Export Utilities (CSV & Print/PDF)
 */

/**
 * Escapes a single CSV cell value according to RFC 4180.
 */
function escapeCsvCell(value) {
    if (value === null || value === undefined) return '""';
    const stringVal = String(value);
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return `"${stringVal}"`;
}

/**
 * Generates an RFC 4180 compliant CSV string with UTF-8 BOM.
 * @param {Array<string>} headers - Column titles
 * @param {Array<Array<any>>} rows - Matrix of row cells
 * @returns {string} - Complete CSV content
 */
export function generateCsv(headers, rows) {
    const headerLine = headers.map(escapeCsvCell).join(',');
    const rowLines = rows.map(row => row.map(escapeCsvCell).join(','));
    // Prepend UTF-8 BOM for Microsoft Excel compatibility
    return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

/**
 * Builds an executive print-ready HTML document suitable for browser PDF export.
 */
export function generatePrintableReportHtml({
    collegeName = 'Apex University of Engineering',
    reportTitle = 'Institutional Placement & Department Intelligence Report',
    batchYear = '2026',
    generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    summaryMetrics = [],
    headers = [],
    rows = [],
    notes = ''
}) {
    const summaryCardsHtml = summaryMetrics.map(m => `
        <div style="flex: 1; min-width: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">${m.label}</div>
            <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px;">${m.value}</div>
            ${m.sub ? `<div style="font-size: 10px; color: #10b981; font-weight: 600; margin-top: 2px;">${m.sub}</div>` : ''}
        </div>
    `).join('');

    const tableHeadersHtml = headers.map(h => `
        <th style="background-color: #0f172a; color: #ffffff; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #1e293b;">
            ${h}
        </th>
    `).join('');

    const tableRowsHtml = rows.map((row, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
            ${row.map(cell => `
                <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 12px; color: #334155;">
                    ${cell}
                </td>
            `).join('')}
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>${reportTitle} - ${collegeName}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 15mm;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 20px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }
        .report-title {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
            margin: 0;
            letter-spacing: -0.02em;
        }
        .college-sub {
            font-size: 13px;
            color: #4f46e5;
            font-weight: 700;
            margin-top: 4px;
        }
        .meta-text {
            font-size: 11px;
            color: #64748b;
            text-align: right;
        }
        .summary-grid {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        .footer-signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
        }
        .signature-line {
            width: 220px;
            border-top: 1px solid #94a3b8;
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            color: #475569;
        }
        @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #4f46e5; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            🖨️ Print / Save as PDF
        </button>
    </div>

    <div class="header-bar">
        <div>
            <h1 class="report-title">${reportTitle}</h1>
            <div class="college-sub">${collegeName} • Placement Directorate</div>
        </div>
        <div class="meta-text">
            <div>Graduating Batch: <strong>Class of ${batchYear}</strong></div>
            <div>Generated Date: <strong>${generatedDate}</strong></div>
            <div>System: <strong>Skill2Job.ai Verified Audit</strong></div>
        </div>
    </div>

    ${summaryMetrics.length > 0 ? `<div class="summary-grid">${summaryCardsHtml}</div>` : ''}

    <table>
        <thead>
            <tr>${tableHeadersHtml}</tr>
        </thead>
        <tbody>
            ${tableRowsHtml}
        </tbody>
    </table>

    ${notes ? `
        <div style="font-size: 11px; color: #64748b; line-height: 1.5; margin-bottom: 24px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong>Institutional Notes:</strong> ${notes}
        </div>
    ` : ''}

    <div class="footer-signatures">
        <div>
            <div class="signature-line">Placement & Training Officer</div>
        </div>
        <div>
            <div class="signature-line">Dean of Academic Affairs</div>
        </div>
        <div>
            <div class="signature-line">Director / Principal</div>
        </div>
    </div>
</body>
</html>
    `.trim();
}

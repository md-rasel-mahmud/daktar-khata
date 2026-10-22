/**
 * Print & PDF Export Utility for Daktar Khata
 * Supports:
 * - A4 Professional Portrait Page (Hospital Letterhead, Full Bills, Medical Reports)
 * - POS Thermal Receipt (80mm width standard thermal roll printer)
 */

export interface PrintDocumentOptions {
  title: string
  mode: "A4" | "POS"
  htmlContent: string
}

export function printHtmlDocument({ title, mode, htmlContent }: PrintDocumentOptions) {
  // Create an invisible iframe
  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "0"
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  const isPOS = mode === "POS"

  const styles = `
    @page {
      size: ${isPOS ? "80mm auto" : "A4 portrait"};
      margin: ${isPOS ? "2mm 3mm" : "10mm 12mm"};
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: ${isPOS ? "4px" : "12px"};
      color: #0f172a;
      background: #ffffff;
      font-size: ${isPOS ? "11px" : "13px"};
      line-height: ${isPOS ? "1.25" : "1.4"};
      width: ${isPOS ? "72mm" : "100%"};
      max-width: ${isPOS ? "72mm" : "100%"};
    }
    h1, h2, h3, h4, p { margin: 0; }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-bold { font-weight: 700; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    .border-b { border-bottom: 1px solid #cbd5e1; }
    .border-t { border-top: 1px solid #cbd5e1; }
    .border-dashed { border-style: dashed; }
    .divider { border-top: 1px dashed #64748b; margin: 8px 0; }
    .tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }
    .tag-paid { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .tag-due { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .tag-confirmed { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
    @media print {
      body {
        margin: 0;
      }
    }
  `

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `)
  doc.close()

  iframe.contentWindow?.focus()
  setTimeout(() => {
    iframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1500)
  }, 250)
}

export function downloadDocumentAsPdf({ title, mode, htmlContent }: PrintDocumentOptions) {
  // Triggers browser native PDF export / print dialog with preset filename
  printHtmlDocument({ title, mode, htmlContent })
}

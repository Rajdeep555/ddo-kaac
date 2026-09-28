import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const escapeCSV = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    const stringValue = String(value);

    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
    ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

export const downloadCSV = ({
    columns,
    data,
    filename = "tax-details.csv",
}) => {
    const headers = columns.map((column) => column.label);

    const rows = data.map((row) =>
        columns.map((column) => {
            if (column.exportValue) {
                return column.exportValue(row);
            }

            return row[column.key] ?? "";
        })
    );

    const csv = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) =>
            row.map(escapeCSV).join(",")
        ),
    ].join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
};

export const downloadPDF = ({
    columns,
    data,
    filename = "tax-details.pdf",
    title = "Tax Details",
}) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    doc.setFontSize(9);
    doc.text(
        `Generated: ${new Date().toLocaleString("en-IN")}`,
        14,
        21
    );

    const headers = columns.map((column) => column.label);

    const rows = data.map((row) =>
        columns.map((column) => {
            if (column.exportValue) {
                return column.exportValue(row);
            }

            return row[column.key] ?? "";
        })
    );

    autoTable(doc, {
        startY: 26,
        head: [headers],
        body: rows,
        styles: {
            fontSize: 7,
            cellPadding: 2,
        },
        headStyles: {
            fontSize: 7,
        },
    });

    doc.save(filename);
};

export const printTable = ({
    columns,
    data,
    title = "Tax Details",
}) => {
    const headers = columns
        .map((column) => `<th>${column.label}</th>`)
        .join("");

    const rows = data
        .map((row) => {
            const cells = columns
                .map((column) => {
                    const value = column.exportValue
                        ? column.exportValue(row)
                        : row[column.key] ?? "";

                    return `<td>${value}</td>`;
                })
                .join("");

            return `<tr>${cells}</tr>`;
        })
        .join("");

    const printWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800"
    );

    if (!printWindow) {
        alert("Please allow pop-ups to print.");
        return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #111827;
          }

          h1 {
            margin-bottom: 5px;
          }

          .date {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 6px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }

          @media print {
            body {
              padding: 0;
            }

            @page {
              size: landscape;
              margin: 10mm;
            }
          }
        </style>
      </head>

      <body>
        <h1>${title}</h1>

        <div class="date">
          Generated: ${new Date().toLocaleString("en-IN")}
        </div>

        <table>
          <thead>
            <tr>
              ${headers}
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 300);
};
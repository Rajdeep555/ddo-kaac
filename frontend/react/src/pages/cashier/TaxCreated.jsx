import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../services/api";

const TaxCreated = () => {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [ddos, setDdos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ddoLoading, setDdoLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");
  const [ddoId, setDdoId] = useState("");
  const [natureOfTax, setNatureOfTax] = useState("");
  const [headOfAccount, setHeadOfAccount] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [challanNo, setChallanNo] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [treasuryCode, setTreasuryCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // =========================================================
  // PAGINATION
  // =========================================================

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [showFilters, setShowFilters] = useState(false);

  // =========================================================
  // FETCH DDOs
  // =========================================================

  const fetchDdos = async () => {
    try {
      setDdoLoading(true);

      const response = await api.get("/cashier/ddos");

      setDdos(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load DDOs:", error);
    } finally {
      setDdoLoading(false);
    }
  };

  // =========================================================
  // FETCH CASHIER SUBMISSIONS
  // =========================================================

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cashier/submissions", {
        params: {
          page,
          limit: 10,

          search: search.trim() || undefined,

          ddoId: ddoId || undefined,

          natureOfTax: natureOfTax.trim() || undefined,

          headOfAccount: headOfAccount.trim() || undefined,

          receiptNo: receiptNo.trim() || undefined,

          challanNo: challanNo.trim() || undefined,

          voucherNo: voucherNo.trim() || undefined,

          treasuryCode: treasuryCode.trim() || undefined,

          from: from || undefined,

          to: to || undefined,

          minAmount: minAmount || undefined,

          maxAmount: maxAmount || undefined,
        },
      });

      setSubmissions(response.data?.data || []);

      setPagination(
        response.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      );
    } catch (error) {
      console.error("Failed to fetch submissions:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load submitted tax records.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchDdos();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [
    page,
    search,
    ddoId,
    natureOfTax,
    headOfAccount,
    receiptNo,
    challanNo,
    voucherNo,
    treasuryCode,
    from,
    to,
    minAmount,
    maxAmount,
  ]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setDdoId("");
    setNatureOfTax("");
    setHeadOfAccount("");
    setReceiptNo("");
    setChallanNo("");
    setVoucherNo("");
    setTreasuryCode("");
    setFrom("");
    setTo("");
    setMinAmount("");
    setMaxAmount("");
    setPage(1);
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchSubmissions();
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-GB");
  };

  // =========================================================
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = (value) => {
    if (value === null || value === undefined) {
      return "0.00";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00";
    }

    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================================================
  // CSV ESCAPE
  // =========================================================

  const escapeCSV = (value) => {
    const stringValue = String(value ?? "");

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  // =========================================================
  // DOWNLOAD CSV
  // =========================================================

  const downloadCSV = () => {
    if (!submissions.length) {
      alert("No tax records available to download.");
      return;
    }

    const headers = [
      "Date",
      "DDO Code",
      "DDO Name",
      "Nature of Tax",
      "Head of Account",
      "Receipt No.",
      "Amount",
      "Payee Name & Address",
      "Collector Name",
      "Date of Deposit",
      "Treasury Name",
      "Treasury Code",
      "Challan No.",
      "Voucher No.",
      "Date of Voucher",
    ];

    const rows = submissions.map((submission) => [
      formatDate(submission.date),
      submission.ddo?.ddoCode || "",
      submission.ddo?.name || "",
      submission.natureOfTax || "",
      submission.headOfAccount || "",
      submission.receiptNo || "",
      formatAmount(submission.amount),
      submission.payeeNameAddress || "",
      submission.collectorName || "",
      formatDate(submission.dateOfDeposit),
      submission.treasuryName || "",
      submission.treasuryCode || "",
      submission.challanNo || "",
      submission.voucherNo || "",
      formatDate(submission.dateOfVoucher),
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `tax-submissions-page-${page}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadPDF = () => {
    if (!submissions.length) {
      alert("No tax records available to download.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(16);
    doc.text("Tax Submissions", 14, 15);

    doc.setFontSize(9);

    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 21);

    doc.text(`Page: ${page}`, 270, 21);

    const tableData = submissions.map((submission) => [
      formatDate(submission.date),
      submission.ddo?.ddoCode || "-",
      submission.ddo?.name || "-",
      submission.natureOfTax || "-",
      submission.headOfAccount || "-",
      submission.receiptNo || "-",
      formatAmount(submission.amount),
      submission.treasuryCode || "-",
      submission.challanNo || "-",
      submission.voucherNo || "-",
      formatDate(submission.dateOfVoucher),
    ]);

    autoTable(doc, {
      startY: 27,

      head: [
        [
          "Date",
          "DDO Code",
          "DDO Name",
          "Nature",
          "Head",
          "Receipt",
          "Amount",
          "Treasury",
          "Challan",
          "Voucher",
          "Voucher Date",
        ],
      ],

      body: tableData,

      styles: {
        fontSize: 6.5,
        cellPadding: 2,
        overflow: "linebreak",
      },

      headStyles: {
        fontSize: 6.5,
        fontStyle: "bold",
      },

      columnStyles: {
        6: {
          halign: "right",
        },
      },

      margin: {
        left: 8,
        right: 8,
      },
    });

    doc.save(`tax-submissions-page-${page}.pdf`);
  };

  // =========================================================
  // PRINT
  // =========================================================

  const handlePrint = () => {
    if (!submissions.length) {
      alert("No tax records available to print.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1400,height=900");

    if (!printWindow) {
      alert("Unable to open print window. Please allow pop-ups for this site.");

      return;
    }

    const rows = submissions
      .map(
        (submission, index) => `
          <tr>
            <td>${(page - 1) * pagination.limit + index + 1}</td>
            <td>${formatDate(submission.date)}</td>
            <td>
              ${submission.ddo?.ddoCode || "-"}<br />
              <small>${submission.ddo?.name || "-"}</small>
            </td>
            <td>${submission.natureOfTax || "-"}</td>
            <td>${submission.headOfAccount || "-"}</td>
            <td>${submission.receiptNo || "-"}</td>
            <td class="amount">${formatAmount(submission.amount)}</td>
            <td>${submission.payeeNameAddress || "-"}</td>
            <td>${submission.collectorName || "-"}</td>
            <td>${formatDate(submission.dateOfDeposit)}</td>
            <td>${submission.treasuryName || "-"}</td>
            <td>${submission.treasuryCode || "-"}</td>
            <td>${submission.challanNo || "-"}</td>
            <td>${submission.voucherNo || "-"}</td>
            <td>${formatDate(submission.dateOfVoucher)}</td>
          </tr>
        `,
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Submissions</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #111827;
            }

            h1 {
              margin: 0 0 5px;
              font-size: 22px;
            }

            .subtitle {
              margin-bottom: 18px;
              color: #64748b;
              font-size: 12px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
            }

            th,
            td {
              border: 1px solid #cbd5e1;
              padding: 6px;
              text-align: left;
              vertical-align: top;
            }

            th {
              background: #f1f5f9;
              font-weight: bold;
            }

            .amount {
              text-align: right;
              font-weight: bold;
              white-space: nowrap;
            }

            small {
              color: #64748b;
            }

            @page {
              size: landscape;
              margin: 10mm;
            }

            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>

        <body>
          <h1>Tax Submissions</h1>

          <div class="subtitle">
            Generated: ${new Date().toLocaleString("en-IN")}
            &nbsp; | &nbsp;
            Page: ${page}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>DDO</th>
                <th>Nature of Tax</th>
                <th>Head of Account</th>
                <th>Receipt No.</th>
                <th>Amount</th>
                <th>Payee</th>
                <th>Collector</th>
                <th>Deposit Date</th>
                <th>Treasury</th>
                <th>Treasury Code</th>
                <th>Challan No.</th>
                <th>Voucher No.</th>
                <th>Voucher Date</th>
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
    }, 500);
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-[1800px]">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Created Tax Data
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View and manage your submitted tax records.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Create */}
              <button
                type="button"
                onClick={() => navigate("/cashier/tax/create")}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                + Create Tax
              </button>

              {/* CSV */}
              <button
                type="button"
                onClick={downloadCSV}
                disabled={loading || submissions.length === 0}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">
                Download CSV
              </button>

              {/* PDF */}
              <button
                type="button"
                onClick={downloadPDF}
                disabled={loading || submissions.length === 0}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
                Download PDF
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={loading || submissions.length === 0}
                className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50">
                Print
              </button>

              {/* Refresh */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50">
                {loading ? "Loading..." : "Refresh"}
              </button>

              {/* Filters */}
              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                {showFilters ? "Hide Filters" : "Filters"}
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* =====================================================
            FILTERS
        ====================================================== */}

        {showFilters && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Search & Filter
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Filter your submitted tax records.
                </p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-left text-sm font-semibold text-blue-600 hover:text-blue-700 sm:text-right">
                Clear Filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Search */}
              <div className="xl:col-span-2">
                <label className="form-label">Search</label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Receipt, challan, voucher, payee..."
                  className="form-input"
                />
              </div>

              {/* DDO */}
              <div>
                <label className="form-label">DDO</label>

                <select
                  value={ddoId}
                  onChange={(e) => {
                    setDdoId(e.target.value);
                    setPage(1);
                  }}
                  className="form-input"
                  disabled={ddoLoading}>
                  <option value="">
                    {ddoLoading ? "Loading..." : "All DDOs"}
                  </option>

                  {ddos.map((ddo) => (
                    <option key={ddo.id} value={ddo.id}>
                      {ddo.ddoCode} - {ddo.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nature */}
              <div>
                <label className="form-label">Nature of Tax</label>

                <input
                  type="text"
                  value={natureOfTax}
                  onChange={(e) => {
                    setNatureOfTax(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Nature of tax"
                  className="form-input"
                />
              </div>

              {/* Head */}
              <div>
                <label className="form-label">Head of Account</label>

                <input
                  type="text"
                  value={headOfAccount}
                  onChange={(e) => {
                    setHeadOfAccount(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Head of account"
                  className="form-input"
                />
              </div>

              {/* Receipt */}
              <div>
                <label className="form-label">Receipt No.</label>

                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => {
                    setReceiptNo(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Receipt number"
                  className="form-input"
                />
              </div>

              {/* Challan */}
              <div>
                <label className="form-label">Challan No.</label>

                <input
                  type="text"
                  value={challanNo}
                  onChange={(e) => {
                    setChallanNo(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Challan number"
                  className="form-input"
                />
              </div>

              {/* Voucher */}
              <div>
                <label className="form-label">Voucher No.</label>

                <input
                  type="text"
                  value={voucherNo}
                  onChange={(e) => {
                    setVoucherNo(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Voucher number"
                  className="form-input"
                />
              </div>

              {/* Treasury */}
              <div>
                <label className="form-label">Treasury Code</label>

                <input
                  type="text"
                  value={treasuryCode}
                  onChange={(e) => {
                    setTreasuryCode(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Treasury code"
                  className="form-input"
                />
              </div>

              {/* From */}
              <div>
                <label className="form-label">From Date</label>

                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                  className="form-input"
                />
              </div>

              {/* To */}
              <div>
                <label className="form-label">To Date</label>

                <input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                  className="form-input"
                />
              </div>

              {/* Minimum */}
              <div>
                <label className="form-label">Minimum Amount</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                    setPage(1);
                  }}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>

              {/* Maximum */}
              <div>
                <label className="form-label">Maximum Amount</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                    setPage(1);
                  }}
                  placeholder="0.00"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Table header */}
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">My Tax Submissions</h2>

            <p className="mt-1 text-sm text-slate-500">
              {pagination.total || 0} record
              {pagination.total === 1 ? "" : "s"} found
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            /* Empty */
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                📄
              </div>

              <h3 className="font-semibold text-slate-900">
                No tax records found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No submitted tax records match your filters.
              </p>
            </div>
          ) : (
            /* Table */
            <div className="overflow-x-auto">
              <table className="min-w-[1800px] w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      DDO
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nature of Tax
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Head of Account
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Receipt No.
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payee
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Collector
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Deposit Date
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Treasury
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Treasury Code
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Challan No.
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Voucher No.
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Voucher Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {submissions.map((submission, index) => (
                    <tr
                      key={submission.id}
                      className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {(page - 1) * pagination.limit + index + 1}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {formatDate(submission.date)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {submission.ddo?.ddoCode || "-"}
                        </div>

                        <div className="text-xs text-slate-500">
                          {submission.ddo?.name || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {submission.natureOfTax || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {submission.headOfAccount || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        {submission.receiptNo || "-"}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                        {formatAmount(submission.amount)}
                      </td>

                      <td className="max-w-[250px] px-5 py-4 text-sm text-slate-700">
                        <div className="line-clamp-2">
                          {submission.payeeNameAddress || "-"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {submission.collectorName || "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {formatDate(submission.dateOfDeposit)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {submission.treasuryName || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {submission.treasuryCode || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {submission.challanNo || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {submission.voucherNo || "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                        {formatDate(submission.dateOfVoucher)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* =====================================================
              PAGINATION
          ====================================================== */}

          {!loading && submissions.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages || 1}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((value) => value - 1)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxCreated;

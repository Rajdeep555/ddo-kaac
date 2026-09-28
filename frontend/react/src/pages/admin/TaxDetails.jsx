import { useCallback, useEffect, useState } from "react";

import api from "../../services/api";
import Loader from "../../components/common/Loader";
import useSocket from "../../hooks/useSocket";

/* -------------------------------- */
/* Styles */
/* -------------------------------- */

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/15";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 disabled:cursor-not-allowed disabled:opacity-50";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md bg-blue-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 disabled:cursor-not-allowed disabled:opacity-50";

/* -------------------------------- */
/* Component */
/* -------------------------------- */

const TaxDetails = () => {
  /* -------------------------------- */
  /* Data */
  /* -------------------------------- */

  const [submissions, setSubmissions] = useState([]);

  const [ddos, setDdos] = useState([]);

  /* -------------------------------- */
  /* Loading */
  /* -------------------------------- */

  const [loading, setLoading] = useState(true);

  const [loadingDdos, setLoadingDdos] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /* -------------------------------- */
  /* Errors */
  /* -------------------------------- */

  const [error, setError] = useState("");

  /* -------------------------------- */
  /* Filters */
  /* -------------------------------- */

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

  /* -------------------------------- */
  /* Pagination */
  /* -------------------------------- */

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  /* -------------------------------- */
  /* Socket notification */
  /* -------------------------------- */

  const [newSubmission, setNewSubmission] = useState(null);

  /* -------------------------------- */
  /* Fetch DDOs */
  /* -------------------------------- */

  const fetchDdos = useCallback(async () => {
    try {
      setLoadingDdos(true);

      const response = await api.get("/admin/ddos", {
        params: {
          page: 1,
          limit: 1000,
          isActive: true,
        },
      });

      setDdos(response.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch DDOs:", err);
    } finally {
      setLoadingDdos(false);
    }
  }, []);

  /* -------------------------------- */
  /* Fetch submissions */
  /* -------------------------------- */

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 20,
      };

      /*
       * Existing backend filters
       */

      if (search.trim()) {
        params.search = search.trim();
      }

      if (ddoId) {
        params.ddoId = ddoId;
      }

      if (treasuryCode.trim()) {
        params.treasuryCode = treasuryCode.trim();
      }

      if (from) {
        params.from = from;
      }

      if (to) {
        params.to = to;
      }

      /*
       * Additional filters.
       *
       * These are sent only if your backend
       * supports them.
       */

      if (natureOfTax.trim()) {
        params.natureOfTax = natureOfTax.trim();
      }

      if (headOfAccount.trim()) {
        params.headOfAccount = headOfAccount.trim();
      }

      if (receiptNo.trim()) {
        params.receiptNo = receiptNo.trim();
      }

      if (challanNo.trim()) {
        params.challanNo = challanNo.trim();
      }

      if (voucherNo.trim()) {
        params.voucherNo = voucherNo.trim();
      }

      if (minAmount !== "") {
        params.minAmount = minAmount;
      }

      if (maxAmount !== "") {
        params.maxAmount = maxAmount;
      }

      const response = await api.get("/admin/submissions", {
        params,
      });

      setSubmissions(response.data?.data || []);

      setPagination(
        response.data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      );

      setError("");
    } catch (err) {
      console.error("Tax details error:", err);

      setError(
        err.response?.data?.message || "Unable to load tax submissions.",
      );
    } finally {
      setLoading(false);
    }
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

  /* -------------------------------- */
  /* Socket: New submission */
  /* -------------------------------- */

  const handleNewSubmission = useCallback((submission) => {
    console.log("New submission received on Tax Details:", submission);

    /*
     * DO NOT automatically push the
     * submission into the current table.
     *
     * The current table may have:
     * - DDO filter
     * - date filter
     * - search
     * - amount filter
     * - pagination
     *
     * Instead show a refresh notification.
     */

    setNewSubmission(submission);
  }, []);

  /* -------------------------------- */
  /* Socket connection */
  /* -------------------------------- */

  useSocket({
    onNewSubmission: handleNewSubmission,
  });

  /* -------------------------------- */
  /* Initial DDO load */
  /* -------------------------------- */

  useEffect(() => {
    fetchDdos();
  }, [fetchDdos]);

  /* -------------------------------- */
  /* Load submissions */
  /* -------------------------------- */

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  /* -------------------------------- */
  /* Reset page when filters change */
  /* -------------------------------- */

  useEffect(() => {
    setPage(1);
  }, [
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

  /* -------------------------------- */
  /* Refresh */
  /* -------------------------------- */

  const refreshData = async () => {
    try {
      setRefreshing(true);

      await fetchSubmissions();

      setNewSubmission(null);
    } finally {
      setRefreshing(false);
    }
  };

  /* -------------------------------- */
  /* Clear filters */
  /* -------------------------------- */

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

  /* -------------------------------- */
  /* Format amount */
  /* -------------------------------- */

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  /* -------------------------------- */
  /* Format date */
  /* -------------------------------- */

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* -------------------------------- */
  /* Export CSV */
  /* -------------------------------- */

  const exportCSV = () => {
    if (submissions.length === 0) {
      return;
    }

    const headers = [
      "Date",
      "DDO Code",
      "DDO Name",
      "Nature of Tax",
      "Head of Account",
      "Receipt No",
      "Amount",
      "Payee Name & Address",
      "Collector Name",
      "Date of Deposit",
      "Treasury Name",
      "Treasury Code",
      "Challan No",
      "Voucher No",
      "Date of Voucher",
      "Status",
      "Cashier",
    ];

    const escapeCSV = (value) => {
      const stringValue = String(value ?? "");

      return `"${stringValue.replaceAll('"', '""')}"`;
    };

    const rows = submissions.map((item) => [
      formatDate(item.date),

      item.ddo?.ddoCode || "",

      item.ddo?.name || "",

      item.natureOfTax || "",

      item.headOfAccount || "",

      item.receiptNo || "",

      Number(item.amount || 0).toFixed(2),

      item.payeeNameAddress || "",

      item.collectorName || "",

      formatDate(item.dateOfDeposit),

      item.treasuryName || "",

      item.treasuryCode || "",

      item.challanNo || "",

      item.voucherNo || "",

      formatDate(item.dateOfVoucher),

      item.status || "",

      item.cashier?.name || "",
    ]);

    const csv = [
      headers.map(escapeCSV).join(","),

      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `tax-submissions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* -------------------------------- */
  /* Print */
  /* -------------------------------- */

  const printTable = () => {
    window.print();
  };

  /* -------------------------------- */
  /* Active filters */
  /* -------------------------------- */

  const hasFilters = Boolean(
    search ||
    ddoId ||
    natureOfTax ||
    headOfAccount ||
    receiptNo ||
    challanNo ||
    voucherNo ||
    treasuryCode ||
    from ||
    to ||
    minAmount ||
    maxAmount,
  );

  /* -------------------------------- */
  /* Pagination */
  /* -------------------------------- */

  const rangeStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const rangeEnd = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  /* -------------------------------- */
  /* Render */
  /* -------------------------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tax details</h1>

          <p className="mt-1 text-sm text-slate-600">
            Search, filter and export submitted tax records
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCSV}
            disabled={loading || submissions.length === 0}
            className={secondaryButton}>
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
              />
            </svg>
            CSV
          </button>

          <button
            type="button"
            onClick={printTable}
            disabled={loading || submissions.length === 0}
            className={secondaryButton}>
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z"
              />
            </svg>
            Print
          </button>

          <button
            type="button"
            onClick={refreshData}
            disabled={refreshing}
            className={primaryButton}>
            <svg
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M5.5 9A7.5 7.5 0 0118.5 6M18.5 15A7.5 7.5 0 015.5 18"
              />
            </svg>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* NEW SUBMISSION */}

      {newSubmission && (
        <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">
              New tax submission received
            </p>

            <p className="mt-1 text-xs text-blue-700">
              Receipt No: {newSubmission.receiptNo || "-"}
              {" • "}
              Amount: ₹{formatAmount(newSubmission.amount)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={refreshData}
              disabled={refreshing}
              className="rounded-md bg-blue-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
              Refresh Data
            </button>

            <button
              type="button"
              onClick={() => setNewSubmission(null)}
              className="rounded-md border border-blue-200 bg-white px-3.5 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={refreshData}
            className="text-sm font-semibold text-red-800 hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* FILTERS */}

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Search & filters
              </h2>

              <p className="text-sm text-slate-600">
                Filter tax records without continuously querying the database.
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-blue-900 hover:underline">
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Search */}

            <div className="xl:col-span-2">
              <label
                htmlFor="search"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Search
              </label>

              <input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search receipt, challan, voucher, payee..."
                className={inputClass}
              />
            </div>

            {/* DDO */}

            <div>
              <label
                htmlFor="ddoId"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                DDO
              </label>

              <select
                id="ddoId"
                value={ddoId}
                onChange={(e) => setDdoId(e.target.value)}
                disabled={loadingDdos}
                className={inputClass}>
                <option value="">All DDOs</option>

                {ddos.map((ddo) => (
                  <option key={ddo.id} value={ddo.id}>
                    {ddo.ddoCode} - {ddo.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Nature */}

            <div>
              <label
                htmlFor="natureOfTax"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Nature of tax
              </label>

              <input
                id="natureOfTax"
                value={natureOfTax}
                onChange={(e) => setNatureOfTax(e.target.value)}
                placeholder="e.g. GST"
                className={inputClass}
              />
            </div>

            {/* Head */}

            <div>
              <label
                htmlFor="headOfAccount"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Head of account
              </label>

              <input
                id="headOfAccount"
                value={headOfAccount}
                onChange={(e) => setHeadOfAccount(e.target.value)}
                placeholder="Head of account"
                className={inputClass}
              />
            </div>

            {/* Receipt */}

            <div>
              <label
                htmlFor="receiptNo"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Receipt no.
              </label>

              <input
                id="receiptNo"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="Receipt number"
                className={inputClass}
              />
            </div>

            {/* Treasury */}

            <div>
              <label
                htmlFor="treasuryCode"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Treasury code
              </label>

              <input
                id="treasuryCode"
                value={treasuryCode}
                onChange={(e) => setTreasuryCode(e.target.value)}
                placeholder="Treasury code"
                className={inputClass}
              />
            </div>

            {/* Challan */}

            <div>
              <label
                htmlFor="challanNo"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Challan no.
              </label>

              <input
                id="challanNo"
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                placeholder="Challan number"
                className={inputClass}
              />
            </div>

            {/* Voucher */}

            <div>
              <label
                htmlFor="voucherNo"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Voucher no.
              </label>

              <input
                id="voucherNo"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="Voucher number"
                className={inputClass}
              />
            </div>

            {/* From */}

            <div>
              <label
                htmlFor="from"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                From date
              </label>

              <input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* To */}

            <div>
              <label
                htmlFor="to"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                To date
              </label>

              <input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Min amount */}

            <div>
              <label
                htmlFor="minAmount"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Minimum amount
              </label>

              <input
                id="minAmount"
                type="number"
                min="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>

            {/* Max amount */}

            <div>
              <label
                htmlFor="maxAmount"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Maximum amount
              </label>

              <input
                id="maxAmount"
                type="number"
                min="0"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TABLE */}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Tax submissions
            </h2>

            <p className="mt-0.5 text-sm text-slate-600">
              {pagination.total || 0} total records
            </p>
          </div>

          {hasFilters && (
            <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
              Filters active
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-5">
            <Loader type="table" rows={10} />
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-6 w-6 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No tax submissions found
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1700px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <TableHead>Date</TableHead>

                  <TableHead>DDO</TableHead>

                  <TableHead>Nature of tax</TableHead>

                  <TableHead>Head of account</TableHead>

                  <TableHead>Receipt no.</TableHead>

                  <TableHead>Amount</TableHead>

                  <TableHead>Payee name & address</TableHead>

                  <TableHead>Collector</TableHead>

                  <TableHead>Deposit date</TableHead>

                  <TableHead>Treasury</TableHead>

                  <TableHead>Treasury code</TableHead>

                  <TableHead>Challan no.</TableHead>

                  <TableHead>Voucher no.</TableHead>

                  <TableHead>Voucher date</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead>Cashier</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="transition hover:bg-slate-50">
                    <TableCell>{formatDate(submission.date)}</TableCell>

                    <TableCell>
                      <p className="font-semibold text-slate-800">
                        {submission.ddo?.ddoCode || "-"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {submission.ddo?.name || ""}
                      </p>
                    </TableCell>

                    <TableCell>{submission.natureOfTax || "-"}</TableCell>

                    <TableCell>{submission.headOfAccount || "-"}</TableCell>

                    <TableCell strong>{submission.receiptNo || "-"}</TableCell>

                    <TableCell>
                      <span className="font-semibold tabular-nums text-slate-900">
                        ₹{formatAmount(submission.amount)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <p
                        className="max-w-[260px] whitespace-normal font-medium text-slate-800"
                        title={submission.payeeNameAddress}>
                        {submission.payeeNameAddress || "-"}
                      </p>
                    </TableCell>

                    <TableCell>{submission.collectorName || "-"}</TableCell>

                    <TableCell>
                      {formatDate(submission.dateOfDeposit)}
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-slate-800">
                        {submission.treasuryName || "-"}
                      </p>
                    </TableCell>

                    <TableCell>{submission.treasuryCode || "-"}</TableCell>

                    <TableCell>{submission.challanNo || "-"}</TableCell>

                    <TableCell>{submission.voucherNo || "-"}</TableCell>

                    <TableCell>
                      {formatDate(submission.dateOfVoucher)}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={submission.status} />
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-slate-800">
                        {submission.cashier?.name || "-"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {submission.cashier?.email || ""}
                      </p>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}

        {!loading && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-medium text-slate-900">
                {rangeStart}–{rangeEnd}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-900">
                {pagination.total}
              </span>
              <span className="text-slate-500">
                {" "}
                (page {pagination.page} of {pagination.totalPages})
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage || loading}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className={secondaryButton}>
                Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => setPage((current) => current + 1)}
                className={secondaryButton}>
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

/* -------------------------------- */
/* Table Head */
/* -------------------------------- */

const TableHead = ({ children, align = "left" }) => {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700 ${
        align === "right" ? "text-right" : "text-left"
      }`}>
      {children}
    </th>
  );
};

/* -------------------------------- */
/* Table Cell */
/* -------------------------------- */

const TableCell = ({ children, strong = false, align = "left" }) => {
  return (
    <td
      className={`px-4 py-3.5 text-sm ${
        align === "right" ? "text-right" : "text-left"
      } ${strong ? "font-semibold text-slate-900" : "text-slate-600"}`}>
      {children}
    </td>
  );
};

/* -------------------------------- */
/* Status Badge */
/* -------------------------------- */

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: {
      badge: "bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
    },

    APPROVED: {
      badge: "bg-green-50 text-green-800",
      dot: "bg-green-600",
    },

    REJECTED: {
      badge: "bg-red-50 text-red-800",
      dot: "bg-red-600",
    },
  };

  const style = styles[status] || {
    badge: "bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
  };

  const label = status
    ? status.charAt(0) + status.slice(1).toLowerCase()
    : "Unknown";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />

      {label}
    </span>
  );
};

export default TaxDetails;

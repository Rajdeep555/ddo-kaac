import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../services/api";
import Loader from "../../components/common/Loader";
import useSocket from "../../hooks/useSocket";

/* -------------------------------- */
/* Shared styles & constants */
/* -------------------------------- */

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/15";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 disabled:cursor-not-allowed disabled:opacity-50";

const CHART_COLORS = [
  "#1e3a8a",
  "#0f766e",
  "#b45309",
  "#475569",
  "#3b82f6",
  "#7c3aed",
];

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [treasuryCode, setTreasuryCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [refreshing, setRefreshing] = useState(false);

  /*
   * Socket notification.
   *
   * When a cashier creates a new submission,
   * the backend emits "newSubmission".
   */
  const [newSubmission, setNewSubmission] = useState(null);

  /* -------------------------------- */
  /* FETCH DASHBOARD */
  /* -------------------------------- */

  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingDashboard(true);

      const response = await api.get("/admin/dashboard");

      setDashboard(response.data.data);
      setError("");
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(err.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  /* -------------------------------- */
  /* FETCH SUBMISSIONS */
  /* -------------------------------- */

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoadingSubmissions(true);

      const params = {
        page,
        limit: 20,
      };

      if (search.trim()) {
        params.search = search.trim();
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

      const response = await api.get("/admin/submissions", {
        params,
      });

      setSubmissions(response.data.data || []);

      setPagination(
        response.data.pagination || {
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
      console.error("Submissions error:", err);

      setError(err.response?.data?.message || "Unable to load submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  }, [page, search, treasuryCode, from, to]);

  /* -------------------------------- */
  /* SOCKET - NEW SUBMISSION */
  /* -------------------------------- */

  const handleNewSubmission = useCallback((submission) => {
    console.log("New tax submission received:", submission);

    /*
     * Show notification.
     */
    setNewSubmission(submission);

    /*
     * Update dashboard totals immediately.
     *
     * We don't add the new record directly into
     * the paginated table because the current table
     * may have filters applied.
     */
    const amount = Number(submission?.amount || 0);

    const submissionDate = submission?.date ? new Date(submission.date) : null;

    const now = new Date();

    const isToday =
      submissionDate &&
      !Number.isNaN(submissionDate.getTime()) &&
      submissionDate.getFullYear() === now.getFullYear() &&
      submissionDate.getMonth() === now.getMonth() &&
      submissionDate.getDate() === now.getDate();

    setDashboard((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,

        totalSubmissions: Number(previous.totalSubmissions || 0) + 1,

        totalAmount: Number(previous.totalAmount || 0) + amount,

        today: {
          submissions: isToday
            ? Number(previous.today?.submissions || 0) + 1
            : Number(previous.today?.submissions || 0),

          amount: isToday
            ? Number(previous.today?.amount || 0) + amount
            : Number(previous.today?.amount || 0),
        },
      };
    });
  }, []);

  /*
   * Connect to Socket.IO.
   *
   * Only ADMIN users will actually connect because
   * useSocket checks the logged-in user's role.
   */
  useSocket({
    onNewSubmission: handleNewSubmission,
  });

  /* -------------------------------- */
  /* REFRESH EVERYTHING */
  /* -------------------------------- */

  const refreshAll = async () => {
    try {
      setRefreshing(true);

      await Promise.all([fetchDashboard(), fetchSubmissions()]);

      setNewSubmission(null);
    } finally {
      setRefreshing(false);
    }
  };

  /* -------------------------------- */
  /* INITIAL DASHBOARD LOAD */
  /* -------------------------------- */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* -------------------------------- */
  /* INITIAL SUBMISSIONS LOAD */
  /* -------------------------------- */

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  /* -------------------------------- */
  /* RESET PAGE WHEN FILTER CHANGES */
  /* -------------------------------- */

  useEffect(() => {
    setPage(1);
  }, [search, treasuryCode, from, to]);

  /* -------------------------------- */
  /* FORMAT AMOUNT */
  /* -------------------------------- */

  const formatAmount = (amount) => {
    const number = Number(amount || 0);

    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  /* -------------------------------- */
  /* FORMAT DATE */
  /* -------------------------------- */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* -------------------------------- */
  /* DASHBOARD AMOUNTS */
  /* -------------------------------- */

  const totalAmount = Number(dashboard?.totalAmount || 0);

  const todayAmount = Number(dashboard?.today?.amount || 0);

  /* -------------------------------- */
  /* MONTHLY CHART */
  /* -------------------------------- */

  const monthlyData = useMemo(() => {
    const grouped = {};

    submissions.forEach((item) => {
      const date = new Date(item.date);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });

      if (!grouped[key]) {
        grouped[key] = {
          month: key,
          submissions: 0,
          amount: 0,
        };
      }

      grouped[key].submissions += 1;

      grouped[key].amount += Number(item.amount || 0);
    });

    return Object.values(grouped).slice(-7);
  }, [submissions]);

  /* -------------------------------- */
  /* TAX DISTRIBUTION */
  /* -------------------------------- */

  const taxData = useMemo(() => {
    const grouped = {};

    submissions.forEach((item) => {
      const name = item.natureOfTax || "Unknown";

      if (!grouped[name]) {
        grouped[name] = {
          name,
          value: 0,
        };
      }

      grouped[name].value += Number(item.amount || 0);
    });

    return Object.values(grouped)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [submissions]);

  /* -------------------------------- */
  /* CLEAR FILTERS */
  /* -------------------------------- */

  const clearFilters = () => {
    setSearch("");
    setTreasuryCode("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = search || treasuryCode || from || to;

  /* -------------------------------- */
  /* PAGINATION */
  /* -------------------------------- */

  const rangeStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const rangeEnd = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  /* -------------------------------- */
  /* RENDER */
  /* -------------------------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Admin dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Overview of tax submissions and collections
          </p>
        </div>

        <button
          type="button"
          onClick={refreshAll}
          disabled={refreshing}
          className={secondaryButton}>
          <svg
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h5M20 20v-5h-5M5.5 9A7.5 7.5 0 0118.5 6M18.5 15A7.5 7.5 0 015.5 18"
            />
          </svg>

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* NEW SUBMISSION NOTIFICATION */}

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
              onClick={async () => {
                setNewSubmission(null);
                await fetchSubmissions();
              }}
              className="rounded-md bg-blue-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-800">
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
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={refreshAll}
            className="shrink-0 text-sm font-semibold text-red-800 hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      {loadingDashboard ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Loader type="card" />
          <Loader type="card" />
          <Loader type="card" />
          <Loader type="card" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Total submissions"
            value={dashboard?.totalSubmissions || 0}
            subtitle="All tax submissions"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
              />
            }
          />

          <DashboardCard
            title="Total amount"
            value={`₹${formatAmount(totalAmount)}`}
            subtitle="Total collected amount"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2v20M17 5.5A5 5 0 0012 4c-2.76 0-5 1.79-5 4s2.24 4 5 4 5 1.79 5 4-2.24 4-5 4a5 5 0 01-5-1.5"
              />
            }
          />

          <DashboardCard
            title="Today's submissions"
            value={dashboard?.today?.submissions || 0}
            subtitle="Submitted today"
            icon={
              <>
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </>
            }
          />

          <DashboardCard
            title="Today's amount"
            value={`₹${formatAmount(todayAmount)}`}
            subtitle="Collected today"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2v20M17 5.5A5 5 0 0012 4c-2.76 0-5 1.79-5 4s2.24 4 5 4 5 1.79 5 4-2.24 4-5 4a5 5 0 01-5-1.5"
              />
            }
          />
        </div>
      )}

      {/* CHARTS */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* SUBMISSION CHART */}

        <Panel
          className="xl:col-span-2"
          title="Submission overview"
          description="Number of submissions by month, from the loaded records">
          {loadingSubmissions ? (
            <Loader type="chart" />
          ) : monthlyData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    left: -16,
                    top: 8,
                  }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                    }}
                    axisLine={{
                      stroke: "#cbd5e1",
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: "#f1f5f9",
                    }}
                    formatter={(value) => [value, "Submissions"]}
                    contentStyle={{
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />

                  <Bar
                    dataKey="submissions"
                    name="Submissions"
                    fill="#1e3a8a"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* TAX DISTRIBUTION */}

        <Panel title="Tax distribution" description="Amount by nature of tax">
          {loadingSubmissions ? (
            <Loader type="chart" />
          ) : taxData.length === 0 ? (
            <EmptyChart />
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taxData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={2}
                      stroke="none">
                      {taxData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => `₹${formatAmount(value)}`}
                      contentStyle={{
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="mt-4 divide-y divide-slate-100">
                {taxData.map((item, index) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />

                      <span className="truncate text-slate-600">
                        {item.name}
                      </span>
                    </div>

                    <span className="shrink-0 font-medium tabular-nums text-slate-900">
                      ₹{formatAmount(item.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      {/* TAX SUBMISSIONS */}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Tax submissions
          </h2>

          <p className="mt-0.5 text-sm text-slate-600">
            Search and filter all submitted tax records
          </p>
        </div>

        {/* FILTERS */}

        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2">
              <label
                htmlFor="search"
                className="mb-1.5 block text-sm font-medium text-slate-700">
                Search
              </label>

              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />

                  <path d="m20 20-4-4" />
                </svg>

                <input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Receipt, challan, voucher, payee"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

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
                placeholder="e.g. DIP001"
                className={inputClass}
              />
            </div>

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
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {pagination.total || 0} records
            </p>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-blue-900 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent">
              Clear filters
            </button>
          </div>
        </div>

        {/* TABLE */}

        {loadingSubmissions ? (
          <div className="p-5">
            <Loader type="table" rows={8} />
          </div>
        ) : submissions.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <h3 className="text-sm font-semibold text-slate-900">
              No submissions found
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Change your search or filters to see more records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <TableHead>Date</TableHead>

                  <TableHead>Receipt no.</TableHead>

                  <TableHead>Nature of tax</TableHead>

                  <TableHead>Head of account</TableHead>

                  <TableHead>Payee</TableHead>

                  <TableHead align="right">Amount</TableHead>

                  <TableHead>Treasury</TableHead>

                  <TableHead>Challan no.</TableHead>

                  <TableHead>Voucher no.</TableHead>

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

                    <TableCell strong>{submission.receiptNo}</TableCell>

                    <TableCell>{submission.natureOfTax}</TableCell>

                    <TableCell>{submission.headOfAccount}</TableCell>

                    <TableCell>
                      <p
                        className="max-w-[220px] truncate font-medium text-slate-800"
                        title={submission.payeeNameAddress}>
                        {submission.payeeNameAddress}
                      </p>
                    </TableCell>

                    <TableCell align="right">
                      <span className="font-semibold tabular-nums text-slate-900">
                        ₹{formatAmount(submission.amount)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <p className="font-medium text-slate-800">
                        {submission.treasuryName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {submission.treasuryCode}
                      </p>
                    </TableCell>

                    <TableCell>{submission.challanNo}</TableCell>

                    <TableCell>
                      <p>{submission.voucherNo}</p>

                      {submission.dateOfVoucher && (
                        <p className="text-xs text-slate-500">
                          {formatDate(submission.dateOfVoucher)}
                        </p>
                      )}
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

        {!loadingSubmissions && pagination.totalPages > 0 && (
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
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className={secondaryButton}>
                Previous
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
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
/* Panel */
/* -------------------------------- */

const Panel = ({ title, description, className = "", children }) => {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-0.5 text-sm text-slate-600">{description}</p>
        )}
      </div>

      {children}
    </section>
  );
};

/* -------------------------------- */
/* Dashboard Card */
/* -------------------------------- */

const DashboardCard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{title}</p>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-950/5 text-blue-900">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true">
            {icon}
          </svg>
        </div>
      </div>

      <p className="mt-3 truncate text-2xl font-semibold tabular-nums text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
};

/* -------------------------------- */
/* Table Components */
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

const TableCell = ({ children, strong = false, align = "left" }) => {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3.5 text-sm ${
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

/* -------------------------------- */
/* Empty Chart */
/* -------------------------------- */

const EmptyChart = () => {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg
            className="h-6 w-6 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3v18h18M7 16l3-4 3 2 4-6"
            />
          </svg>
        </div>

        <p className="mt-3 text-sm font-medium text-slate-800">
          No chart data available
        </p>

        <p className="mt-1 text-sm text-slate-600">
          Charts appear once tax records are submitted.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

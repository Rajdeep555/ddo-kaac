import { useCallback, useEffect, useState } from "react";

import api from "../../services/api";
import Loader from "../../components/common/Loader";

/*
|--------------------------------------------------------------------------
| Common styles
|--------------------------------------------------------------------------
*/

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30 disabled:cursor-not-allowed disabled:opacity-50";

/*
|--------------------------------------------------------------------------
| Cashier Dashboard
|--------------------------------------------------------------------------
*/

const Dashboard = () => {
  /*
  |--------------------------------------------------------------------------
  | Dashboard state
  |--------------------------------------------------------------------------
  */

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch dashboard
  |--------------------------------------------------------------------------
  */

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/cashier/dashboard");

      setDashboard(response.data?.data || null);

      setError("");
    } catch (err) {
      console.error("Cashier dashboard error:", err);

      setError(err.response?.data?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Initial load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /*
  |--------------------------------------------------------------------------
  | Manual refresh
  |--------------------------------------------------------------------------
  */

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);

      await fetchDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Format amount
  |--------------------------------------------------------------------------
  */

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  /*
  |--------------------------------------------------------------------------
  | Format date
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

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

  /*
  |--------------------------------------------------------------------------
  | Dashboard values
  |--------------------------------------------------------------------------
  */

  const totalSubmissions = dashboard?.totalSubmissions || 0;

  const totalAmount = Number(dashboard?.totalAmount || 0);

  const todaySubmissions = dashboard?.today?.submissions || 0;

  const todayAmount = Number(dashboard?.today?.amount || 0);

  const recentSubmissions = dashboard?.recentSubmissions || [];

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Cashier Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Overview of your tax submissions and collections
          </p>
        </div>

        <button
          type="button"
          onClick={refreshDashboard}
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

      {/* ================================================================ */}
      {/* ERROR */}
      {/* ================================================================ */}

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={refreshDashboard}
            className="shrink-0 text-sm font-semibold text-red-800 hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* SUMMARY CARDS */}
      {/* ================================================================ */}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Loader type="card" />

          <Loader type="card" />

          <Loader type="card" />

          <Loader type="card" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* TOTAL SUBMISSIONS */}

          <DashboardCard
            title="Total submissions"
            value={totalSubmissions}
            subtitle="Your total submissions"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
              />
            }
          />

          {/* TOTAL AMOUNT */}

          <DashboardCard
            title="Total amount"
            value={`₹${formatAmount(totalAmount)}`}
            subtitle="Total submitted amount"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2v20M17 5.5A5 5 0 0012 4c-2.76 0-5 1.79-5 4s2.24 4 5 4 5 1.79 5 4-2.24 5-5 4a5 5 0 01-5-1.5"
              />
            }
          />

          {/* TODAY'S SUBMISSIONS */}

          <DashboardCard
            title="Today's submissions"
            value={todaySubmissions}
            subtitle="Submitted today"
            icon={
              <>
                <rect x="3" y="4" width="18" height="17" rx="2" />

                <path d="M16 2v4M8 2v4M3 10h18" />
              </>
            }
          />

          {/* TODAY'S AMOUNT */}

          <DashboardCard
            title="Today's amount"
            value={`₹${formatAmount(todayAmount)}`}
            subtitle="Submitted today"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2v20M17 5.5A5 5 0 0012 4c-2.76 0-5 1.79-5 4s2.24 4 5 4 5 1.79 5 4-2.24 5-5 4a5 5 0 01-5-1.5"
              />
            }
          />
        </div>
      )}

      {/* ================================================================ */}
      {/* QUICK INFORMATION */}
      {/* ================================================================ */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT / RECENT SUBMISSIONS */}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white xl:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent submissions
            </h2>

            <p className="mt-0.5 text-sm text-slate-600">
              Your latest tax submissions
            </p>
          </div>

          {loading ? (
            <div className="p-5">
              <Loader type="table" rows={6} />
            </div>
          ) : recentSubmissions.length === 0 ? (
            <EmptySubmissions />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <TableHead>Date</TableHead>

                    <TableHead>DDO</TableHead>

                    <TableHead>Receipt no.</TableHead>

                    <TableHead>Nature of tax</TableHead>

                    <TableHead>Treasury</TableHead>

                    <TableHead>Amount</TableHead>

                    <TableHead>Status</TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="transition hover:bg-slate-50">
                      {/* DATE */}

                      <TableCell>{formatDate(submission.date)}</TableCell>

                      {/* DDO */}

                      <TableCell>
                        <p className="font-medium text-slate-800">
                          {submission.ddo?.ddoCode || "-"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {submission.ddo?.name || ""}
                        </p>
                      </TableCell>

                      {/* RECEIPT */}

                      <TableCell strong>
                        {submission.receiptNo || "-"}
                      </TableCell>

                      {/* NATURE */}

                      <TableCell>{submission.natureOfTax || "-"}</TableCell>

                      {/* TREASURY */}

                      <TableCell>
                        <p className="font-medium text-slate-800">
                          {submission.treasuryName || "-"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {submission.treasuryCode || ""}
                        </p>
                      </TableCell>

                      {/* AMOUNT */}

                      <TableCell>
                        <span className="font-semibold tabular-nums text-slate-900">
                          ₹{formatAmount(submission.amount)}
                        </span>
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <StatusBadge status={submission.status} />
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* RIGHT / INFORMATION */}

        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Submission summary
            </h2>

            <p className="mt-0.5 text-sm text-slate-600">
              Your current activity
            </p>
          </div>

          <div className="space-y-5 p-5">
            {/* TOTAL */}

            <SummaryRow label="Total submissions" value={totalSubmissions} />

            {/* TOTAL AMOUNT */}

            <SummaryRow
              label="Total amount"
              value={`₹${formatAmount(totalAmount)}`}
            />

            {/* TODAY */}

            <SummaryRow label="Today's submissions" value={todaySubmissions} />

            {/* TODAY AMOUNT */}

            <SummaryRow
              label="Today's amount"
              value={`₹${formatAmount(todayAmount)}`}
            />

            <div className="border-t border-slate-200 pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Quick note
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use the Tax Submission section to create a new tax record. Your
                submitted records will appear here automatically after the
                dashboard is refreshed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* Dashboard Card */
/* ========================================================================= */

const DashboardCard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 truncate text-2xl font-semibold tabular-nums text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-900">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true">
            {icon}
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* Summary Row */
/* ========================================================================= */

const SummaryRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-600">{label}</span>

      <span className="text-sm font-semibold tabular-nums text-slate-900">
        {value}
      </span>
    </div>
  );
};

/* ========================================================================= */
/* Table Head */
/* ========================================================================= */

const TableHead = ({ children }) => {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">
      {children}
    </th>
  );
};

/* ========================================================================= */
/* Table Cell */
/* ========================================================================= */

const TableCell = ({ children, strong = false }) => {
  return (
    <td
      className={`px-4 py-3.5 text-sm ${
        strong ? "font-semibold text-slate-900" : "text-slate-600"
      }`}>
      {children}
    </td>
  );
};

/* ========================================================================= */
/* Status Badge */
/* ========================================================================= */

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

/* ========================================================================= */
/* Empty Submissions */
/* ========================================================================= */

const EmptySubmissions = () => {
  return (
    <div className="px-5 py-14 text-center">
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
        No submissions yet
      </h3>

      <p className="mt-1 text-sm text-slate-600">
        Your recent tax submissions will appear here.
      </p>
    </div>
  );
};

export default Dashboard;

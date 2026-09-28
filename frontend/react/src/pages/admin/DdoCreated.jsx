import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import ConfirmModal from "../../components/common/ConfirmModal";

const DdoCreated = () => {
  const [ddos, setDdos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteDdo, setDeleteDdo] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [editingDdo, setEditingDdo] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // ----------------------------------------
  // FETCH DDOs
  // ----------------------------------------

  const fetchDdos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/ddos", {
        params: {
          page,
          limit: 10,
          search: search.trim() || undefined,
          isActive: statusFilter === "" ? undefined : statusFilter === "active",
        },
      });

      setDdos(response.data?.data || []);

      setPagination(
        response.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (error) {
      console.error("Failed to fetch DDOs:", error);

      setError(error.response?.data?.message || "Failed to load DDOs.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchDdos();
  }, [fetchDdos]);

  // ----------------------------------------
  // OPEN EDIT
  // ----------------------------------------

  const handleEdit = (ddo) => {
    setEditingDdo(ddo);

    reset({
      ddoCode: ddo.ddoCode || "",
      name: ddo.name || "",
      email: ddo.email || "",
      phone: ddo.phone || "",
    });

    setError("");
    setSuccess("");
  };

  // ----------------------------------------
  // UPDATE DDO
  // ----------------------------------------

  const handleUpdate = async (data) => {
    if (!editingDdo) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(`/admin/ddos/${editingDdo.id}`, {
        ddoCode: data.ddoCode.trim(),
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
      });

      setSuccess(response.data?.message || "DDO updated successfully.");

      setEditingDdo(null);
      reset();

      await fetchDdos();
    } catch (error) {
      console.error("Update DDO error:", error);

      setError(error.response?.data?.message || "Failed to update DDO.");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------
  // DELETE / DEACTIVATE
  // ----------------------------------------
  const handleDelete = (ddo) => {
    setDeleteDdo(ddo);
  };
  const confirmDelete = async () => {
    if (!deleteDdo) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await api.delete(`/admin/ddos/${deleteDdo.id}`);

      setSuccess("DDO deactivated successfully.");

      setDeleteDdo(null);

      await fetchDdos();
    } catch (error) {
      console.error("Delete DDO error:", error);

      setError(error.response?.data?.message || "Failed to deactivate DDO.");
    } finally {
      setDeleting(false);
    }
  };

  // ----------------------------------------
  // CLOSE EDIT MODAL
  // ----------------------------------------

  const closeEdit = () => {
    setEditingDdo(null);
    reset();
  };

  // ----------------------------------------
  // SEARCH
  // ----------------------------------------

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  // ----------------------------------------
  // STATUS FILTER
  // ----------------------------------------

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Created DDO</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage all Drawing and Disbursing Officers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDdos}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-700">{success}</p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* FILTERS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* SEARCH */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search DDO code, name, email..."
              className="form-input"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="form-input">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* TOTAL */}
          <div className="flex items-end">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-400">Total DDOs</p>

              <p className="text-xl font-bold text-slate-900">
                {pagination.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  DDO Code
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />

                      <span className="text-sm text-slate-500">
                        Loading DDOs...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : ddos.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-slate-500">
                    No DDOs found.
                  </td>
                </tr>
              ) : (
                ddos.map((ddo) => (
                  <tr key={ddo.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">
                        {ddo.ddoCode}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-700">
                        {ddo.name}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {ddo.email}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {ddo.phone}
                    </td>

                    <td className="px-5 py-4">
                      {ddo.isActive ? (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(ddo)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100">
                          Edit
                        </button>

                        {ddo.isActive && (
                          <button
                            type="button"
                            onClick={() => handleDelete(ddo)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <ConfirmModal
            open={!!deleteDdo}
            title="Deactivate DDO?"
            message={
              deleteDdo
                ? `Are you sure you want to deactivate "${deleteDdo.name}"? This DDO will no longer be available for new tax submissions.`
                : ""
            }
            confirmText="Yes, Deactivate"
            cancelText="Cancel"
            loading={deleting}
            onCancel={() => {
              if (!deleting) {
                setDeleteDdo(null);
              }
            }}
            onConfirm={confirmDelete}
          />
        </div>
      </div>

      {/* PAGINATION */}
      {pagination.total > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          {/* RECORD COUNT */}
          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {pagination.total}
            </span>{" "}
            DDOs
          </div>

          {/* PAGINATION */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage || loading}
              onClick={() => {
                setPage((prev) => Math.max(prev - 1, 1));

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              Previous
            </button>

            <div className="min-w-[110px] text-center text-sm font-medium text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </div>

            <button
              type="button"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => {
                setPage((prev) => prev + 1);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingDdo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit DDO</h2>

                <p className="mt-1 text-xs text-slate-400">
                  Update DDO information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="text-2xl text-slate-400 hover:text-slate-700">
                ×
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit(handleUpdate)} className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* DDO CODE */}
                <FormField label="DDO Code" error={errors.ddoCode?.message}>
                  <input
                    type="text"
                    className="form-input"
                    {...register("ddoCode", {
                      required: "DDO code is required",
                      validate: (value) =>
                        value.trim().length > 0 || "DDO code is required",
                    })}
                  />
                </FormField>

                {/* NAME */}
                <FormField label="DDO Name" error={errors.name?.message}>
                  <input
                    type="text"
                    className="form-input"
                    {...register("name", {
                      required: "DDO name is required",
                      validate: (value) =>
                        value.trim().length > 0 || "DDO name is required",
                    })}
                  />
                </FormField>

                {/* EMAIL */}
                <FormField label="Email" error={errors.email?.message}>
                  <input
                    type="email"
                    className="form-input"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                </FormField>

                {/* PHONE */}
                <FormField label="Phone" error={errors.phone?.message}>
                  <input
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    className="form-input"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Phone number must be exactly 10 digits",
                      },
                    })}
                  />
                </FormField>
              </div>

              {/* BUTTONS */}
              <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------
// FORM FIELD
// ----------------------------------------

const FormField = ({ label, error, children }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      {children}

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DdoCreated;

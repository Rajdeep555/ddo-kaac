import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import ConfirmModal from "../../components/common/ConfirmModal";

const UserCreated = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [serverError, setServerError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [editingUser, setEditingUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchUsers = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setServerError("");

        const response = await api.get("/admin/users", {
          params: {
            page,
            limit: 10,
            search: search.trim() || undefined,
            role: roleFilter || undefined,
            isActive:
              statusFilter === ""
                ? undefined
                : statusFilter === "active"
                  ? true
                  : false,
          },
        });

        setUsers(response.data?.data || []);

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
        console.error("Fetch users error:", error);

        setServerError(
          error.response?.data?.message || "Failed to fetch users.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, roleFilter, statusFilter],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleEdit = (user) => {
    setEditingUser(user);

    reset({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "CASHIER",
      password: "",
    });
  };

  const closeEditModal = () => {
    if (updating) return;

    setEditingUser(null);

    reset({
      name: "",
      email: "",
      role: "CASHIER",
      password: "",
    });
  };

  const handleUpdate = async (data) => {
    if (!editingUser) return;

    try {
      setUpdating(true);
      setServerError("");

      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role,
      };

      // Only send password if admin entered a new one.
      if (data.password?.trim()) {
        payload.password = data.password;
      }

      await api.put(`/admin/users/${editingUser.id}`, payload);

      closeEditModal();

      await fetchUsers(true);
    } catch (error) {
      console.error("Update user error:", error);

      setServerError(error.response?.data?.message || "Failed to update user.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (user) => {
    setDeleteUser(user);
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;

    try {
      setDeleting(true);
      setServerError("");

      await api.delete(`/admin/users/${deleteUser.id}`);

      setDeleteUser(null);

      // If deleting the last item on a page,
      // move back one page.
      if (users.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await fetchUsers(true);
      }
    } catch (error) {
      console.error("Deactivate user error:", error);

      setServerError(
        error.response?.data?.message || "Failed to deactivate user.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async (user) => {
    try {
      setServerError("");

      await api.put(`/admin/users/${user.id}`, {
        name: user.name,
        email: user.email,
        role: user.role,
        // No password means existing password remains unchanged.
      });

      /*
       * Your current backend updateUser does not yet support
       * changing isActive.
       *
       * Therefore activation should be added to the backend
       * before using this button.
       */
      await fetchUsers(true);
    } catch (error) {
      console.error("Activate user error:", error);

      setServerError(
        error.response?.data?.message || "Failed to activate user.",
      );
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-GB");
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Created Users</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage administrator and cashier accounts.
            </p>
          </div>

          <a
            href="/admin/users/create"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            + Create User
          </a>
        </div>

        {/* Error */}
        {serverError && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{serverError}</span>

            <button
              type="button"
              onClick={() => setServerError("")}
              className="ml-4 font-bold text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search name or email..."
                className="form-input"
              />
            </div>

            {/* Role */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </label>

              <select
                value={roleFilter}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="form-input">
                <option value="">All Roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="CASHIER">Cashier</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="form-input">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Refresh */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    #
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Name
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-5 py-5">
                        <div className="h-4 w-6 animate-pulse rounded bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      </td>

                      <td className="px-5 py-5">
                        <div className="ml-auto h-8 w-24 animate-pulse rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center">
                      <div className="text-sm font-medium text-slate-600">
                        No users found
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {(page - 1) * pagination.limit + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {user.name}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            Cashier
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user.isActive ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                            Edit
                          </button>

                          {user.isActive && (
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing page{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.totalPages}
                </span>{" "}
                · {pagination.total} users
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !updating) {
              closeEditModal();
            }
          }}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">Edit User</h2>

              <p className="mt-1 text-sm text-slate-500">
                Update user information and role.
              </p>
            </div>

            <form onSubmit={handleSubmit(handleUpdate)} className="p-6">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="form-label">Name</label>

                  <input
                    type="text"
                    className="form-input"
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                  />

                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="form-label">Email</label>

                  <input
                    type="email"
                    className="form-input"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                  />

                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="form-label">Role</label>

                  <select
                    className="form-input"
                    {...register("role", {
                      required: "Role is required",
                    })}>
                    <option value="CASHIER">Cashier</option>
                    <option value="ADMIN">Administrator</option>
                  </select>

                  {errors.role && (
                    <p className="form-error">{errors.role.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="form-label">New Password</label>

                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    className="form-input"
                    {...register("password", {
                      validate: (value) => {
                        if (!value) return true;

                        if (value.length < 6) {
                          return "Password must be at least 6 characters";
                        }

                        return true;
                      },
                    })}
                  />

                  {errors.password && (
                    <p className="form-error">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      <ConfirmModal
        open={!!deleteUser}
        title="Deactivate User?"
        message={
          deleteUser
            ? `Are you sure you want to deactivate "${deleteUser.name}"? This user will no longer be able to use the system.`
            : ""
        }
        confirmText="Yes, Deactivate"
        cancelText="Cancel"
        loading={deleting}
        onCancel={() => {
          if (!deleting) {
            setDeleteUser(null);
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default UserCreated;

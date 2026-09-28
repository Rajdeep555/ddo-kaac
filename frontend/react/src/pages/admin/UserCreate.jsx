import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const UserCreate = () => {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CASHIER",
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      setSuccessMessage("");

      const response = await api.post("/admin/users", {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      });

      setSuccessMessage(response.data?.message || "User created successfully");

      reset({
        name: "",
        email: "",
        password: "",
        role: "CASHIER",
      });
    } catch (error) {
      console.error("Create user error:", error);

      setServerError(
        error.response?.data?.message ||
          "Failed to create user. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create User</h1>

          <p className="mt-1 text-sm text-slate-500">
            Create an administrator or cashier account.
          </p>
        </div>

        {/* Messages */}
        {serverError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="form-label">
                Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter user's full name"
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
              <label className="form-label">
                Email Address <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                placeholder="user@example.com"
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

            {/* Password */}
            <div>
              <label className="form-label">
                Password <span className="text-red-500">*</span>
              </label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                className="form-input"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />

              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="md:col-span-2">
              <label className="form-label">
                User Role <span className="text-red-500">*</span>
              </label>

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
          </div>

          {/* Role explanation */}
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">User roles</p>

            <div className="mt-2 space-y-1 text-sm text-blue-800">
              <p>
                <strong>Cashier:</strong> Can create and manage their own tax
                submissions.
              </p>

              <p>
                <strong>Administrator:</strong> Has access to the administration
                panel and user management.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/users/created")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              View Users
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreate;

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const DdoCreate = () => {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ddoCode: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess("");

    try {
      const response = await api.post("/admin/ddos", {
        ddoCode: data.ddoCode.trim(),
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
      });

      setSuccess(response.data?.message || "DDO created successfully.");

      reset();
    } catch (error) {
      console.error("Create DDO error:", error);

      setServerError(
        error.response?.data?.message ||
          "Failed to create DDO. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create DDO</h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new Drawing and Disbursing Officer to the system.
        </p>
      </div>

      {/* Form Card */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Card Header */}

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-900">
            DDO Information
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Enter the DDO details below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6">
          {/* Server Error */}

          {serverError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">{serverError}</p>
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-green-700">{success}</p>

              <button
                type="button"
                onClick={() => navigate("/admin/ddo/created")}
                className="text-sm font-semibold text-green-700 hover:underline">
                View DDOs
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* DDO Code */}

            <FormField
              label="DDO Code"
              required
              error={errors.ddoCode?.message}>
              <input
                type="text"
                placeholder="Enter DDO code"
                maxLength={50}
                className={`form-input ${
                  errors.ddoCode ? "border-red-400" : ""
                }`}
                {...register("ddoCode", {
                  required: "DDO code is required",
                  validate: (value) =>
                    value.trim().length > 0 || "DDO code is required",
                })}
              />

              <p className="mt-1.5 text-xs text-slate-400">
                DDO code must be unique.
              </p>
            </FormField>

            {/* Name */}

            <FormField label="DDO Name" required error={errors.name?.message}>
              <input
                type="text"
                placeholder="Enter DDO name"
                maxLength={150}
                className={`form-input ${errors.name ? "border-red-400" : ""}`}
                {...register("name", {
                  required: "DDO name is required",
                  validate: (value) =>
                    value.trim().length > 0 || "DDO name is required",
                })}
              />
            </FormField>

            {/* Email */}

            <FormField label="Email" required error={errors.email?.message}>
              <input
                type="email"
                placeholder="Enter email address"
                maxLength={150}
                className={`form-input ${errors.email ? "border-red-400" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
            </FormField>

            {/* Phone */}

            <FormField label="Phone" required error={errors.phone?.message}>
              <input
                type="tel"
                placeholder="Enter 10 digit phone number"
                maxLength={10}
                inputMode="numeric"
                className={`form-input ${errors.phone ? "border-red-400" : ""}`}
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

          {/* Actions */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/ddo/created")}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating...
                </span>
              ) : (
                "Create DDO"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================
   FORM FIELD
========================================= */

const FormField = ({ label, required = false, error, children }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DdoCreate;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionForm from "../../components/cashier/SubmissionForm";
import api from "../../services/api";

const TaxCreate = () => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setServerError("");
      setSuccessMessage("");

      const response = await api.post("/cashier/submissions", formData);

      setSuccessMessage(
        response.data?.message || "Tax submission created successfully.",
      );

      // Go back to cashier dashboard after successful submission
      setTimeout(() => {
        navigate("/cashier/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Tax submission error:", error);

      const message =
        error.response?.data?.message ||
        "Failed to create tax submission. Please try again.";

      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/cashier/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Create Tax Submission
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Enter the tax receipt and treasury details below.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Success */}
        {successMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* Server error */}
        {serverError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

        {/* Form */}
        <SubmissionForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
          serverError={serverError}
        />
      </div>
    </div>
  );
};

export default TaxCreate;

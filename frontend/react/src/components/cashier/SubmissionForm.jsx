import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";

const SubmissionForm = ({
  onSubmit,
  onCancel,
  submitting = false,
  serverError = "",
}) => {
  const [ddos, setDdos] = useState([]);
  const [loadingDdos, setLoadingDdos] = useState(true);
  const [ddoError, setDdoError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ddoId: "",
      date: "",
      natureOfTax: "",
      headOfAccount: "",
      receiptNo: "",
      amount: "",
      payeeNameAddress: "",
      collectorName: "",
      dateOfDeposit: "",
      treasuryName: "",
      treasuryCode: "",
      challanNo: "",
      voucherNo: "",
      dateOfVoucher: "",
    },
  });

  /*
   * Load active DDOs
   */
useEffect(() => {
  const fetchDdos = async () => {
    try {
      setLoadingDdos(true);
      setDdoError("");

      const response = await api.get("/cashier/ddos");

      setDdos(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch DDOs:", error);

      setDdoError(
        error.response?.data?.message ||
          "Failed to load DDO list. Please try again.",
      );
    } finally {
      setLoadingDdos(false);
    }
  };

  fetchDdos();
}, []);

  /*
   * Submit form
   */
  const submitForm = async (data) => {
    /*
     * IMPORTANT:
     * Do NOT add cashierId here.
     *
     * Backend gets cashierId from:
     * req.user.id
     */

    const payload = {
      ddoId: Number(data.ddoId),

      date: data.date,

      natureOfTax: data.natureOfTax.trim(),

      headOfAccount: data.headOfAccount.trim(),

      receiptNo: data.receiptNo.trim(),

      amount: Number(data.amount),

      payeeNameAddress: data.payeeNameAddress.trim(),

      collectorName: data.collectorName.trim(),

      dateOfDeposit: data.dateOfDeposit,

      treasuryName: data.treasuryName.trim(),

      treasuryCode: data.treasuryCode.trim(),

      challanNo: data.challanNo.trim(),

      voucherNo: data.voucherNo.trim(),

      dateOfVoucher: data.dateOfVoucher || null,
    };

    await onSubmit(payload);

    /*
     * Clear form after successful submission.
     *
     * TaxCreate controls the success/navigation,
     * so this reset is mainly useful if the parent
     * decides to keep the form open.
     */
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Form header */}
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Tax Submission Details
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          All fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>

      <div className="space-y-8 p-5 sm:p-6">
        {/* =====================================================
            DDO DETAILS
        ====================================================== */}

        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              DDO Details
            </h3>

            <p className="text-sm text-slate-500">
              Select the DDO associated with this tax submission.
            </p>
          </div>

          <div>
            <label className="form-label">
              DDO <span className="text-red-500">*</span>
            </label>

            {loadingDdos ? (
              <div className="form-input flex items-center text-slate-400">
                Loading DDOs...
              </div>
            ) : (
              <select
                {...register("ddoId", {
                  required: "Please select a DDO.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.ddoId ? "border-red-400" : ""
                }`}>
                <option value="">Select DDO</option>

                {ddos.map((ddo) => (
                  <option key={ddo.id} value={ddo.id}>
                    {ddo.ddoCode} - {ddo.name}
                  </option>
                ))}
              </select>
            )}

            {errors.ddoId && (
              <p className="form-error">{errors.ddoId.message}</p>
            )}

            {ddoError && (
              <p className="mt-1 text-sm text-red-600">{ddoError}</p>
            )}
          </div>
        </section>

        {/* =====================================================
            BASIC TAX DETAILS
        ====================================================== */}

        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Tax Details
            </h3>

            <p className="text-sm text-slate-500">
              Enter the tax and receipt information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Date */}
            <div>
              <label className="form-label">
                Date <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                {...register("date", {
                  required: "Date is required.",
                })}
                disabled={submitting}
                className={`form-input ${errors.date ? "border-red-400" : ""}`}
              />

              {errors.date && (
                <p className="form-error">{errors.date.message}</p>
              )}
            </div>

            {/* Nature of Tax */}
            <div>
              <label className="form-label">
                Nature of Tax <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter nature of tax"
                {...register("natureOfTax", {
                  required: "Nature of tax is required.",
                  minLength: {
                    value: 2,
                    message: "Nature of tax must be at least 2 characters.",
                  },
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.natureOfTax ? "border-red-400" : ""
                }`}
              />

              {errors.natureOfTax && (
                <p className="form-error">{errors.natureOfTax.message}</p>
              )}
            </div>

            {/* Head of Account */}
            <div>
              <label className="form-label">
                Head of Account <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter head of account"
                {...register("headOfAccount", {
                  required: "Head of account is required.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.headOfAccount ? "border-red-400" : ""
                }`}
              />

              {errors.headOfAccount && (
                <p className="form-error">{errors.headOfAccount.message}</p>
              )}
            </div>

            {/* Receipt No */}
            <div>
              <label className="form-label">
                Receipt No. <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter receipt number"
                {...register("receiptNo", {
                  required: "Receipt number is required.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.receiptNo ? "border-red-400" : ""
                }`}
              />

              {errors.receiptNo && (
                <p className="form-error">{errors.receiptNo.message}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="form-label">
                Amount <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("amount", {
                  required: "Amount is required.",
                  valueAsNumber: true,
                  validate: (value) =>
                    Number.isFinite(value) && value >= 0
                      ? true
                      : "Please enter a valid amount.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.amount ? "border-red-400" : ""
                }`}
              />

              {errors.amount && (
                <p className="form-error">{errors.amount.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            PAYEE / COLLECTOR
        ====================================================== */}

        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Payee & Collector
            </h3>

            <p className="text-sm text-slate-500">
              Enter the payee and collector information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Payee */}
            <div className="md:col-span-2">
              <label className="form-label">
                Payee's Name & Address <span className="text-red-500">*</span>
              </label>

              <textarea
                rows={3}
                placeholder="Enter payee's name and address"
                {...register("payeeNameAddress", {
                  required: "Payee name and address is required.",
                })}
                disabled={submitting}
                className={`form-input resize-none ${
                  errors.payeeNameAddress ? "border-red-400" : ""
                }`}
              />

              {errors.payeeNameAddress && (
                <p className="form-error">{errors.payeeNameAddress.message}</p>
              )}
            </div>

            {/* Collector */}
            <div>
              <label className="form-label">
                Name of Collector <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter collector name"
                {...register("collectorName", {
                  required: "Collector name is required.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.collectorName ? "border-red-400" : ""
                }`}
              />

              {errors.collectorName && (
                <p className="form-error">{errors.collectorName.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            TREASURY DETAILS
        ====================================================== */}

        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Treasury Details
            </h3>

            <p className="text-sm text-slate-500">
              Enter the deposit and treasury information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Date of Deposit */}
            <div>
              <label className="form-label">
                Date of Deposit <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                {...register("dateOfDeposit", {
                  required: "Date of deposit is required.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.dateOfDeposit ? "border-red-400" : ""
                }`}
              />

              {errors.dateOfDeposit && (
                <p className="form-error">{errors.dateOfDeposit.message}</p>
              )}
            </div>

            {/* Treasury Name */}
            <div>
              <label className="form-label">
                Name of Treasury <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter treasury name"
                {...register("treasuryName", {
                  required: "Treasury name is required.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.treasuryName ? "border-red-400" : ""
                }`}
              />

              {errors.treasuryName && (
                <p className="form-error">{errors.treasuryName.message}</p>
              )}
            </div>

            {/* Treasury Code */}
            <div>
              <label className="form-label">
                Treasury Code <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter treasury code"
                {...register("treasuryCode", {
                  required: "Treasury code is required.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.treasuryCode ? "border-red-400" : ""
                }`}
              />

              {errors.treasuryCode && (
                <p className="form-error">{errors.treasuryCode.message}</p>
              )}
            </div>

            {/* Challan No */}
            <div>
              <label className="form-label">
                Challan No. <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter challan number"
                {...register("challanNo", {
                  required: "Challan number is required.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.challanNo ? "border-red-400" : ""
                }`}
              />

              {errors.challanNo && (
                <p className="form-error">{errors.challanNo.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            VOUCHER DETAILS
        ====================================================== */}

        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Voucher Details
            </h3>

            <p className="text-sm text-slate-500">
              Enter the voucher information if available.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Voucher No */}
            <div>
              <label className="form-label">
                Voucher No. <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter voucher number"
                {...register("voucherNo", {
                  required: "Voucher number is required.",
                })}
                disabled={submitting}
                className={`form-input ${
                  errors.voucherNo ? "border-red-400" : ""
                }`}
              />

              {errors.voucherNo && (
                <p className="form-error">{errors.voucherNo.message}</p>
              )}
            </div>

            {/* Date of Voucher */}
            <div>
              <label className="form-label">Date of Voucher</label>

              <input
                type="date"
                {...register("dateOfVoucher")}
                disabled={submitting}
                className={`form-input ${
                  errors.dateOfVoucher ? "border-red-400" : ""
                }`}
              />

              {errors.dateOfVoucher && (
                <p className="form-error">{errors.dateOfVoucher.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            SERVER ERROR
        ====================================================== */}

        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{serverError}</p>
          </div>
        )}

        {/* =====================================================
            ACTIONS
        ====================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || loadingDdos}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Submitting...
              </span>
            ) : (
              "Submit Tax Record"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SubmissionForm;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAuth } from "../services/auth";
import logo from "../assets/logo.jpg";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);

      saveAuth(response.data);

      const user = response.data.user;

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "CASHIER") {
        navigate("/cashier");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/15";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 lg:flex-row">
      {/* Brand panel */}
      <aside className="bg-blue-950 text-white lg:w-[44%] lg:min-h-screen flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-14">
        <div className="flex items-center gap-4">
          {/* Replace this with your official emblem / logo */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/10">
            <img src={logo} alt="Logo" className="h-full w-full object-cover" />
          </div>

          <div>
            <p className="text-base font-semibold leading-tight">KAAC</p>
            <p className="text-sm text-blue-200">Department of Taxation</p>
          </div>
        </div>

        <div className="hidden lg:block max-w-md">
          <h2 className="text-3xl font-semibold leading-snug">
            Tax Management System
          </h2>
          <p className="mt-4 text-base leading-relaxed text-blue-100">
            Manage tax records, collections and receipts through one secure,
            official portal.
          </p>
        </div>

        <p className="hidden lg:block text-sm text-blue-300">
          Authorised personnel only. All activity is logged.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Use your official account to access the portal.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-800">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@department.gov.in"
                  autoComplete="username"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-800">
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className={`${inputClass} pr-16`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 rounded-r-md px-3.5 text-sm font-medium text-blue-900 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/30">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-900 px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Having trouble signing in? Contact your department administrator.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;

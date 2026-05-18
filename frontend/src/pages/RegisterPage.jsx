import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    organization_name: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axiosClient.post("/auth/register", form);

      setSuccess(t("register.successMessage"));

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(t("register.errorDefault"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {t("register.title")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("register.subtitle")}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("register.fullName")}
            </label>
            <input
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
              placeholder={t("register.fullNamePlaceholder")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("register.email")}
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("register.password")}
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
              placeholder={t("register.passwordPlaceholder")}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("register.orgName")}
            </label>
            <input
              name="organization_name"
              type="text"
              value={form.organization_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900"
              placeholder={t("register.orgNamePlaceholder")}
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? t("register.registering") : t("register.registerButton")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t("register.haveAccount")}{" "}
          <Link to="/login" className="font-medium text-slate-900 underline">
            {t("register.loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
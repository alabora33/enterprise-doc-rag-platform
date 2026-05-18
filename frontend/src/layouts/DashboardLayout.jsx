import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(next);
    localStorage.setItem("language", next);
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axiosClient.get("/users/me");
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const isAdmin = user?.is_superuser;

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white">
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-xl font-bold">
            {isAdmin ? t("nav.adminPanel") : t("nav.appTitle")}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isAdmin ? t("nav.adminSubtitle") : t("nav.appSubtitle")}
          </p>
        </div>

        <nav className="space-y-2 p-4">
          {isAdmin ? (
            <>
              <Link
                to="/admin/usage"
                className="block rounded-lg px-4 py-2 hover:bg-slate-800"
              >
                {t("nav.adminUsage")}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="block rounded-lg px-4 py-2 hover:bg-slate-800"
              >
                {t("nav.dashboard")}
              </Link>

              <Link
                to="/documents"
                className="block rounded-lg px-4 py-2 hover:bg-slate-800"
              >
                {t("nav.documents")}
              </Link>

              <Link
                to="/chat"
                className="block rounded-lg px-4 py-2 hover:bg-slate-800"
              >
                {t("nav.chat")}
              </Link>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          {user && (
            <div className="mb-4 rounded-lg bg-slate-800 px-3 py-3 text-xs text-slate-300">
              <p className="truncate">{user.email}</p>
              <p className="mt-1">
                {t("nav.role")}: {user.is_superuser ? t("nav.roleAdmin") : t("nav.roleUser")}
              </p>
            </div>
          )}

          <button
            onClick={toggleLanguage}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
            </svg>
            {i18n.language === "tr" ? "English" : "Türkçe"}
          </button>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
          >
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
}
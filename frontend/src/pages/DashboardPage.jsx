import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userResponse = await axiosClient.get("/users/me");
      const orgResponse = await axiosClient.get("/organizations/me");

      setUser(userResponse.data);
      setOrganizations(orgResponse.data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{t("dashboard.title")}</h2>
      <p className="mt-2 text-slate-500">
        {t("dashboard.subtitle")}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">{t("dashboard.userCard.title")}</h3>

          {user ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><strong>{t("dashboard.userCard.email")}:</strong> {user.email}</p>
              <p><strong>{t("dashboard.userCard.name")}:</strong> {user.full_name || "-"}</p>
              <p><strong>{t("dashboard.userCard.superuser")}:</strong> {user.is_superuser ? t("dashboard.userCard.yes") : t("dashboard.userCard.no")}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">{t("dashboard.userCard.loading")}</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">{t("dashboard.orgCard.title")}</h3>

          <div className="mt-4 space-y-3">
            {organizations.map((item) => (
              <div
                key={item.organization.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="font-medium text-slate-900">
                  {item.organization.name}
                </p>
                <p className="text-sm text-slate-500">{t("dashboard.orgCard.role")}: {item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
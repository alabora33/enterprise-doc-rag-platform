import { useTranslation } from "react-i18next";

export default function ChatPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{t("chat.title")}</h2>
      <p className="mt-2 text-slate-500">
        {t("chat.subtitle")}
      </p>
    </div>
  );
}
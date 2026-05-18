import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient";

const actionClasses = {
  document_upload: "bg-blue-50 text-blue-700 border-blue-200",
  document_retry: "bg-yellow-50 text-yellow-700 border-yellow-200",
  document_processing_completed: "bg-green-50 text-green-700 border-green-200",
  document_processing_failed: "bg-red-50 text-red-700 border-red-200",
  semantic_search: "bg-purple-50 text-purple-700 border-purple-200",
  rag_chat: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function AdminUsagePage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsageData = async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResponse, logsResponse] = await Promise.all([
        axiosClient.get("/admin/usage/summary"),
        axiosClient.get("/admin/usage/logs?limit=100"),
      ]);

      setSummary(summaryResponse.data);
      setLogs(logsResponse.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError(
          t("admin.errorForbidden")
        );
      } else {
        setError(t("admin.errorFetch"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("tr-TR");
  };

  const metricCards = summary
    ? [
        { title: t("admin.metrics.totalDocuments"), value: summary.total_documents, description: t("admin.metrics.totalDocumentsDesc") },
        { title: t("admin.metrics.totalChunks"), value: summary.total_chunks, description: t("admin.metrics.totalChunksDesc") },
        { title: t("admin.metrics.chatSessions"), value: summary.total_chat_sessions, description: t("admin.metrics.chatSessionsDesc") },
        { title: t("admin.metrics.chatMessages"), value: summary.total_chat_messages, description: t("admin.metrics.chatMessagesDesc") },
        { title: t("admin.metrics.usageLogs"), value: summary.total_usage_logs, description: t("admin.metrics.usageLogsDesc") },
        { title: t("admin.metrics.uploads"), value: summary.document_upload_count, description: t("admin.metrics.uploadsDesc") },
        { title: t("admin.metrics.semanticSearches"), value: summary.semantic_search_count, description: t("admin.metrics.semanticSearchesDesc") },
        { title: t("admin.metrics.ragChats"), value: summary.rag_chat_count, description: t("admin.metrics.ragChatsDesc") },
        { title: t("admin.metrics.retries"), value: summary.document_retry_count, description: t("admin.metrics.retriesDesc") },
      ]
    : [];

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t("admin.title")}</h2>
          <p className="mt-2 text-slate-500">
            {t("admin.subtitle")}
          </p>
        </div>

        <button
          onClick={fetchUsageData}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t("admin.refresh")}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          {t("admin.loading")}
        </div>
      )}

      {summary && (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((metric) => (
              <div key={metric.title} className="rounded-2xl bg-white p-6 shadow">
                <p className="text-sm font-medium text-slate-500">
                  {metric.title}
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t("admin.recentLogs")}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {t("admin.recentLogsSubtitle")}
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("admin.colAction")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("admin.colUser")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("admin.colOrg")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("admin.colResource")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("admin.colDetail")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("admin.colCreatedAt")}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        {t("admin.noLogs")}
                      </td>
                    </tr>
                  )}

                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                            actionClasses[log.action] ||
                            "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          {t(`admin.actions.${log.action}`) || log.action}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {log.user_id || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {log.organization_id || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {log.resource_type || "-"}
                        {log.resource_id ? ` #${log.resource_id}` : ""}
                      </td>

                      <td className="max-w-md px-4 py-4 text-sm text-slate-600">
                        <span className="line-clamp-2">
                          {log.detail || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-500">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const actionLabels = {
  document_upload: "Document Upload",
  document_retry: "Document Retry",
  document_processing_completed: "Processing Completed",
  document_processing_failed: "Processing Failed",
  semantic_search: "Semantic Search",
  rag_chat: "RAG Chat",
};

const actionClasses = {
  document_upload: "bg-blue-50 text-blue-700 border-blue-200",
  document_retry: "bg-yellow-50 text-yellow-700 border-yellow-200",
  document_processing_completed: "bg-green-50 text-green-700 border-green-200",
  document_processing_failed: "bg-red-50 text-red-700 border-red-200",
  semantic_search: "bg-purple-50 text-purple-700 border-purple-200",
  rag_chat: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function AdminUsagePage() {
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
          "Bu ekranı görüntülemek için admin yetkisi gerekiyor. Kullanıcının is_superuser değeri true olmalı."
        );
      } else {
        setError("Usage verileri alınırken hata oluştu.");
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
        {
          title: "Total Documents",
          value: summary.total_documents,
          description: "Sisteme yüklenen doküman sayısı",
        },
        {
          title: "Total Chunks",
          value: summary.total_chunks,
          description: "Dokümanlardan çıkarılan metin parçaları",
        },
        {
          title: "Chat Sessions",
          value: summary.total_chat_sessions,
          description: "Toplam konuşma oturumu",
        },
        {
          title: "Chat Messages",
          value: summary.total_chat_messages,
          description: "User + assistant mesajları",
        },
        {
          title: "Usage Logs",
          value: summary.total_usage_logs,
          description: "Toplam kullanım kaydı",
        },
        {
          title: "Uploads",
          value: summary.document_upload_count,
          description: "Doküman yükleme aksiyonları",
        },
        {
          title: "Semantic Searches",
          value: summary.semantic_search_count,
          description: "Semantik arama sayısı",
        },
        {
          title: "RAG Chats",
          value: summary.rag_chat_count,
          description: "RAG cevap üretme sayısı",
        },
        {
          title: "Retries",
          value: summary.document_retry_count,
          description: "Yeniden işleme sayısı",
        },
      ]
    : [];

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Usage</h2>
          <p className="mt-2 text-slate-500">
            Sistem kullanım metriklerini ve son kullanıcı aksiyonlarını izle.
          </p>
        </div>

        <button
          onClick={fetchUsageData}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          Usage verileri yükleniyor...
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
                  Recent Usage Logs
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Son 100 kullanım kaydı.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Organization
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Resource
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Detail
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created At
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
                        Henüz usage log yok.
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
                          {actionLabels[log.action] || log.action}
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
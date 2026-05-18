import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient";
import { ToastContainer, useToast } from "../components/Toast";
import { ConfirmModal } from "../components/ConfirmModal";

const statusClasses = {
  uploaded: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { toasts, addToast, removeToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchDocuments = async () => {
    setLoadingDocuments(true);

    try {
      const response = await axiosClient.get("/documents");
      setDocuments(response.data);
    } catch (err) {
      addToast(t("documents.errors.fetchDocuments"), "error");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      addToast(t("documents.errors.noFileSelected"), "error");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await axiosClient.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSelectedFile(null);
      event.target.reset();
      addToast(t("documents.uploadSuccess"), "success");
      await fetchDocuments();
    } catch (err) {
      addToast(t("documents.errors.uploadFailed"), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = async (documentId) => {
    try {
      await axiosClient.post(`/documents/${documentId}/retry`);
      addToast(t("documents.retrySuccess"), "success");
      await fetchDocuments();
    } catch (err) {
      addToast(t("documents.errors.retryFailed"), "error");
    }
  };

  const handleRefreshStatus = async (documentId) => {
    try {
      const response = await axiosClient.get(`/documents/${documentId}`);
      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document.id === documentId ? response.data : document
        )
      );
    } catch (err) {
      addToast(t("documents.errors.refreshStatusFailed"), "error");
    }
  };
  const handleDelete = (documentId) => {
    setConfirmDeleteId(documentId);
  };

  const handleConfirmDelete = async () => {
    const documentId = confirmDeleteId;
    setConfirmDeleteId(null);

    try {
      await axiosClient.delete(`/documents/${documentId}`);

      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
        setChunks([]);
      }

      addToast(t("documents.deleteSuccess"), "success");
      await fetchDocuments();
    } catch (err) {
      addToast(t("documents.errors.deleteFailed"), "error");
    }
  };
  const handleViewChunks = async (document) => {
    setSelectedDocument(document);
    setChunks([]);
    setLoadingChunks(true);

    try {
      const response = await axiosClient.get(`/documents/${document.id}/chunks`);
      setChunks(response.data);
    } catch (err) {
      addToast(t("documents.errors.fetchChunksFailed"), "error");
    } finally {
      setLoadingChunks(false);
    }
  };

  const formatFileSize = (size) => {
    if (!size) return "-";

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {confirmDeleteId && (
        <ConfirmModal
          title={t("documents.deleteConfirmTitle")}
          message={t("documents.deleteConfirm")}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t("documents.title")}</h2>
          <p className="mt-2 text-slate-500">
            {t("documents.subtitle")}
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t("documents.refreshButton")}
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">
            {t("documents.uploadCard.title")}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {t("documents.uploadCard.description")}
          </p>

          <form onSubmit={handleUpload} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t("documents.uploadCard.fileLabel")}
              </label>

              <input
                type="file"
                accept=".pdf,.docx,.xlsx,.txt"
                onChange={handleFileChange}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
              />
            </div>

            {selectedFile && (
              <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {t("documents.uploadCard.selectedFile")}: <strong>{selectedFile.name}</strong>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {uploading ? t("documents.uploadCard.uploading") : t("documents.uploadCard.uploadButton")}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("documents.listCard.title")}
            </h3>

            {loadingDocuments && (
              <span className="text-sm text-slate-500">{t("documents.listCard.loading")}</span>
            )}
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("documents.listCard.colFile")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("documents.listCard.colStatus")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("documents.listCard.colSize")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("documents.listCard.colActions")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {documents.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      {t("documents.listCard.empty")}
                    </td>
                  </tr>
                )}

                {documents.map((document) => (
                  <tr key={document.id}>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {document.original_file_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t("documents.listCard.idLabel")}: {document.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                          statusClasses[document.status] ||
                          "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {t(`documents.statuses.${document.status}`) || document.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatFileSize(document.file_size)}
                    </td>

                    <td className="px-2 py-4 text-right">
                      <div className="flex justify-end gap-0.5">
                        <button
                          onClick={() => handleViewChunks(document)}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 whitespace-nowrap"
                        >
                          {t("documents.listCard.chunksBtn")}
                        </button>

                        <button
                          onClick={() => handleRetry(document.id)}
                          disabled={document.status === "processing"}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap"
                        >
                          {t("documents.listCard.retryBtn")}
                        </button>

                        <button
                          onClick={() => handleDelete(document.id)}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white bg-red-600 hover:bg-red-700 whitespace-nowrap"
                        >
                          {t("documents.listCard.deleteBtn")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            <span dangerouslySetInnerHTML={{ __html: t("documents.listCard.note") }} />
          </p>
        </div>
      </div>

      {selectedDocument && (
        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("documents.chunksPanel.title")} — {selectedDocument.original_file_name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {t("documents.chunksPanel.description")}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedDocument(null);
                setChunks([]);
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t("documents.chunksPanel.closeButton")}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loadingChunks && (
              <p className="text-sm text-slate-500">{t("documents.chunksPanel.loading")}</p>
            )}

            {!loadingChunks && chunks.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                {t("documents.chunksPanel.empty")}
              </div>
            )}

            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>{t("documents.chunksPanel.chunkLabel")}{chunk.chunk_index}</span>
                  <span>{t("documents.chunksPanel.typeLabel")}: {chunk.source_type || "-"}</span>
                  {chunk.page_number && <span>{t("documents.chunksPanel.pageLabel")}: {chunk.page_number}</span>}
                  {chunk.sheet_name && <span>{t("documents.chunksPanel.sheetLabel")}: {chunk.sheet_name}</span>}
                </div>

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
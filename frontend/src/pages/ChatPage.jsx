import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient";

export default function ChatPage() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(5);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingSessionDetail, setLoadingSessionDetail] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError("");

    try {
      const response = await axiosClient.get("/chat/sessions");
      setSessions(response.data);
    } catch (err) {
      setError(t("chat.errors.fetchSessions"));
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setQuestion("");
    setError("");
    setLoadingSessionDetail(false);
  };

  const openSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setMessages([]);
    setLoadingSessionDetail(true);
    setError("");

    try {
      const response = await axiosClient.get(`/chat/sessions/${sessionId}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      setError(t("chat.errors.fetchSessionDetail"));
    } finally {
      setLoadingSessionDetail(false);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!question.trim()) {
      setError(t("chat.errors.noQuestion"));
      return;
    }

    const userQuestion = question.trim();

    setSending(true);
    setError("");

    const temporaryUserMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: userQuestion,
      created_at: new Date().toISOString(),
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      temporaryUserMessage,
    ]);

    setQuestion("");

    try {
      const response = await axiosClient.post("/chat", {
        question: userQuestion,
        top_k: Number(topK),
        session_id: currentSessionId,
      });

      const data = response.data;

      setCurrentSessionId(data.session_id);

      const assistantMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        created_at: new Date().toISOString(),
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);

      await fetchSessions();
    } catch (err) {
      setError(t("chat.errors.sendFailed"));

      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) => message.id !== temporaryUserMessage.id
        )
      );
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("tr-TR");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t("chat.title")}</h2>
          <p className="mt-2 text-slate-500">
            {t("chat.subtitle")}
          </p>
        </div>

        <button
          onClick={startNewChat}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t("chat.newChat")}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <aside className="rounded-2xl bg-white p-5 shadow lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{t("chat.sessions")}</h3>

            {loadingSessions && (
              <span className="text-xs text-slate-500">{t("chat.loading")}</span>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {sessions.length === 0 && (
              <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">
                {t("chat.noSessions")}
              </p>
            )}

            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => openSession(session.id)}
                className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                  currentSessionId === session.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <p className="line-clamp-2 text-sm font-medium">
                  {session.title || `Session #${session.id}`}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    currentSessionId === session.id
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  {formatDate(session.updated_at)}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl bg-white shadow lg:col-span-3">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-semibold text-slate-900">
              {currentSessionId
                ? `Session #${currentSessionId}`
                : t("chat.newConversation")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {t("chat.responseNote")}
            </p>
          </div>

          <div className="h-[520px] overflow-y-auto bg-slate-50 px-6 py-6">
            {loadingSessionDetail && (
              <p className="text-sm text-slate-500">{t("chat.loadingConversation")}</p>
            )}

            {!loadingSessionDetail && messages.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md text-center">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {t("chat.startTitle")}
                  </h4>
                  <p className="mt-2 text-sm text-slate-500">
                    {t("chat.startExample")}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-5 py-4 shadow-sm ${
                      message.role === "user"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-800"
                    }`}
                  >
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">
                      {message.role === "user" ? t("chat.you") : t("chat.assistant")}
                    </div>

                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {message.content}
                    </p>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t("chat.sources")}
                        </p>

                        <div className="space-y-3">
                          {message.sources.map((source, index) => (
                            <div
                              key={`${source.chunk_id}-${index}`}
                              className="rounded-lg border border-slate-200 bg-white p-3"
                            >
                              <p className="text-sm font-medium text-slate-900">
                                {source.original_file_name}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>{t("chat.docId")}: {source.document_id}</span>
                                <span>{t("chat.chunk")}: {source.chunk_index}</span>

                                {source.page_number && (
                                  <span>{t("chat.page")}: {source.page_number}</span>
                                )}

                                {source.sheet_name && (
                                  <span>{t("chat.sheet")}: {source.sheet_name}</span>
                                )}

                                <span>
                                  {t("chat.score")}: {source.similarity_score.toFixed(3)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
                    {t("chat.generating")}
                  </div>
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSendMessage}
            className="border-t border-slate-200 bg-white px-6 py-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">
                Top K
              </label>

              <select
                value={topK}
                onChange={(event) => setTopK(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
              </select>

              <span className="text-xs text-slate-500">
                {t("chat.topKHint")}
              </span>
            </div>

            <div className="flex gap-3">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows="2"
                placeholder={t("chat.placeholder")}
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />

              <button
                type="submit"
                disabled={sending}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {sending ? t("chat.sending") : t("chat.send")}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
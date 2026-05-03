"use client";

import { useState, useRef, useEffect, use } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useConversations,
  useMessages,
  useCreateConversation,
  useSendMessage,
} from "@/hooks/use-conversations";
import { useRouter } from "next/navigation";

interface ChatPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { projectId } = use(params);
  const router = useRouter();
  const { data: user, isLoading: authLoading } = useAuth();
  const {
    data: conversations,
    isLoading: convsLoading,
  } = useConversations(projectId);
  const createConversation = useCreateConversation(projectId);
  const sendMessage = useSendMessage();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: messages,
    isLoading: messagesLoading,
  } = useMessages(projectId, activeConversationId ?? "");

  // Set active conversation from existing ones
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0]._id);
    }
  }, [conversations, activeConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-2">
          <div className="pulse-dot" />
          <div className="pulse-dot" />
          <div className="pulse-dot" />
        </div>
      </div>
    );
  }

  const handleNewConversation = async () => {
    try {
      const conv = await createConversation.mutateAsync("New Conversation");
      setActiveConversationId(conv._id);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !activeConversationId || isThinking) return;

    const content = inputValue.trim();
    setInputValue("");
    setIsThinking(true);

    // Simulate thinking steps
    setThinkingStep("Processing your message...");
    setTimeout(() => setThinkingStep("Analyzing context..."), 800);
    setTimeout(() => setThinkingStep("Checking integrations..."), 1600);
    setTimeout(() => setThinkingStep("Generating response..."), 2400);

    try {
      await sendMessage.mutateAsync({
        conversationId: activeConversationId,
        content,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsThinking(false);
      setThinkingStep("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 h-full ${sidebarOpen ? "translate-x-0 w-80" : "-translate-x-full w-80 lg:w-0 lg:translate-x-0"} transition-all duration-300 ease-out flex-shrink-0 overflow-hidden border-r flex flex-col`}
        style={{
          background: "rgba(var(--color-surface), 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(var(--color-border), 0.3)",
        }}
        data-testid="chat-sidebar"
      >
        <div className="p-4 border-b" style={{ borderColor: "rgba(var(--color-border), 0.3)" }}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/projects")}
              className="btn-ghost text-xs"
              data-testid="back-to-projects"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Projects
            </button>
          </div>
          <button
            onClick={handleNewConversation}
            disabled={createConversation.isPending}
            className="btn-primary w-full justify-center text-sm"
            data-testid="new-conversation-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {createConversation.isPending ? "Creating..." : "New Chat"}
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2">
          {convsLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversationId(conv._id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                    activeConversationId === conv._id
                      ? "bg-indigo-500/15 border border-indigo-500/30"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                  data-testid={`conversation-${conv._id}`}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 shrink-0 ${
                        activeConversationId === conv._id
                          ? "text-indigo-400"
                          : "text-gray-500"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{conv.title}</div>
                      <div className="text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>
                        {conv.messageCount} messages
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "rgb(var(--color-text-muted))" }}>
                No conversations yet
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header
          className="flex items-center gap-3 px-6 py-4 border-b"
          style={{
            background: "rgba(var(--color-surface), 0.3)",
            borderColor: "rgba(var(--color-border), 0.3)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost p-2 lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {activeConversationId
                ? conversations?.find((c) => c._id === activeConversationId)?.title ?? "Chat"
                : "Select a conversation"}
            </h2>
            {activeConversationId && (
              <p className="text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>
                Powered by Google Gemini
              </p>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost p-2 hidden lg:flex"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
            </svg>
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6" data-testid="messages-container">
          {!activeConversationId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                <p className="text-sm" style={{ color: "rgb(var(--color-text-muted))" }}>
                  Create a new chat or select an existing one
                </p>
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                  <div className="skeleton h-16 w-2/3 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {messages && messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-indigo-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                      </svg>
                    </div>
                    <p className="text-sm" style={{ color: "rgb(var(--color-text-muted))" }}>
                      Send a message to start the conversation
                    </p>
                  </div>
                </div>
              )}

              {messages?.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} fade-in`}
                  data-testid={`message-${msg._id}`}
                >
                  <div
                    className={`max-w-[80%] lg:max-w-[60%] ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-md"
                        : "glass-card rounded-2xl rounded-bl-md"
                    } px-5 py-4`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-indigo-400">AI Assistant</span>
                      </div>
                    )}

                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    <div
                      className={`flex items-center gap-2 mt-2 text-xs ${
                        msg.role === "user"
                          ? "text-white/60"
                          : ""
                      }`}
                      style={msg.role !== "user" ? { color: "rgb(var(--color-text-muted))" } : undefined}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {msg.metadata?.integrationDataUsed &&
                        msg.metadata.integrationDataUsed.length > 0 && (
                          <span className="flex items-center gap-1">
                            <span>•</span>
                            {msg.metadata.integrationDataUsed.map((intg) => (
                              <span
                                key={intg}
                                className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                                style={{
                                  background: "rgba(var(--color-primary), 0.2)",
                                  color: "rgb(var(--color-primary))",
                                }}
                              >
                                {intg}
                              </span>
                            ))}
                          </span>
                        )}
                      {msg.metadata?.processingTimeMs && (
                        <span>• {(msg.metadata.processingTimeMs / 1000).toFixed(1)}s</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex justify-start fade-in" data-testid="thinking-indicator">
                  <div className="glass-card rounded-2xl rounded-bl-md px-5 py-4 max-w-[60%]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-indigo-400">AI is thinking...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="pulse-dot" />
                        <div className="pulse-dot" />
                        <div className="pulse-dot" />
                      </div>
                      <span className="text-xs" style={{ color: "rgb(var(--color-text-muted))" }}>
                        {thinkingStep}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {activeConversationId && (
          <div
            className="border-t p-4"
            style={{
              background: "rgba(var(--color-surface), 0.3)",
              borderColor: "rgba(var(--color-border), 0.3)",
            }}
          >
            <div className="max-w-4xl mx-auto">
              <div
                className="flex items-end gap-3 p-3 rounded-2xl"
                style={{
                  background: "rgba(var(--color-surface-2), 0.5)",
                  border: "1px solid rgba(var(--color-border), 0.5)",
                }}
              >
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed py-1.5"
                  style={{
                    color: "rgb(var(--color-text))",
                    maxHeight: "120px",
                  }}
                  data-testid="chat-input"
                  disabled={isThinking}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isThinking}
                  className="btn-primary p-2.5 rounded-xl shrink-0"
                  data-testid="send-button"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
              <p className="text-center text-[11px] mt-2" style={{ color: "rgb(var(--color-text-muted))" }}>
                AI responses may be inaccurate. Integration data is simulated for demo purposes.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

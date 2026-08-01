import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  getConversations,
  getMessages,
  sendMessage,
  type Conversation,
  type Message,
} from "../api/messages";
import { useAuth } from "../context/AuthContext";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "../helpers/socketHelper";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PRODUCT } from "../lib/copy";

type LocationState = {
  recipientId?: string;
  username?: string;
} | null;

export function Messenger() {
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const recipient = useMemo(() => {
    if (active?.recipient) return active.recipient;
    if (state?.recipientId && state.username) {
      return { _id: state.recipientId, username: state.username };
    }
    return null;
  }, [active, state]);

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user);

    const onReceive = (
      senderId: string,
      username: string,
      content: string
    ) => {
      setMessages((prev) => {
        if (!recipient || recipient._id !== senderId) return prev;
        return [
          {
            _id: `tmp-${Date.now()}`,
            conversation: active?._id || "",
            sender: { _id: senderId, username },
            content,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });
    };

    socket.on("receive-message", onReceive);
    return () => {
      socket.off("receive-message", onReceive);
      disconnectSocket();
    };
  }, [user, recipient, active?._id]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getConversations();
        if (cancelled) return;
        setConversations(data);

        if (state?.recipientId) {
          const existing = data.find(
            (c) => c.recipient?._id === state.recipientId
          );
          if (existing) {
            setActive(existing);
            setMobileShowChat(true);
          } else {
            setActive({
              _id: "",
              recipients: [],
              recipient: {
                _id: state.recipientId,
                username: state.username || "member",
              },
            });
            setMobileShowChat(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load conversations"
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, state?.recipientId, state?.username]);

  useEffect(() => {
    if (!active?._id) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getMessages(active._id);
        if (!cancelled) setMessages(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load messages"
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!user || !recipient || !draft.trim()) return;
    setBusy(true);
    setError("");
    const content = draft.trim();
    setDraft("");

    try {
      const res = await sendMessage(recipient._id, content);
      const socket = getSocket();
      socket?.emit("send-message", recipient._id, user.username, content);

      setMessages((prev) => [
        {
          ...res.message,
          sender:
            typeof res.message.sender === "string"
              ? { _id: user.userId, username: user.username }
              : res.message.sender,
        },
        ...prev,
      ]);

      if (!active?._id) {
        setActive({
          _id: res.conversationId,
          recipients: [],
          recipient,
        });
      }

      const refreshed = await getConversations();
      setConversations(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
      setDraft(content);
    } finally {
      setBusy(false);
    }
  }

  const orderedMessages = [...messages].reverse();

  return (
    <div className="messenger-page">
      <div className={`page-hero ${mobileShowChat ? "hidden lg:flex" : ""}`}>
        <p className="section-eyebrow">{PRODUCT.messengerEyebrow}</p>
        <h1 className="heading-lg">Messages</h1>
        <p className="body-lg">{PRODUCT.messengerLead}</p>
      </div>

      {error ? <p className="error-banner">{error}</p> : null}

      <div className="messenger-layout">
        <div
          className={`messenger-list ${mobileShowChat ? "hidden lg:flex" : "flex"}`}
        >
          <div className="shrink-0 border-b border-border-light px-4 py-3">
            <p className="meta-label">Conversations</p>
          </div>
          <ul className="messenger-list-scroll">
            {conversations.length === 0 ? (
              <li className="body-sm px-4 py-6 text-fg-muted">
                No conversations yet. Message someone from their profile.
              </li>
            ) : (
              conversations.map((conversation) => (
                <li key={conversation._id}>
                  <button
                    type="button"
                    className={`body-sm flex min-h-[52px] w-full items-center px-4 text-left transition hover:bg-bg-alt ${
                      active?._id === conversation._id ? "bg-bg-alt" : ""
                    }`}
                    onClick={() => {
                      setActive(conversation);
                      setMobileShowChat(true);
                    }}
                  >
                    @{conversation.recipient?.username || "member"}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div
          className={`messenger-chat ${mobileShowChat ? "flex" : "hidden lg:flex"}`}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-light px-3 py-3 sm:px-4">
            <p className="body-sm break-words-safe min-w-0 truncate">
              {recipient ? `@${recipient.username}` : "Select a conversation"}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="!w-auto shrink-0 lg:hidden"
              onClick={() => setMobileShowChat(false)}
            >
              Back
            </Button>
          </div>

          <div className="messenger-chat-scroll flex flex-col gap-3">
            {!recipient ? (
              <div className="empty-state my-auto">
                Choose a conversation to start chatting.
              </div>
            ) : orderedMessages.length === 0 ? (
              <div className="empty-state my-auto">
                Say hello to @{recipient.username}.
              </div>
            ) : (
              orderedMessages.map((message) => {
                const mine =
                  String(
                    typeof message.sender === "string"
                      ? message.sender
                      : message.sender._id
                  ) === user?.userId;
                return (
                  <div
                    key={message._id}
                    className={`msg-bubble ${mine ? "mine" : "theirs"}`}
                  >
                    {message.content}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {recipient ? (
            <form className="messenger-compose" onSubmit={onSend}>
              <div className="min-w-0 flex-1">
                <Input
                  id="message"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message"
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                className="!w-auto shrink-0"
                disabled={busy || !draft.trim()}
              >
                Send
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

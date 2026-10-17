import { create } from "zustand";
import {
  listConversations,
  getThread,
  markConversationRead,
  sendReply,
  sendTemplate,
  linkConversation,
  getMediaUrl,
  getUnreadCount,
  getEnquiryHistory,
  searchLinkCandidates,
} from "@/services/WhatsAppInbox";

const LIST_PAGE_SIZE = 30;
// Signed media links last 5 minutes on the server; refresh a little before that.
const MEDIA_URL_TTL_MS = 4 * 60 * 1000;

const EMPTY_THREAD = { conversation: null, messages: [], hasMore: false, nextBefore: null };

const byTimeAsc = (a, b) => new Date(a.at) - new Date(b.at);

// Merges a newest-first page into an oldest-first list, replacing items already
// loaded (their delivery status may have changed).
function mergeMessages(existing, page) {
  const byId = new Map(existing.map((m) => [m._id, m]));
  for (const message of page) byId.set(message._id, message);
  return [...byId.values()].sort(byTimeAsc);
}

const useWhatsAppInboxStore = create((set, get) => ({
  conversations: [],
  total: 0,
  listLimit: LIST_PAGE_SIZE,
  listLoading: false,
  filter: "all",
  search: "",

  unread: { conversations: 0, messages: 0 },

  activeId: null,
  thread: EMPTY_THREAD,
  threadLoading: false,
  olderLoading: false,
  sending: false,

  mediaUrls: {},

  linkCandidates: { enquiries: [], students: [] },
  linkCandidatesLoading: false,

  history: EMPTY_THREAD,
  historyLoading: false,

  error: null,

  // ---- conversation list ----

  fetchConversations: async ({ silent = false } = {}) => {
    const { filter, search, listLimit } = get();
    if (!silent) set({ listLoading: true });
    try {
      const data = await listConversations({ filter, search, page: 1, limit: listLimit });
      // Ignore a response for filters that changed while it was in flight.
      if (get().filter !== filter || get().search !== search) return;
      set({ conversations: data.conversations, total: data.total, listLoading: false });
    } catch (error) {
      set({ error, listLoading: false });
    }
  },

  setFilter: (filter) => {
    set({ filter, listLimit: LIST_PAGE_SIZE });
    return get().fetchConversations();
  },

  setSearch: (search) => {
    set({ search, listLimit: LIST_PAGE_SIZE });
    return get().fetchConversations();
  },

  loadMoreConversations: () => {
    set((state) => ({ listLimit: state.listLimit + LIST_PAGE_SIZE }));
    return get().fetchConversations();
  },

  fetchUnread: async () => {
    try {
      const unread = await getUnreadCount();
      set({ unread });
    } catch (error) {
      set({ error });
    }
  },

  // ---- active thread ----

  openConversation: async (conversationId) => {
    if (!conversationId) {
      set({ activeId: null, thread: EMPTY_THREAD });
      return;
    }
    if (get().activeId === conversationId) return;
    set({ activeId: conversationId, thread: EMPTY_THREAD, threadLoading: true });
    await get().refreshThread();
    set({ threadLoading: false });
  },

  // Loads the newest page and merges it into what is already shown.
  refreshThread: async () => {
    const conversationId = get().activeId;
    if (!conversationId) return;
    try {
      const data = await getThread(conversationId);
      if (get().activeId !== conversationId) return;
      set((state) => {
        const firstLoad = !state.thread.conversation;
        return {
          thread: {
            conversation: data.conversation,
            messages: mergeMessages(state.thread.messages, data.messages),
            hasMore: firstLoad ? data.hasMore : state.thread.hasMore,
            nextBefore: firstLoad ? data.nextBefore : state.thread.nextBefore,
          },
          conversations: state.conversations.map((c) => (c._id === conversationId ? { ...c, ...data.conversation } : c)),
        };
      });
    } catch (error) {
      set({ error });
    }
  },

  loadOlderMessages: async () => {
    const { activeId, thread, olderLoading } = get();
    if (!activeId || !thread.hasMore || olderLoading) return;
    set({ olderLoading: true });
    try {
      const data = await getThread(activeId, thread.nextBefore);
      if (get().activeId !== activeId) return;
      set((state) => ({
        thread: {
          ...state.thread,
          messages: mergeMessages(state.thread.messages, data.messages),
          hasMore: data.hasMore,
          nextBefore: data.nextBefore,
        },
      }));
    } catch (error) {
      set({ error });
    } finally {
      set({ olderLoading: false });
    }
  },

  markRead: async (conversationId) => {
    try {
      await markConversationRead(conversationId);
      set((state) => ({
        conversations: state.conversations.map((c) => (c._id === conversationId ? { ...c, unreadCount: 0 } : c)),
        thread:
          state.thread.conversation?._id === conversationId
            ? { ...state.thread, conversation: { ...state.thread.conversation, unreadCount: 0 } }
            : state.thread,
      }));
      await get().fetchUnread();
    } catch (error) {
      set({ error });
    }
  },

  // Both sends refresh the thread even on failure: a failed row is still saved,
  // and a 409 means the reply window has just closed.
  sendReply: async (text) => {
    const conversationId = get().activeId;
    set({ sending: true });
    try {
      await sendReply(conversationId, text);
    } finally {
      set({ sending: false });
      await get().refreshThread();
      get().fetchConversations({ silent: true });
    }
  },

  sendTemplate: async (payload) => {
    const conversationId = get().activeId;
    set({ sending: true });
    try {
      await sendTemplate(conversationId, payload);
    } finally {
      set({ sending: false });
      await get().refreshThread();
      get().fetchConversations({ silent: true });
    }
  },

  linkConversation: async (payload) => {
    const conversationId = get().activeId;
    const conversation = await linkConversation(conversationId, payload);
    set((state) => ({
      thread: state.activeId === conversationId ? { ...state.thread, conversation } : state.thread,
      conversations: state.conversations.map((c) => (c._id === conversationId ? { ...c, ...conversation } : c)),
    }));
    return conversation;
  },

  fetchLinkCandidates: async (search) => {
    set({ linkCandidatesLoading: true });
    try {
      const linkCandidates = await searchLinkCandidates(search);
      set({ linkCandidates, linkCandidatesLoading: false });
    } catch (error) {
      set({ error, linkCandidatesLoading: false });
    }
  },

  clearLinkCandidates: () => set({ linkCandidates: { enquiries: [], students: [] } }),

  // ---- media ----

  // Returns a cached signed link while it is still fresh.
  resolveMediaUrl: async (messageId) => {
    const cached = get().mediaUrls[messageId];
    if (cached && cached.expiresAt > Date.now()) return cached;
    const data = await getMediaUrl(messageId);
    const entry = { ...data, expiresAt: Date.now() + MEDIA_URL_TTL_MS };
    set((state) => ({ mediaUrls: { ...state.mediaUrls, [messageId]: entry } }));
    return entry;
  },

  // ---- enquiry history (read-only, from the enquiry drawer) ----

  fetchEnquiryHistory: async (enquiryId, { older = false } = {}) => {
    const before = older ? get().history.nextBefore : undefined;
    set(older ? { olderLoading: true } : { historyLoading: true, history: EMPTY_THREAD });
    try {
      const data = await getEnquiryHistory(enquiryId, before);
      set((state) => ({
        history: {
          conversation: data.conversationId ? { _id: data.conversationId } : null,
          phone: data.phone,
          messages: mergeMessages(older ? state.history.messages : [], data.messages),
          hasMore: data.hasMore,
          nextBefore: data.nextBefore,
        },
      }));
    } catch (error) {
      set({ error });
      throw error;
    } finally {
      set({ historyLoading: false, olderLoading: false });
    }
  },
}));

export default useWhatsAppInboxStore;

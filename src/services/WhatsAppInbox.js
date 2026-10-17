import { get, patch, post } from "@utils/Requests";

const BASE = "/v2/whatsapp-inbox";

export async function listConversations({ filter = "all", search = "", page = 1, limit = 30 } = {}) {
  const query = new URLSearchParams({ filter, page, limit });
  if (search) query.set("search", search);
  const res = await get(`${BASE}/conversations?${query.toString()}`);
  return res.data;
}

export async function getThread(conversationId, before) {
  const query = before ? `?before=${encodeURIComponent(before)}` : "";
  const res = await get(`${BASE}/conversations/${conversationId}/messages${query}`);
  return res.data;
}

export async function markConversationRead(conversationId) {
  const res = await post(`${BASE}/conversations/${conversationId}/read`, {});
  return res.data;
}

export async function sendReply(conversationId, text) {
  const res = await post(`${BASE}/conversations/${conversationId}/reply`, { text });
  return res.data;
}

export async function sendTemplate(conversationId, { templateName, language, variables }) {
  const res = await post(`${BASE}/conversations/${conversationId}/template`, { templateName, language, variables });
  return res.data;
}

export async function linkConversation(conversationId, { enquiryId, studentId }) {
  const res = await patch(`${BASE}/conversations/${conversationId}/link`, { enquiryId, studentId });
  return res.data;
}

export async function getMediaUrl(messageId) {
  const res = await get(`${BASE}/messages/${messageId}/media`);
  return res.data;
}

export async function getUnreadCount() {
  const res = await get(`${BASE}/unread-count`);
  return res.data;
}

export async function getEnquiryHistory(enquiryId, before) {
  const query = before ? `?before=${encodeURIComponent(before)}` : "";
  const res = await get(`${BASE}/enquiries/${enquiryId}/history${query}`);
  return res.data;
}

export async function searchLinkCandidates(search) {
  const res = await get(`${BASE}/link-candidates?search=${encodeURIComponent(search)}`);
  return res.data;
}

import { del, get, post, put } from "@utils/Requests";

export async function listWhatsAppTemplates(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.approvalStatus) query.set("approvalStatus", params.approvalStatus);
  const res = await get(`/v2/whatsapp-templates?${query.toString()}`);
  return res.data;
}

export async function getWhatsAppTemplate(id) {
  const res = await get(`/v2/whatsapp-templates/${id}`);
  return res.data;
}

export async function createWhatsAppTemplate(data) {
  const res = await post("/v2/whatsapp-templates", data);
  return res.data;
}

export async function updateWhatsAppTemplate(id, data) {
  const res = await put(`/v2/whatsapp-templates/${id}`, data);
  return res.data;
}

export async function deleteWhatsAppTemplate(id) {
  return await del(`/v2/whatsapp-templates/${id}`);
}

export async function submitTemplateToMeta(id) {
  const res = await post(`/v2/whatsapp-templates/${id}/submit`);
  return res.data;
}

export async function syncTemplateStatus(id) {
  const res = await post(`/v2/whatsapp-templates/${id}/sync-status`);
  return res.data;
}

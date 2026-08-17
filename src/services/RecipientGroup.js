import { del, get, post, put } from "@utils/Requests";

export async function listRecipientGroups(params = {}) {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.center_id) query.set("center_id", params.center_id);
  const res = await get(`/v2/recipient-groups?${query.toString()}`);
  return res.data;
}

export async function getRecipientGroup(id) {
  const res = await get(`/v2/recipient-groups/${id}`);
  return res.data;
}

export async function createRecipientGroup(data) {
  const res = await post("/v2/recipient-groups", data);
  return res.data;
}

export async function updateRecipientGroup(id, data) {
  const res = await put(`/v2/recipient-groups/${id}`, data);
  return res.data;
}

export async function deleteRecipientGroup(id) {
  return await del(`/v2/recipient-groups/${id}`);
}

// Resolves membership for an already-saved group (also refreshes memberCountCache).
export async function previewSavedGroup(id) {
  const res = await post(`/v2/recipient-groups/${id}/preview`);
  return res.data;
}

// Resolves membership for a not-yet-saved draft (form preview, before Save).
export async function previewDraftGroup(draft) {
  const res = await post("/v2/recipient-groups/preview", draft);
  return res.data;
}

export async function importCsvRows(rows) {
  const res = await post("/v2/recipient-groups/import-csv", { rows });
  return res.data;
}

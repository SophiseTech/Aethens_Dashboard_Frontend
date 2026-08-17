import { get, post, put } from "@utils/Requests";

export async function listCampaigns(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.center_id) query.set("center_id", params.center_id);
  const res = await get(`/v2/campaigns?${query.toString()}`);
  return res.data;
}

export async function getCampaign(id) {
  const res = await get(`/v2/campaigns/${id}`);
  return res.data;
}

export async function createCampaign(data) {
  const res = await post("/v2/campaigns", data);
  return res.data;
}

export async function updateCampaign(id, data) {
  const res = await put(`/v2/campaigns/${id}`, data);
  return res.data;
}

export async function queueCampaign(id) {
  const res = await post(`/v2/campaigns/${id}/queue`);
  return res.data;
}

export async function pauseCampaign(id) {
  const res = await post(`/v2/campaigns/${id}/pause`);
  return res.data;
}

export async function resumeCampaign(id) {
  const res = await post(`/v2/campaigns/${id}/resume`);
  return res.data;
}

export async function cancelCampaign(id) {
  const res = await post(`/v2/campaigns/${id}/cancel`);
  return res.data;
}

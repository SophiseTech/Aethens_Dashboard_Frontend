import { get } from "@utils/Requests";

export async function getDashboardKpis(params = {}) {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  const res = await get(`/v2/whatsapp/analytics/dashboard?${query.toString()}`);
  return res.data;
}

export async function getCampaignsOverview(params = {}) {
  const query = new URLSearchParams();
  if (params.center_id) query.set("center_id", params.center_id);
  const res = await get(`/v2/whatsapp/analytics/campaigns?${query.toString()}`);
  return res.data;
}

export async function getTemplatePerformance(params = {}) {
  const query = new URLSearchParams();
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  const res = await get(`/v2/whatsapp/analytics/templates?${query.toString()}`);
  return res.data;
}

export async function getCampaignFunnel(campaignId) {
  const res = await get(`/v2/whatsapp/analytics/campaigns/${campaignId}/funnel`);
  return res.data;
}

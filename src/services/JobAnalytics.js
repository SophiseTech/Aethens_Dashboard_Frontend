import { get } from "@utils/Requests";

export async function listJobs() {
  const res = await get("/v2/job-analytics/jobs");
  return res.data;
}

export async function listJobRuns({ jobName, page = 1, limit = 20, status, dateFrom, dateTo } = {}) {
  const query = new URLSearchParams();
  query.set("page", page);
  query.set("limit", limit);
  if (status) query.set("status", status);
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);
  const res = await get(`/v2/job-analytics/jobs/${encodeURIComponent(jobName)}/runs?${query.toString()}`);
  return res.data;
}

export async function getRunRecipients({ runId, page = 1, limit = 20, status } = {}) {
  const query = new URLSearchParams();
  query.set("page", page);
  query.set("limit", limit);
  if (status) query.set("status", status);
  const res = await get(`/v2/job-analytics/runs/${runId}/recipients?${query.toString()}`);
  return res.data;
}

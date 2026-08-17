import { get, post } from "@utils/Requests";

export async function listOptOuts(active) {
  const query = new URLSearchParams();
  if (active !== undefined) query.set("active", active);
  const res = await get(`/v2/whatsapp-optouts?${query.toString()}`);
  return res.data;
}

export async function recordOptOut(phone, notes) {
  const res = await post("/v2/whatsapp-optouts/opt-out", { phone, notes });
  return res.data;
}

export async function recordOptIn(phone, notes) {
  const res = await post("/v2/whatsapp-optouts/opt-in", { phone, notes });
  return res.data;
}

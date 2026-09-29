import { del, get, post, put } from "@utils/Requests";

export async function listEnquiryDocumentSets(params = {}) {
  const query = new URLSearchParams();
  if (params.courseId) query.set("courseId", params.courseId);
  const res = await get(`/v2/enquiry-document-sets?${query.toString()}`);
  return res.data;
}

export async function createEnquiryDocumentSet(data) {
  const res = await post("/v2/enquiry-document-sets", data);
  return res.data;
}

export async function updateEnquiryDocumentSet(id, data) {
  const res = await put(`/v2/enquiry-document-sets/${id}`, data);
  return res.data;
}

export async function deleteEnquiryDocumentSet(id) {
  return await del(`/v2/enquiry-document-sets/${id}`);
}

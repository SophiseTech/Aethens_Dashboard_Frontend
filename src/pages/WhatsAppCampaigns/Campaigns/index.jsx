import React, { useState } from "react";
import CampaignList from "./CampaignList";
import CampaignForm from "./CampaignForm";
import CampaignDetailDrawer from "./CampaignDetailDrawer";

export default function CampaignsTab() {
  const [detailId, setDetailId] = useState(null);

  return (
    <div>
      <CampaignList onViewDetail={setDetailId} />
      <CampaignForm />
      <CampaignDetailDrawer campaignId={detailId} open={Boolean(detailId)} onClose={() => setDetailId(null)} />
    </div>
  );
}

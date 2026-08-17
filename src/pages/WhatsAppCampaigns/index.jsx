import React from "react";
import { Tabs } from "antd";
import Title from "@components/layouts/Title";
import RecipientsTab from "./Recipients";
import TemplatesTab from "./Templates";
import CampaignsTab from "./Campaigns";
import AnalyticsTab from "./Analytics";

export default function WhatsAppCampaignsPage() {
  const items = [
    { key: "campaigns", label: "Campaigns", children: <CampaignsTab /> },
    { key: "recipients", label: "Recipients", children: <RecipientsTab /> },
    { key: "templates", label: "Templates", children: <TemplatesTab /> },
    { key: "analytics", label: "Analytics", children: <AnalyticsTab /> },
  ];

  return (
    <Title title={"WhatsApp Campaigns"}>
      <div className="mx-auto p-4 w-full">
        <Tabs defaultActiveKey="campaigns" items={items} />
      </div>
    </Title>
  );
}

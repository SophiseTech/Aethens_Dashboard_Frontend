import React, { useState } from "react";
import { Segmented } from "antd";
import MessagingDashboard from "./MessagingDashboard";
import JobAnalytics from "./JobAnalytics";

export default function AnalyticsTab() {
  const [view, setView] = useState("messaging");

  return (
    <div className="space-y-4">
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { label: "Messaging", value: "messaging" },
          { label: "Jobs", value: "jobs" },
        ]}
      />
      {view === "messaging" ? <MessagingDashboard /> : <JobAnalytics />}
    </div>
  );
}

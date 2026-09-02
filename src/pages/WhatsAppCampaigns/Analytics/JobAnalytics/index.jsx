import React, { useEffect, useState } from "react";
import { Breadcrumb } from "antd";
import useJobAnalyticsStore from "@/stores/JobAnalyticsStore";
import JobList from "./JobList";
import RunHistory from "./RunHistory";
import RunRecipients from "./RunRecipients";

export default function JobAnalytics() {
  const { fetchJobs } = useJobAnalyticsStore();
  const [selectedJob, setSelectedJob] = useState(null);
  const [recipientRunId, setRecipientRunId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          {
            title: selectedJob ? (
              <a onClick={() => setSelectedJob(null)}>Jobs</a>
            ) : (
              "Jobs"
            ),
          },
          ...(selectedJob ? [{ title: selectedJob }] : []),
        ]}
      />

      {selectedJob ? (
        <RunHistory jobName={selectedJob} onViewRecipients={setRecipientRunId} />
      ) : (
        <JobList onSelectJob={setSelectedJob} />
      )}

      <RunRecipients
        runId={recipientRunId}
        open={Boolean(recipientRunId)}
        onClose={() => setRecipientRunId(null)}
      />
    </div>
  );
}

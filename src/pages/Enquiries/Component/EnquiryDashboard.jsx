"use client";

import { useState } from "react";
import { Card, Row, Col, Typography, Tag, Divider, Spin, Alert, Button, Select } from "antd";
import EChart from "@pages/Dashboard/Chart/EChart";
import enquiryService from "@/services/Enquiry";
import centersStore from "@stores/CentersStore";
const { Title, Text } = Typography;

export default function EnquiryDashboard() {
  const { selectedCenter } = centersStore();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("last_month");
  const [error, setError] = useState(null);

  /* ----------------------------------------------------------
     MANUAL LOAD TRIGGER
  ---------------------------------------------------------- */
  const handleLoadMetrics = async () => {
    setLoading(true);
    setError(null);
    setMetrics(null);

    try {
      const res = await enquiryService.getEnquiryKPI(period, undefined, undefined, selectedCenter);

      if (!res) {
        throw new Error("No response received from server.");
      }

      setMetrics(res);
    } catch (err) {
      console.error("KPI Load Error:", err);
      setError(err.message || "Failed to fetch KPI metrics.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------
     INITIAL VIEW (before clicking load)
  ---------------------------------------------------------- */
  if (!metrics && !loading) {
    return (
      <div className="p-6 space-y-6">
        <Card className="rounded-xl shadow-sm p-6">
          <Title level={3}>Enquiry Insights Dashboard</Title>

          <Alert
            type="info"
            showIcon
            message="Heavy operation"
            description="Generating analytics involves large data aggregations. 
                         Click the button below to generate the detailed KPI report."
            className="mt-4"
          />

          {/* Period Selector */}
          <div className="mt-6 flex items-center gap-3">
            <Select
              value={period}
              onChange={(value) => setPeriod(value)}
              className="min-w-[150px]"
              size="middle"
              options={[
                { label: "This Week", value: "this_week" },
                { label: "Last Week", value: "last_week" },
                { label: "This Month", value: "this_month" },
                { label: "Last Month", value: "last_month" },
                { label: "Last Quarter", value: "last_quarter" },
              ]}
            />

            <Button
              type="primary"
              onClick={handleLoadMetrics}
              loading={loading}
            >
              Generate Report
            </Button>
          </div>

          {error && (
            <Alert
              type="error"
              showIcon
              message="Error"
              description={error}
              className="mt-4"
            />
          )}
        </Card>
      </div>
    );
  }

  /* ----------------------------------------------------------
     LOADING STATE
  ---------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <Spin tip="Generating report..." size="large" />
      </div>
    );
  }

  /* ----------------------------------------------------------
     AFTER LOADING — SHOW DASHBOARD
  ---------------------------------------------------------- */

  const stageLabels = Object.keys(metrics.executive?.stageBreakdown || {});
  const stageValues = Object.values(metrics.executive?.stageBreakdown || {});

  const stagePie = {
    series: stageValues,
    options: {
      chart: { type: "donut" },
      labels: stageLabels,
      legend: { position: "bottom" },
      stroke: { width: 0 },
      colors: ["#4C6FFF", "#00C2A8", "#FFB457", "#A66BFF"],
      dataLabels: { enabled: true },
    },
  };



  const leadLabels = metrics.leadSources.map((l) => l._id || "Unknown");
  const leadValues = metrics.leadSources.map((l) => l.total);

  const leadPie = {
    series: leadValues,
    options: {
      chart: { type: "pie" },
      labels: leadLabels,
      legend: { position: "bottom" },
      stroke: { width: 0 },
      colors: [
        "#4C6FFF", // royal blue
        "#29A9FF", // sky blue
        "#00C2A8", // mint teal
        "#FF8DC7", // pink coral
        "#FFB457", // gold peach
      ],
      dataLabels: { enabled: true },
    },
  };


  const demoLabels = metrics.demoPerformance.map((d) => d._id || "Unknown");
  const demoValues = metrics.demoPerformance.map((d) => d.count);

  const demoPie = {
    series: demoValues,
    options: {
      chart: { type: "pie" },
      labels: demoLabels,
      legend: { position: "bottom" },
      stroke: { width: 0 },
      colors: [
        "#4C6FFF", // blue
        "#FFB457", // peach gold
        "#FF7A7A", // soft red
        "#6EDC82", // green
      ],
      dataLabels: { enabled: true },
    },
  };

  // Closed Reason Breakdown
  const closedLabels = metrics.closedReasonBreakdown?.map((r) => r._id) || [];
  const closedValues = metrics.closedReasonBreakdown?.map((r) => r.count) || [];

  const closedPie = {
    series: closedValues,
    options: {
      chart: { type: "pie" },
      labels: closedLabels,
      legend: { position: "bottom" },
      stroke: { width: 0 },
      colors: [
        "#4C6FFF", // blue
        "#00C2A8", // mint
        "#FF7A7A", // red
        "#FFB457", // peach gold
        "#A66BFF", // purple
        "#29A9FF", // light blue
        "#6EDC82", // green
      ],
      dataLabels: { enabled: true },
    },
  };

  const staleStageLabels = metrics?.staleMetrics?.map(item => item._id) || [];
  const staleStageCounts = metrics?.staleMetrics?.map(item => item.count) || [];

  const staleStageBarOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "25%",
        distributed: true
      }
    },
    colors: ["#4B9EFF", "#FFB74D", "#66BB6A", "#EF5350"],
    dataLabels: {
      enabled: true
    },
    xaxis: {
      categories: staleStageLabels
    }
  };

  const staleStageBarSeries = [
    {
      name: "Stale Enquiries",
      data: staleStageCounts
    }
  ];



  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Title level={3} className="!mb-0">
          Enquiry Insights Dashboard
        </Title>

        <div className="flex gap-3">
          <Select
            value={period}
            onChange={(value) => setPeriod(value)}
            className="min-w-[150px]"
            size="middle"
            options={[
              { label: "This Week", value: "this_week" },
              { label: "Last Week", value: "last_week" },
              { label: "This Month", value: "this_month" },
              { label: "Last Month", value: "last_month" },
              { label: "Last Quarter", value: "last_quarter" },
            ]}
          />

          <Button type="primary" onClick={handleLoadMetrics}>
            Refresh Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card className="rounded-xl shadow-sm">
            <Text>Total Enquiries</Text>
            <Title level={3}>{metrics.executive?.totalEnquiries}</Title>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="rounded-xl shadow-sm">
            <Text>Conversion Rate</Text>
            <Title level={3}>
              {metrics.executive?.conversionRate?.toFixed(1)}%
            </Title>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="rounded-xl shadow-sm">
            <Text>Stale Enquiries</Text>
            <Title level={3}>{metrics.staleTotal?.totalStale || 0}</Title>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="rounded-xl shadow-sm">
            <Text>Centers Active</Text>
            <Title level={3}>{metrics.centerStats?.length}</Title>
          </Card>
        </Col>

        {/* Stage Funnel Pie */}
        <Col xs={24} md={12} xl={8}>
          <Card className="rounded-xl shadow-sm">
            <Title level={4}>Stage Funnel</Title>
            <EChart
              series={[...stagePie.series]}
              options={stagePie.options}
              className="w-full"
            />
          </Card>
        </Col>

        {/* Lead Source Pie */}
        <Col xs={24} md={12} xl={8}>
          <Card className="rounded-xl shadow-sm">
            <Title level={4}>Lead Sources</Title>
            <EChart
              series={[...leadPie.series]}
              options={leadPie.options}
              className="w-full"
            />
          </Card>
        </Col>

        {/* Demo Performance Pie */}
        <Col xs={24} md={12} xl={8}>
          <Card className="rounded-xl shadow-sm">
            <Title level={4}>Demo Performance</Title>
            <EChart
              series={[...demoPie.series]}
              options={demoPie.options}
              className="w-full"
            />

            <Divider />

            <Text strong>Demo → Enrollment Conversion:</Text>{" "}
            <Tag color="green">
              {metrics.demoConversion?.demoToEnrollRate?.toFixed(1)}%
            </Tag>
          </Card>
        </Col>

        {/* Closed Reason Breakdown Pie */}
        <Col xs={24} md={12} xl={8}>
          <Card className="rounded-xl shadow-sm">
            <Title level={4}>Closed Reason Breakdown</Title>

            {closedValues.length > 0 ? (
              <EChart
                series={[...closedPie.series]}
                options={closedPie.options}
                className="w-full"
              />
            ) : (
              <Text type="secondary">No closed reasons available for this period.</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12} xl={8}>
          <Card className="rounded-xl shadow-sm">
            <Title level={4}>Stale Enquiries by Stage</Title>

            {staleStageBarSeries?.length > 0 ? (
              <EChart series={staleStageBarSeries} options={staleStageBarOptions} />
            ) : (
              <Text type="secondary">No stale enquiries available for this period.</Text>
            )}
          </Card>
        </Col>


      </Row>



      {/* Center Stats */}
      <Card className="rounded-xl shadow-sm">
        <Title level={4}>Center Performance</Title>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metrics.centerStats.map((center) => (
            <Card
              key={center._id}
              size="small"
              className="shadow-sm rounded-lg border flex justify-between items-center px-4 py-2"
            >
              <div>
                <Text strong>{center._id}</Text>
                <Text className="text-gray-500 text-sm block">
                  Enquiries: {center.total}
                </Text>
              </div>

              <div className="text-right">
                <Text className="block text-blue-600">
                  Conv: {center.conversionRate.toFixed(1)}%
                </Text>
                <Text className="block text-red-500">
                  Stale: {center.stale}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

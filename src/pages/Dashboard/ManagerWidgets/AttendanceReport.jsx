import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Select, DatePicker, Row, Col, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import EChart from '@pages/Dashboard/Chart/EChart';
import userStore from '@stores/UserStore';
import centerStore from '@stores/CentersStore';
import { useStore } from 'zustand';
import dayjs from 'dayjs';
import { getMonthRange } from '@utils/helper';
import { post } from '@utils/Requests';

const { RangePicker } = DatePicker;

function AttendanceReport({ dateRange: dashboardDateRange, onDateRangeChange }) {
  /* ---------------- State ---------------- */
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [dateRange, setDateRange] = useState(getMonthRange(new Date()));
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({
    totalSlots: 0,
    presentCount: 0,
    absentCount: 0,
  });

  const [courses, setCourses] = useState([]);

  const isSyncingFromParent = useRef(false);
  const isSyncingFromSelf = useRef(false);

  const { user } = useStore(userStore);
  const { selectedCenter } = useStore(centerStore);

  /* ---------------- Sync from Dashboard ---------------- */
  useEffect(() => {
    if (!dashboardDateRange?.firstDay || !dashboardDateRange?.lastDay) return;

    if (isSyncingFromSelf.current) {
      isSyncingFromSelf.current = false;
      return;
    }

    isSyncingFromParent.current = true;
    setTimeFilter('custom');
    setCustomDateRange([
      dayjs(dashboardDateRange.firstDay),
      dayjs(dashboardDateRange.lastDay),
    ]);
    setDateRange(dashboardDateRange);
  }, [dashboardDateRange?.firstDay, dashboardDateRange?.lastDay]);

  /* ---------------- Date Calculation ---------------- */
  useEffect(() => {
    const now = dayjs();
    let firstDay, lastDay;

    switch (timeFilter) {
      case 'daily':
        firstDay = now.startOf('day');
        lastDay = now.endOf('day');
        break;
      case 'weekly':
        firstDay = now.startOf('week');
        lastDay = now.endOf('week');
        break;
      case 'monthly':
        firstDay = now.startOf('month');
        lastDay = now.endOf('month');
        break;
      case 'yearly':
        firstDay = now.startOf('year');
        lastDay = now.endOf('year');
        break;
      case 'custom':
        if (!customDateRange) return;
        firstDay = customDateRange[0].startOf('day');
        lastDay = customDateRange[1].endOf('day');
        break;
      default:
        return;
    }

    const nextRange = {
      firstDay: firstDay.format('YYYY-MM-DD'),
      lastDay: lastDay.format('YYYY-MM-DD'),
    };

    setDateRange(nextRange);

    if (isSyncingFromParent.current) {
      isSyncingFromParent.current = false;
      return;
    }

    if (
      onDateRangeChange &&
      (dashboardDateRange?.firstDay !== nextRange.firstDay ||
        dashboardDateRange?.lastDay !== nextRange.lastDay)
    ) {
      isSyncingFromSelf.current = true;
      onDateRangeChange(nextRange);
    }
  }, [timeFilter, customDateRange]);

  /* ---------------- Single API Call ---------------- */
  useEffect(() => {
    if (!dateRange.firstDay || !dateRange.lastDay) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const centerId =
          user.role === 'admin' ? selectedCenter : user.center_id;

        const payload = {
          filters: {
            query: { center_id: centerId },
            recordQuery: {
              date: {
                $gte: dateRange.firstDay,
                $lte: dateRange.lastDay,
              },
            },
          },
        };

        const res = await post('/attendance/report', payload);

        setSummary(res?.data?.summary || {
          totalSlots: 0,
          presentCount: 0,
          absentCount: 0,
        });

        setCourses(res?.data?.courses || []);
      } catch (e) {
        console.error('Attendance fetch failed', e);
        setSummary({ totalSlots: 0, presentCount: 0, absentCount: 0 });
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, user, selectedCenter]);

  /* ---------------- Overall Pie ---------------- */
  const overallChart = useMemo(() => {
    if (!summary.totalSlots) return null;

    return {
      series: [summary.presentCount, summary.absentCount],
      options: {
        chart: { type: 'pie' },
        labels: ['Present', 'Absent'],
        colors: ['#00C2A8', '#FF6B6B'],
        legend: { position: 'bottom' },
        tooltip: {
          y: { formatter: (val) => `${val} sessions` },
        },
      },
    };
  }, [summary]);

  /* ---------------- Course-wise Bar ---------------- */
/* ---------------- Course-wise Bar ---------------- */
const courseChart = useMemo(() => {
  if (!courses.length) return null;

  const fullCourseNames = courses.map(
    (c) => c.course_name || 'Not Specified'
  );

  return {
    series: [
      {
        name: 'Present',
        data: courses.map((c) => c.presentCount || 0),
      },
      {
        name: 'Absent',
        data: courses.map((c) => c.absentCount || 0),
      },
    ],
    options: {
      chart: {
        type: 'bar',
        stacked: true,
        toolbar: { show: false },
      },

      grid: {
        padding: {
          left: 20,
          right: 20,
          bottom: 70,
          top: 20,
        },
      },

      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4,
        },
      },

      xaxis: {
        categories: fullCourseNames,
        labels: {
          rotate: -35,
          rotateAlways: true,
          style: { fontSize: '11px' },
          formatter: (value) =>
            value.length > 14 ? `${value.slice(0, 14)}…` : value,
        },
        tooltip: {
          enabled: false, // disable broken default tooltip
        },
      },

      yaxis: {
        labels: {
          style: { fontSize: '11px' },
        },
      },

      legend: {
        position: 'top',
        horizontalAlign: 'right',
      },

      colors: ['#00C2A8', '#FF6B6B'],

      tooltip: {
        shared: true,
        intersect: false,

        // ✅ THIS fixes full course name visibility
        custom: ({ dataPointIndex, series }) => {
          const name = fullCourseNames[dataPointIndex];

          return `
            <div style="padding:8px 10px">
              <strong>${name}</strong>
              <div>Present: ${series[0][dataPointIndex]}</div>
              <div>Absent: ${series[1][dataPointIndex]}</div>
            </div>
          `;
        },
      },
    },
  };
}, [courses]);



  /* ---------------- UI ---------------- */
  return (
    <Card
      className="border border-border w-full"
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          Attendance Report
        </div>
      }
      extra={
        <div className="flex gap-2">
          <Select
            value={timeFilter}
            onChange={(v) => {
              setTimeFilter(v);
              if (v !== 'custom') setCustomDateRange(null);
            }}
            style={{ width: 120 }}
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' },
              { label: 'Custom', value: 'custom' },
            ]}
          />
          {timeFilter === 'custom' && (
            <RangePicker
              value={customDateRange}
              onChange={setCustomDateRange}
            />
          )}
        </div>
      }
    >
      {loading ? (
        <Spin />
      ) : !courses.length ? (
        <Empty description="No attendance data" />
      ) : (
        <Row gutter={[20, 20]}>
          {/* Summary */}
          <Col span={24}>
            <Card>
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-xs text-gray-500">Total Sessions</div>
                  <div className="text-lg font-semibold">
                    {summary.totalSlots}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">Present</div>
                  <div className="text-lg font-semibold">
                    {summary.presentCount}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-500">Absent</div>
                  <div className="text-lg font-semibold">
                    {summary.absentCount}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Overall Pie */}
          <Col span={24}>
            <Card title="Overall Attendance">
              {overallChart && (
                <EChart
                  series={overallChart.series}
                  options={overallChart.options}
                  height={260}
                />
              )}
            </Card>
          </Col>

          {/* Course-wise Bar */}
          <Col span={24}>
            <Card title="Course-wise Attendance">
              {courseChart && (
                <EChart
                  series={courseChart.series}
                  options={courseChart.options}
                  height={320}
                />
              )}
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default AttendanceReport;

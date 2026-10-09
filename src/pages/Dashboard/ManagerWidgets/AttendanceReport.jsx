import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Spin, Empty, Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import EChart from '@pages/Dashboard/Chart/EChart';
import userStore from '@stores/UserStore';
import centerStore from '@stores/CentersStore';
import { useStore } from 'zustand';
import { post } from '@utils/Requests';

const EMPTY_SUMMARY = { totalSlots: 0, presentCount: 0, absentCount: 0 };

// Driven entirely by the dashboard's date range — no widget-level date filter.
function AttendanceReport({ dateRange }) {
  /* ---------------- State ---------------- */
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [courses, setCourses] = useState([]);

  const { user } = useStore(userStore);
  const { selectedCenter } = useStore(centerStore);

  /* ---------------- Single API Call ---------------- */
  useEffect(() => {
    if (!dateRange?.firstDay || !dateRange?.lastDay) return;
    // Ignore a response that arrives after the date/center has changed again
    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        const centerId =
          (user.role === 'admin' || user.role === 'academic_manager') ? selectedCenter : user.center_id;

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
        if (ignore) return;

        setSummary(res?.data?.summary || EMPTY_SUMMARY);
        setCourses(res?.data?.courses || []);
      } catch (e) {
        if (ignore) return;
        console.error('Attendance fetch failed', e);
        setSummary(EMPTY_SUMMARY);
        setCourses([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => { ignore = true; };
  }, [dateRange?.firstDay, dateRange?.lastDay, user?.role, user?.center_id, selectedCenter]);

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
    >
      {loading ? (
        <Spin />
      ) : !courses.length ? (
        <Empty description="No attendance data" />
      ) : (
        <Row gutter={[20, 20]}>
          {/* Summary */}
          <Col span={12}>
            <Flex vertical gap={5}>
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

              {/* Overall Pie */}
              <Card title="Overall Attendance">
                {overallChart && (
                  <EChart
                    series={overallChart.series}
                    options={overallChart.options}
                    height={260}
                  />
                )}
              </Card>
            </Flex>
          </Col>

          {/* Course-wise Bar */}
          <Col span={12}>
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

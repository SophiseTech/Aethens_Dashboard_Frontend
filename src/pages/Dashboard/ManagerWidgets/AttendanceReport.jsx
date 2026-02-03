import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Select, DatePicker, Row, Col, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import EChart from '@pages/Dashboard/Chart/EChart';
import attendanceService from '@services/Attendance';
import userStore from '@stores/UserStore';
import centerStore from '@stores/CentersStore';
import { useStore } from 'zustand';
import dayjs from 'dayjs';
import { getMonthRange } from '@utils/helper';
import { post } from '@utils/Requests';

const { RangePicker } = DatePicker;

function AttendanceReport({ dateRange: dashboardDateRange, onDateRangeChange }) {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [dateRange, setDateRange] = useState(getMonthRange(new Date()));
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const isSyncingFromParent = useRef(false);
  const isSyncingFromSelf = useRef(false);
  const [summary, setSummary] = useState({
    totalSlots: 0,
    presentCount: 0,
    absentCount: 0,
    notMarkedCount: 0,
  });

  const { user } = useStore(userStore);
  const { selectedCenter } = useStore(centerStore);

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
    setDateRange({
      firstDay: dashboardDateRange.firstDay,
      lastDay: dashboardDateRange.lastDay,
    });
  }, [dashboardDateRange?.firstDay, dashboardDateRange?.lastDay]);

  // Calculate date range based on time filter
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
        if (customDateRange && customDateRange[0] && customDateRange[1]) {
          firstDay = customDateRange[0].startOf('day');
          lastDay = customDateRange[1].endOf('day');
        } else {
          return;
        }
        break;
      default:
        firstDay = now.startOf('month');
        lastDay = now.endOf('month');
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

  // Fetch attendance data
  useEffect(() => {
    if (!dateRange.firstDay || !dateRange.lastDay) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const centerId = user.role === 'admin' ? selectedCenter : user.center_id;
        
        const filters = {
          filters: {
            query: {
              center_id: centerId
            },
            recordQuery: {
              date: {
                $gte: dateRange.firstDay,
                $lte: dateRange.lastDay
              }
            }
          }
        };

        // Fetch attendance report data
        const response = await post('/attendance/report', filters);
        
        if (response && response.data && response.data.courses) {
          // Map course data for pie chart (using totalSlots as value)
          setCourseData(
            response.data.courses.map(item => ({ 
              name: item.course_name || 'Not Specified', 
              value: item.totalSlots || 0 
            }))
          );
          setSummary(response.data.summary || {
            totalSlots: 0,
            presentCount: 0,
            absentCount: 0,
            notMarkedCount: 0,
          });
        } else {
          setCourseData([]);
          setSummary({
            totalSlots: 0,
            presentCount: 0,
            absentCount: 0,
            notMarkedCount: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setCourseData([]);
        setSummary({
          totalSlots: 0,
          presentCount: 0,
          absentCount: 0,
          notMarkedCount: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, user, selectedCenter]);

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== 'custom') {
      setCustomDateRange(null);
    }
  };

  const handleCustomDateChange = (dates) => {
    setCustomDateRange(dates);
  };

  // Course Wise Chart
  const courseChart = useMemo(() => {
    if (!courseData.length) return null;

    const colors = ['#4C6FFF', '#00C2A8', '#FFB457', '#A66BFF', '#29A9FF', '#FF8DC7', '#6EDC82'];
    
    return {
      series: courseData.map(item => item.value),
      options: {
        chart: { type: 'pie', height: 100 },
        labels: courseData.map(item => item.name),
        legend: { position: 'bottom' },
        colors: colors.slice(0, courseData.length),
        dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
        tooltip: {
          y: {
            formatter: (val) => `${val} sessions`
          }
        }
      }
    };
  }, [courseData]);

  return (
    <Card
      className='border border-border w-full'
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Attendance Report</span>
        </div>
      }
      extra={
        <div className="flex items-center gap-2">
          <Select
            value={timeFilter}
            onChange={handleTimeFilterChange}
            style={{ width: 120 }}
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Yearly', value: 'yearly' },
              { label: 'Custom', value: 'custom' }
            ]}
          />
          {timeFilter === 'custom' && (
            <RangePicker
              value={customDateRange}
              onChange={handleCustomDateChange}
              format="YYYY-MM-DD"
            />
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : !courseData.length ? (
        <Empty description="No attendance data available for the selected period" />
      ) : (
        <Row gutter={[20, 20]}>
          <Col xs={24} md={24}>
            <Card className="border border-border">
              <Row gutter={[12, 12]}>
                <Col xs={12} md={6}>
                  <div className="text-xs text-gray-500">Total Sessions</div>
                  <div className="text-lg font-semibold">{summary.totalSlots}</div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="text-xs text-gray-500">Present</div>
                  <div className="text-lg font-semibold">{summary.presentCount}</div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="text-xs text-gray-500">Absent</div>
                  <div className="text-lg font-semibold">{summary.absentCount}</div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="text-xs text-gray-500">Not Marked</div>
                  <div className="text-lg font-semibold">{summary.notMarkedCount}</div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} md={24}>
            <Card title="Course Wise Attendance" className="border border-border">
              {courseChart ? (
                <EChart
                  series={courseChart.series}
                  options={courseChart.options}
                  className="w-full"
                  height={260}
                />
              ) : (
                <Empty description="No course data" />
              )}
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default AttendanceReport;

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Select, DatePicker, Row, Col, Spin, Empty } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import EChart from '@pages/Dashboard/Chart/EChart';
import billService from '@services/Bills';
import userStore from '@stores/UserStore';
import centerStore from '@stores/CentersStore';
import { useStore } from 'zustand';
import dayjs from 'dayjs';
import { getMonthRange } from '@utils/helper';
import { post } from '@utils/Requests';

const { RangePicker } = DatePicker;

const TIME_FILTERS = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
  custom: 'custom'
};

function IncomeReport({ dateRange: dashboardDateRange, onDateRangeChange }) {
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [dateRange, setDateRange] = useState(getMonthRange(new Date()));
  const [loading, setLoading] = useState(false);
  const [paymentModeData, setPaymentModeData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const isSyncingFromParent = useRef(false);
  const isSyncingFromSelf = useRef(false);

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

  // Fetch bills data
  useEffect(() => {
    if (!dateRange.firstDay || !dateRange.lastDay) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const centerId = user.role === 'admin' ? selectedCenter : user.center_id;
        
        const filters = {
          filters: {
            query: {
              center_id: centerId,
              generated_on: {
                $gte: dateRange.firstDay,
                $lte: dateRange.lastDay
              }
            }
          }
        };

        // Fetch income report data
        const response = await post('/bills/income-report', filters);
        
        if (response && response.data) {
          const { paymentMode, subject } = response.data;
          
          setPaymentModeData(
            paymentMode.map(item => ({ name: item.payment_method, value: item.total }))
          );
          setSubjectData(
            subject.map(item => ({ name: item.subject, value: item.total }))
          );
        } else {
          setPaymentModeData([]);
          setSubjectData([]);
        }
      } catch (error) {
        console.error('Error fetching income data:', error);
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

  // Payment Mode Pie Chart
  const paymentModeChart = useMemo(() => {
    if (!paymentModeData.length) return null;

    const colors = ['#4C6FFF', '#00C2A8', '#FFB457', '#A66BFF', '#29A9FF', '#FF8DC7', '#6EDC82'];
    
    return {
      series: paymentModeData.map(item => item.value),
      options: {
        chart: { type: 'pie', height: 260 },
        labels: paymentModeData.map(item => item.name),
        legend: { position: 'bottom' },
        colors: colors.slice(0, paymentModeData.length),
        dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
        tooltip: {
          y: {
            formatter: (val) => `₹${val.toLocaleString('en-IN')}`
          }
        }
      }
    };
  }, [paymentModeData]);

  // Subject Wise Pie Chart
  const subjectChart = useMemo(() => {
    if (!subjectData.length) return null;

    const colors = ['#4C6FFF', '#00C2A8', '#FFB457', '#A66BFF', '#29A9FF', '#FF8DC7', '#6EDC82'];
    
    return {
      series: subjectData.map(item => item.value),
      options: {
        chart: { type: 'pie', height: 260 },
        labels: subjectData.map(item => item.name),
        legend: { position: 'bottom' },
        colors: colors.slice(0, subjectData.length),
        dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
        tooltip: {
          y: {
            formatter: (val) => `₹${val.toLocaleString('en-IN')}`
          }
        }
      }
    };
  }, [subjectData]);

  return (
    <Card
      className='border border-border w-full'
      title={
        <div className="flex items-center gap-2">
          <DollarOutlined />
          <span>Income Report</span>
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
      ) : (!paymentModeData.length && !subjectData.length) ? (
        <Empty description="No income data available for the selected period" />
      ) : (
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card title="Payment Mode" className="border border-border">
              {paymentModeChart ? (
                <EChart
                  series={paymentModeChart.series}
                  options={paymentModeChart.options}
                  className="w-full"
                  height={260}
                />
              ) : (
                <Empty description="No payment mode data" />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Subject Wise" className="border border-border">
              {subjectChart ? (
                <EChart
                  series={subjectChart.series}
                  options={subjectChart.options}
                  className="w-full"
                  height={260}
                />
              ) : (
                <Empty description="No subject data" />
              )}
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  );
}

export default IncomeReport;

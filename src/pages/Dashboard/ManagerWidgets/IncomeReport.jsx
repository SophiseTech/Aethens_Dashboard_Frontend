import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Spin, Empty } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import EChart from '@pages/Dashboard/Chart/EChart';
import userStore from '@stores/UserStore';
import centerStore from '@stores/CentersStore';
import { useStore } from 'zustand';
import { post } from '@utils/Requests';

// Driven entirely by the dashboard's date range — no widget-level date filter.
function IncomeReport({ dateRange }) {
  const [loading, setLoading] = useState(false);
  const [paymentModeData, setPaymentModeData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);

  const { user } = useStore(userStore);
  const { selectedCenter } = useStore(centerStore);

  useEffect(() => {
    if (!dateRange?.firstDay || !dateRange?.lastDay) return;
    // Ignore a response that arrives after the date/center has changed again
    let ignore = false;

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

        const response = await post('/bills/income-report', filters);
        if (ignore) return;

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
        if (!ignore) console.error('Error fetching income data:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => { ignore = true; };
  }, [dateRange?.firstDay, dateRange?.lastDay, user?.role, user?.center_id, selectedCenter]);

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

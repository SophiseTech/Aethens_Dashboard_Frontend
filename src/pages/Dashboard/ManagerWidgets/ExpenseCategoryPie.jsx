import { Card, Empty } from 'antd';
import EChart from '@pages/Dashboard/Chart/EChart';
import expenseService from '@/services/ExpenseService';
import { useEffect, useState } from 'react';
import userStore from '@stores/UserStore';
import centersStore from '@stores/CentersStore';

const CATEGORY_COLORS = {
  rent: '#C0392B',
  salary: '#2980B9',
  food: '#D35400',
  maintenance: '#27AE60',
  utilities: '#8E44AD',
  travel: '#16A085',
  marketing: '#E67E22',
  other: '#7F8C8D',
};

const CATEGORY_LABELS = {
  rent: 'Rent',
  salary: 'Salary',
  food: 'Food',
  maintenance: 'Maintenance',
  utilities: 'Utilities',
  travel: 'Travel',
  marketing: 'Marketing',
  other: 'Other',
};

function ExpenseCategoryPie({ dateRange }) {
  const { user } = userStore();
  const { selectedCenter } = centersStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const filters = {};
      if (dateRange?.firstDay) filters.from_date = dateRange.firstDay;
      if (dateRange?.lastDay) filters.to_date = dateRange.lastDay;

      const result = await expenseService.getExpenseSummary(filters);
      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <Card className='border border-border w-full' title="Expense by Category" loading={loading}>
      </Card>
    );
  }

  if (!data?.summary?.length) {
    return (
      <Card className='border border-border w-full' title="Expense by Category">
        <Empty description="No expense data" />
      </Card>
    );
  }

  const series = data.summary.map(item => item.total);
  const labels = data.summary.map(item => CATEGORY_LABELS[item._id] || item._id);
  const colors = data.summary.map(item => CATEGORY_COLORS[item._id] || '#CCCCCC');

  const options = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
    },
    labels,
    colors,
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + '%';
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
            },
            value: {
              show: true,
              fontSize: '16px',
              formatter: function (val) {
                return '₹' + parseInt(val).toLocaleString();
              },
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return '₹' + parseInt(total).toLocaleString();
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '₹' + parseInt(val).toLocaleString();
        },
      },
    },
  };

  return (
    <Card className='border border-border w-full' title="Expense by Category">
      <EChart
        series={series}
        options={options}
        type="donut"
        height={300}
      />
    </Card>
  );
}

export default ExpenseCategoryPie;

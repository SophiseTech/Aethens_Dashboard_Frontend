import { Card, Empty } from 'antd';
import EChart from '@pages/Dashboard/Chart/EChart';
import expenseService from '@/services/ExpenseService';
import { useEffect, useState } from 'react';

const LEDGER_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

function ExpenseLedgerPie({ dateRange }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const filters = {};
      if (dateRange?.firstDay) filters.from_date = dateRange.firstDay;
      if (dateRange?.lastDay) filters.to_date = dateRange.lastDay;

      const result = await expenseService.getExpenseByLedger(filters);
      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <Card className='border border-border w-full' title="Top Ledgers by Expense" loading={loading}>
      </Card>
    );
  }

  if (!data?.summary?.length) {
    return (
      <Card className='border border-border w-full' title="Top Ledgers by Expense">
        <Empty description="No expense data" />
      </Card>
    );
  }

  const labels = data.summary.map(item => item.ledgerName || 'Unknown');
  const series = [{
    name: 'Total Expense',
    data: data.summary.map(item => item.total),
    colors: LEDGER_COLORS.slice(0, data.summary.length),
  }];

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '60%',
        distributed: true,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 30,
      formatter: function (val, opt) {
        return '₹' + parseInt(val).toLocaleString();
      },
      style: {
        fontSize: '12px',
        colors: ['#333'],
      },
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: labels,
      labels: {
        show: true,
        style: {
          colors: '#333',
          fontSize: '11px',
        },
        formatter: function (val) {
          return '₹' + parseInt(val).toLocaleString();
        },
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '₹' + parseInt(val).toLocaleString();
        },
      },
    },
    colors: LEDGER_COLORS.slice(0, data.summary.length),
  };

  return (
    <Card className='border border-border w-full' title="Top Ledgers by Expense">
      <EChart
        series={series}
        options={options}
        type="bar"
        height={300}
      />
    </Card>
  );
}

export default ExpenseLedgerPie;

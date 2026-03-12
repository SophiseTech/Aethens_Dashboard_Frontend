import { Card, Empty } from 'antd';
import EChart from '@pages/Dashboard/Chart/EChart';
import expenseService from '@/services/ExpenseService';
import { useEffect, useState } from 'react';

const LEDGER_COLORS = [
  '#C0392B',
  '#2980B9',
  '#D35400',
  '#27AE60',
  '#8E44AD',
  '#16A085',
  '#E67E22',
  '#2C3E50',
  '#C0392B',
  '#27AE60',
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
      animations: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '70%',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 60,
      formatter: function (val) {
        return '₹' + parseInt(val).toLocaleString();
      },
      style: {
        fontSize: '11px',
        colors: ['#333'],
      },
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '11px',
      markers: {
        radius: 3,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    xaxis: {
      categories: labels,
      labels: {
        show: true,
        style: {
          colors: '#333',
          fontSize: '10px',
        },
        formatter: function (val) {
          if (val >= 100000) return '₹' + (val / 100000).toFixed(1) + 'L';
          if (val >= 1000) return '₹' + (val / 1000).toFixed(0) + 'K';
          return '₹' + val;
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
    stroke: {
      show: true,
      width: 1,
      colors: ['#fff'],
    },
  };

  return (
    <Card className='border border-border w-full' title="Top Ledgers by Expense">
      <EChart
        series={series}
        options={options}
        type="bar"
        height={350}
      />
    </Card>
  );
}

export default ExpenseLedgerPie;

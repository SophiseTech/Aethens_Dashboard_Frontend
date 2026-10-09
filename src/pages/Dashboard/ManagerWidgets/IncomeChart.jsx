import EChart from '@pages/Dashboard/Chart/EChart';
import { Card } from 'antd';
import { useMemo } from 'react'
import { useStore } from 'zustand';
import billStore from '@stores/BillStore';
import dayjs from 'dayjs';

function IncomeChart() {
  const { summary: incomeSummary } = useStore(billStore)

  // groupedResult is already one row per day, sorted by date (BillService.getSummary)
  const { dates, billedData, paidData } = useMemo(() => {
    const rows = incomeSummary?.groupedResult || [];
    return {
      dates: rows.map(row => new Date(row._id).setHours(0, 0, 0, 0)),
      billedData: rows.map(row => row.totalIncome ?? null),
      paidData: rows.map(row => row.totalPaid ?? null),
    };
  }, [incomeSummary]);

  const options = useMemo(() => ({
    chart: {
      type: "line",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'datetime',
      categories: dates,
      labels: {
        show: true,
        align: "right",
        minWidth: 0,
        maxWidth: 160,
        style: {
          colors: "black",
          fontSize: 'clamp(10px, 1.5vw, 12px)',
        },
        formatter: function (value) {
          return dayjs(value).format('DD MMM, YYYY');
        }
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      labels: {
        show: true,
        align: "left",
        minWidth: 0,
        maxWidth: 200,
        style: {
          colors: "black",
          fontSize: 'clamp(10px, 1.5vw, 12px)',
        },
        formatter: function (value) {
          return value?.toFixed(2);
        }
      },
    },
    stroke: {
      show: true,
      width: 2,
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: true,
      borderColor: "#ccc",
      strokeDashArray: 2,
    },
  }), [dates]);

  const series = useMemo(() => [
    {
      name: 'Total Billed',
      type: 'line',
      data: billedData,
      color: "#59a14f"
    },
    {
      name: 'Total Paid',
      type: 'line',
      data: paidData,
      color: "#f28e2b"
    },
  ], [billedData, paidData]);

  return (
    <Card className='border border-border w-full' title="Billed vs Paid">
      <EChart
        series={series}
        options={options}
        className='rounded-xl p-5'
      />
    </Card>
  )
}

export default IncomeChart

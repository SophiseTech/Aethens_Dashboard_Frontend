import EChart from '@pages/Dashboard/Chart/EChart';
import { Card } from 'antd';
import React, { useMemo } from 'react'
import { Row, Col, Typography } from "antd";
import { useStore } from 'zustand';
import billStore from '@stores/BillStore';
import payslipStore from '@stores/PayslipStore';
import dayjs from 'dayjs';
const { Title, Paragraph } = Typography;

function IncomeChart() {

  const { summary: incomeSummary } = useStore(billStore)
  const { summary: expenseSummary } = useStore(payslipStore)

  const allDates = useMemo(() => {
    if (incomeSummary && expenseSummary) {
      return [
        ...new Set([
          ...(incomeSummary?.groupedResult?.map(item => new Date(item._id).setHours(0, 0, 0, 0)) || []),
          ...(expenseSummary?.groupedResult?.map(item => new Date(item._id).setHours(0, 0, 0, 0)) || []),
        ]),
      ]
    }
    return []
  }, [incomeSummary, expenseSummary])

  // Memoize the income and expense data
  const incomeData = useMemo(() => allDates.map(date => {
    const incomeItem = incomeSummary?.groupedResult?.find(i => new Date(i._id).setHours(0, 0, 0, 0) === date);
    return incomeItem ? incomeItem.totalIncome : null; // Return null if date not found
  }), [allDates, incomeSummary]); // Recompute when allDates or income changes

  // Memoize paid data for Loss Report
  const paidData = useMemo(() => allDates.map(date => {
    const paidItem = incomeSummary?.groupedResult?.find(i => new Date(i._id).setHours(0, 0, 0, 0) === date);
    return paidItem ? paidItem.totalPaid : null;
  }), [allDates, incomeSummary]);

  const expenseData = useMemo(() => allDates.map(date => {
    const expenseItem = expenseSummary?.groupedResult?.find(e => new Date(e._id).setHours(0, 0, 0, 0) === date);
    return expenseItem ? expenseItem.totalExpense : null; // Return null if date not found
  }), [allDates, expenseSummary]); // Recompute when allDates or expense changes

  const options = {
    chart: {
      type: "line",
      width: "100%",
      height: "auto",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'datetime',
      categories: allDates,
      labels: {
        show: true,
        align: "right",
        minWidth: 0,
        maxWidth: 160,
        style: {
          colors: "black",
        },
        formatter: function (value) {
          // Format the label as a date (e.g., 'dd MMM yyyy')
          return dayjs(value).format('DD MMM, YYYY'); // You can adjust the locale as needed
        }
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      seriesName: 'Income',
      labels: {
        show: true,
        align: "left",
        minWidth: 0,
        maxWidth: 200,
        style: {
          colors: "black",
        },
        formatter: function (value) {
          return value?.toFixed(2);
        }
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "10%",
        borderRadius: 10,
        borderRadiusApplication: 'around'
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: true,
      borderColor: "#ccc",
      strokeDashArray: 2,
      padding: {
        right: 90
      }
    },
  }

  const series = [
    {
      name: 'Total Billed',
      type: 'line',
      data: incomeData,
      color: "#59a14f"
    },
    {
      name: 'Total Paid',
      type: 'line',
      data: paidData,
      color: "#f28e2b"
    },
    {
      name: 'Total Expense',
      type: 'bar',
      data: expenseData,
      color: "#2E2EFF"
    },
  ];

  return (
    <Card className='border border-border w-full' title="Income vs Paid vs Expense">
      <EChart
        series={series}
        options={options}
        className='rounded-xl p-5'
      />
    </Card>
  )
}

export default IncomeChart
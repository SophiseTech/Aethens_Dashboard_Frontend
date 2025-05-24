import EChart from '@pages/Dashboard/Chart/EChart'
import React from 'react'
import dayjs from 'dayjs';

function AttendanceTrend({ stats }) {
  const { monthlyStats } = stats || {};

  const formattedCategories = monthlyStats?.map(stat => `${dayjs().month(stat.month - 1).format("MMM")} ${stat.year}`);

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
      type: 'category',
      categories: formattedCategories,
      labels: {
        show: true,
        align: "right",
        minWidth: 0,
        maxWidth: 160,
        style: {
          colors: "black",
        }
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      seriesName: 'Attendance Count',
      labels: {
        show: true,
        align: "left",
        minWidth: 0,
        maxWidth: 200,
        style: {
          colors: "black",
        },
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
      width: [2, 2],
      dashArray: [0, 5],
      colors: ["#59a14f", "#007bff"],
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
      name: 'Attendance Count',
      type: 'line',
      data: monthlyStats?.map(stat => stat.attended),
      color: "#59a14f"
    },
    {
      name: 'Max Attendance',
      type: 'line',
      data: monthlyStats?.map(stat => stat.attended + stat.non_attended),
      color: "#007bff",
      dashArray: 5
    }
  ];

  return (
    <div className='shadow-card border border-border rounded-xl bg-card'>
      <EChart
        options={options}
        series={series}
      />
    </div>
  )
}

export default AttendanceTrend

import EChart from '@pages/Dashboard/Chart/EChart'
import React from 'react'

function AttendanceTrend({ stats }) {
  const { monthlyStats } = stats || {}

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
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
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
      seriesName: 'Attendeance Count',
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
      name: 'Attendeance Count',
      type: 'line',
      data: monthlyStats?.map(stat => stat.attended),
      color: "#59a14f"
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
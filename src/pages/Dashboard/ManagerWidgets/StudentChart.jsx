import EChart from '@pages/Dashboard/Chart/EChart'
import userStore from '@stores/UserStore'
import { Card } from 'antd'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'
import { useStore } from 'zustand'

function StudentChart() {

  const { summary } = useStore(userStore)

  const allDates = useMemo(() => summary?.students?.map(item => new Date(item._id).setHours(0, 0, 0, 0)) || [], [summary])

  const studentCount = useMemo(() => summary?.students?.map(item => item.count) || [], [summary])

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
      seriesName: 'Students',
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
    plotOptions: {
      bar: {
        columnWidth: "10%",
        borderRadius: 10,
        borderRadiusApplication: 'around'
      },
    },
  }

  return (
    <Card title="Student Count" className='border border-border w-full'>
      <EChart
        series={[
          {
            name: "Students",
            type: "line",
            data: studentCount,
            color: "#e15759"
          }
        ]}
        options={options}
      />
    </Card>
  )
}

export default StudentChart
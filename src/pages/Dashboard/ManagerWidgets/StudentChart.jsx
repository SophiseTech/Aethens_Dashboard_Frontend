import attendanceService from '@/services/Attendance'
import EChart from '@pages/Dashboard/Chart/EChart'
import centersStore from '@stores/CentersStore'
import userStore from '@stores/UserStore'
import { Card } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from 'zustand'

function StudentChart({ dateRange }) {
  const { user } = useStore(userStore)
  const { firstDay, lastDay } = dateRange;
  const [data, setData] = useState([])

  const {selectedCenter} = useStore(centersStore);

  const fetchData = async () => {
    const report  = await attendanceService.getGraphSummary(user.role !== 'admin' ? user.center_id : selectedCenter, firstDay, lastDay) || []
    setData(report)
  }

  useEffect(() => {
    fetchData()
  }, [dateRange, selectedCenter])
  
  // Sort data chronologically and extract required values
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [data])

  const dates = useMemo(() => sortedData.map(item => item.date), [sortedData])
  const presentCounts = useMemo(() => sortedData.map(item => item.presentCount), [sortedData])

  // console.log(dates, presentCounts, sortedData);

  const options = {
    chart: {
      type: "line",
      // width: "100%",
      // height: "auto",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'category',
      categories: dates,
      labels: {
        show: true,
        style: {
          colors: "black",
          fontSize: '12px',
        },
      },
      axisTicks: {
        show: true,
      },
      axisBorder: {
        show: true,
      },
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
      // padding: {
      //   right: 90
      // }
    },
    // plotOptions: {
    //   bar: {
    //     columnWidth: "10%",
    //     borderRadius: 10,
    //     borderRadiusApplication: 'around'
    //   },
    // },
  }

  return (
    <Card title="Monthly Attendance" className='border border-border w-full'>
      <EChart
        series={[
          {
            name: "Present Students",
            type: "line",
            data: presentCounts,
            color: "#4CAF50",
            marker: {
              size: 6
            },
          }
        ]}
        options={options}
        height={320}
      />
    </Card>
  )
}

export default StudentChart
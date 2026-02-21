import DueStat from '@pages/Dashboard/ManagerWidgets/DueStat'
import ExpenseStat from '@pages/Dashboard/ManagerWidgets/ExpenseStat'
import IncomeChart from '@pages/Dashboard/ManagerWidgets/IncomeChart'
import IncomeStat from '@pages/Dashboard/ManagerWidgets/IncomeStat'
import StudentChart from '@pages/Dashboard/ManagerWidgets/StudentChart'
import StudentCounts from '@pages/Dashboard/ManagerWidgets/StudentCounts'
import TodayTasks from '@pages/Dashboard/ManagerWidgets/TodayTasks'
import FeeReport from '@pages/Dashboard/ManagerWidgets/FeeReport'
import IncomeReport from '@pages/Dashboard/ManagerWidgets/IncomeReport'
import AttendanceReport from '@pages/Dashboard/ManagerWidgets/AttendanceReport'
import OverDurationStudents from '@pages/Dashboard/ManagerWidgets/OverDurationStudents'
import FinancialSummary from '@pages/Dashboard/ManagerWidgets/FinancialSummary'
import billStore from '@stores/BillStore'
import payslipStore from '@stores/PayslipStore'
import userStore from '@stores/UserStore'
import { getMonthRange } from '@utils/helper'
import { Col, Flex, Grid, Row, DatePicker } from 'antd'
import _ from 'lodash'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from 'zustand'

function Manager() {
  const [dateRange, setDateRange] = useState(getMonthRange(new Date()));
  const { getSummary, summary, user } = useStore(userStore)
  const { getSummary: getBillsSummary, summary: billSummary } = useStore(billStore)
  const { getSummary: getPayslipSummary, summary: payslipummary } = useStore(payslipStore)

  useEffect(() => {
    const { firstDay, lastDay } = dateRange;
    getSummary({
      query: {
        role: "student",
        center_id: user.center_id,
        createdAt: {
          $gte: firstDay,
          $lte: lastDay
        }
      },
      range: "day"
    })
    getBillsSummary({
      query: {
        center_id: user.center_id,
        generated_on: {
          $gte: firstDay,
          $lte: lastDay
        }
      },
      range: "day"
    })
    getPayslipSummary({
      query: {
        center_id: user.center_id,
        generated_on: {
          $gte: firstDay,
          $lte: lastDay
        }
      },
      range: "day"
    })
  }, [dateRange])

  const handleDateChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      setDateRange({
        firstDay: start.startOf('day').format('YYYY-MM-DD'),
        lastDay: end.endOf('day').format('YYYY-MM-DD')
      });
      console.log(end.endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'))
    } else {
      setDateRange(getMonthRange(new Date()));
    }
  }

  return (
    <Flex vertical gap={20}>
      <DatePicker.RangePicker
        value={[
          dateRange?.firstDay ? dayjs(dateRange.firstDay) : null,
          dateRange?.lastDay ? dayjs(dateRange.lastDay) : null,
        ]}
        onChange={handleDateChange}
        className='w-full tablet:w-2/3 lg:w-1/2 border-primary text-primary'
      />
      {/* <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} tablet={12} lg={12} xxl={6}>
          <StudentCounts />
        </Col>
        <Col xs={24} sm={12} tablet={12} lg={12} xxl={6}>
          <Link to={'/manager/bills'}>
            <IncomeStat />
          </Link>
        </Col>
        <Col xs={24} sm={12} tablet={12} lg={12} xxl={6}>
          <ExpenseStat />
        </Col>
        <Col xs={24} sm={12} tablet={12} lg={12} xxl={6}>
          <Link to={'/manager/bills?status=unpaid'}>
            <DueStat />
          </Link>
        </Col>
      </Row> */}
      <Row gutter={[20, 20]}>
        <Col xs={24}>
          <FinancialSummary />
        </Col>
      </Row>
      <Row gutter={[20, 20]} align={'stretch'}>
        <Col xs={24} tablet={24} lg={8}>
          <TodayTasks />
        </Col>
        <Col xs={24} tablet={24} lg={8}>
          <FeeReport dateRange={dateRange} />
        </Col>
        <Col xs={24} tablet={24} lg={8}>
          <OverDurationStudents />
        </Col>
      </Row>
      <Flex gap={20}>
      </Flex>
      <Row gutter={[20, 20]}>
        <Col xs={24} tablet={24} lg={14}>
          <IncomeReport dateRange={dateRange} onDateRangeChange={setDateRange} />
        </Col>
        <Col xs={24} tablet={24} lg={10}>
          <IncomeChart />
        </Col>
      </Row>
      <AttendanceReport dateRange={dateRange} onDateRangeChange={setDateRange} />
      <Row>
        <Col xs={24} tablet={24} lg={8}>
          <StudentChart dateRange={dateRange} />
        </Col>
      </Row>

    </Flex>
  )
}

export default Manager

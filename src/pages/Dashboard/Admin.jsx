import DueStat from "@pages/Dashboard/ManagerWidgets/DueStat";
import ExpenseStat from "@pages/Dashboard/ManagerWidgets/ExpenseStat";
import IncomeChart from "@pages/Dashboard/ManagerWidgets/IncomeChart";
import IncomeStat from "@pages/Dashboard/ManagerWidgets/IncomeStat";
import StudentChart from "@pages/Dashboard/ManagerWidgets/StudentChart";
import StudentCounts from "@pages/Dashboard/ManagerWidgets/StudentCounts";
import FeeReport from "@pages/Dashboard/ManagerWidgets/FeeReport";
import IncomeReport from "@pages/Dashboard/ManagerWidgets/IncomeReport";
import AttendanceReport from "@pages/Dashboard/ManagerWidgets/AttendanceReport";
import OverDurationStudents from "@pages/Dashboard/ManagerWidgets/OverDurationStudents";
import billStore from "@stores/BillStore";
import payslipStore from "@stores/PayslipStore";
import userStore from "@stores/UserStore";
import centerStore from "@stores/CentersStore";
import { getMonthRange } from "@utils/helper";
import { Col, Flex, Grid, Row, DatePicker, Select, Card } from "antd";
import _ from "lodash";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "zustand";
import AdminCenterSelector from "@components/AdminCenterSelector";

function Admin() {
  const [dateRange, setDateRange] = useState(getMonthRange(new Date()));
  const { getSummary, summary } = useStore(userStore);
  const { getSummary: getBillsSummary, summary: billSummary } = useStore(billStore);
  const { getSummary: getPayslipSummary, summary: payslipummary } = useStore(payslipStore);
  const { selectedCenter } = useStore(centerStore);

  useEffect(() => {
    const { firstDay, lastDay } = dateRange;
    getSummary({
      query: {
        role: "student",
        center_id: selectedCenter,
        createdAt: {
          $gte: firstDay,
          $lte: lastDay,
        },
      },
      range: "day",
    });
    getBillsSummary({
      query: {
        center_id: selectedCenter,
        generated_on: {
          $gte: firstDay,
          $lte: lastDay,
        },
      },
      range: "day",
    });
    getPayslipSummary({
      query: {
        center_id: selectedCenter,
        generated_on: {
          $gte: firstDay,
          $lte: lastDay,
        },
      },
      range: "day",
    });
  }, [dateRange, selectedCenter]);

  const handleDateChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      setDateRange({
        firstDay: start.startOf("day").format("YYYY-MM-DD"),
        lastDay: end.endOf("day").format("YYYY-MM-DD"),
      });
    } else {
      setDateRange(getMonthRange(new Date()));
    }
  };



  return (
    <Flex vertical gap={20}>
      <DatePicker.RangePicker
        value={[
          dateRange?.firstDay ? dayjs(dateRange.firstDay) : null,
          dateRange?.lastDay ? dayjs(dateRange.lastDay) : null,
        ]}
        onChange={handleDateChange}
        className="w-1/2 border-primary text-primary"
      />
      <Row gutter={[20, 20]}>
        <Col xxl={{ span: 6 }} span={12}>
          <StudentCounts />
        </Col>
        <Col xxl={{ span: 6 }} span={12}>
          <Link to={"/manager/bills"}>
            <IncomeStat />
          </Link>
        </Col>
        <Col xxl={{ span: 6 }} span={12}>
          <ExpenseStat />
        </Col>
        <Col xxl={{ span: 6 }} span={12}>
          <Link to={"/manager/bills?status=unpaid"}>
            <DueStat />
          </Link>
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col span={14}>
          <IncomeReport dateRange={dateRange} onDateRangeChange={setDateRange} />
        </Col>
        <Col span={10}>
          <IncomeChart />
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col span={8}>
          <OverDurationStudents />
        </Col>
        <Col span={8}>
          <FeeReport dateRange={dateRange} />
        </Col>
        <Col span={8}>
          <StudentChart dateRange={dateRange} />
        </Col>
      </Row>
      <AttendanceReport dateRange={dateRange} onDateRangeChange={setDateRange} />
    </Flex>
  );
}

export default Admin;

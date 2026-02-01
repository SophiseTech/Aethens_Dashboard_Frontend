import DueStat from "@pages/Dashboard/ManagerWidgets/DueStat";
import ExpenseStat from "@pages/Dashboard/ManagerWidgets/ExpenseStat";
import IncomeChart from "@pages/Dashboard/ManagerWidgets/IncomeChart";
import IncomeStat from "@pages/Dashboard/ManagerWidgets/IncomeStat";
import StudentChart from "@pages/Dashboard/ManagerWidgets/StudentChart";
import StudentCounts from "@pages/Dashboard/ManagerWidgets/StudentCounts";
import FeeReport from "@pages/Dashboard/ManagerWidgets/FeeReport";
import billStore from "@stores/BillStore";
import payslipStore from "@stores/PayslipStore";
import userStore from "@stores/UserStore";
import centerStore from "@stores/CentersStore";
import { getMonthRange } from "@utils/helper";
import { Col, Flex, Grid, Row, DatePicker, Select } from "antd";
import _ from "lodash";
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
        firstDay: start.startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        lastDay: end.endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      });
    } else {
      setDateRange(getMonthRange(new Date()));
    }
  };



  return (
    <Flex vertical gap={20}>
      <DatePicker.RangePicker
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
      <Flex gap={20}>
        <IncomeChart />
        <StudentChart dateRange={dateRange} />
      </Flex>
      <FeeReport dateRange={dateRange} />
    </Flex>
  );
}

export default Admin;

import IncomeChart from "@pages/Dashboard/ManagerWidgets/IncomeChart";
import StudentChart from "@pages/Dashboard/ManagerWidgets/StudentChart";
import IncomeReport from "@pages/Dashboard/ManagerWidgets/IncomeReport";
import AttendanceReport from "@pages/Dashboard/ManagerWidgets/AttendanceReport";
import FinancialSummary from "@pages/Dashboard/ManagerWidgets/FinancialSummary";
import FeeKpis from "@pages/Dashboard/ManagerWidgets/FeeKpis";
import billStore from "@stores/BillStore";
import userStore from "@stores/UserStore";
import centerStore from "@stores/CentersStore";
import { getMonthRange, toISTDateString } from "@utils/helper";
import { Col, Flex, Row, DatePicker } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useStore } from "zustand";

function Admin() {
  const [dateRange, setDateRange] = useState(getMonthRange(new Date()));
  const { getSummary } = useStore(userStore);
  const { getSummary: getBillsSummary } = useStore(billStore);
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
  }, [dateRange, selectedCenter]);

  const handleDateChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      setDateRange({
        firstDay: toISTDateString(start),
        lastDay: toISTDateString(end),
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
        className="w-full tablet:w-2/3 lg:w-1/2 border-primary text-primary"
      />
      <Row gutter={[20, 20]}>
        <Col xs={24}>
          <FinancialSummary />
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col xs={24}>
          <FeeKpis />
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col xs={24} tablet={24} lg={14}>
          <IncomeReport dateRange={dateRange} />
        </Col>
        <Col xs={24} tablet={24} lg={10}>
          <IncomeChart />
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col xs={24}>
          <StudentChart dateRange={dateRange} />
        </Col>
      </Row>
      <AttendanceReport dateRange={dateRange} />
    </Flex>
  );
}

export default Admin;

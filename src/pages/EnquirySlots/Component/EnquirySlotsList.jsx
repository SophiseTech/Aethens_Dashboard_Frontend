import { useEffect, useState } from "react";
import { Segmented, Table } from "antd";
import EnquiryDetailsDrawer from "@pages/Enquiries/Component/EnquiryDetailsDrawer";
import enquiryStore from "@stores/EnquiryStore";
import Chip from "@components/Chips/Chip";

function EnquirySlotsList() {
  const {
    demoSlots,          // You must add this to store -> stores response
    loading,
    getDemoSlots,       // new store function -> call API to fetch slots
  } = enquiryStore();

  const [selectedView, setSelectedView] = useState("Scheduled");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const { slots, today } = demoSlots || {}

  useEffect(() => {
    getDemoSlots({ selectedView });     // fetch once when component loads
  }, [selectedView]);

  const handleRowClick = (record) => {
    setSelectedEnquiry(record);
    setDrawerVisible(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "booked":
        return <Chip glow label="Scheduled" size="xs" type="success" />
    }

  }

  const columns = [
    {
      title: "Name",
      dataIndex: ["demoAttendee", "name"],
      key: "name",
      render: (value, record) => (
        <p
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => handleRowClick(record)}
        >
          {value}
        </p>
      ),
    },
    {
      title: "Courses",
      dataIndex: ["enquiry_id", "selectedCourses"],
      render: (courses) => courses?.map(c => c.course_name).join(", "),
    },
    {
      title: "Demo Date",
      dataIndex: ["start_date"],
      render: (date) => (date ? new Date(date).toLocaleString() : "N/A"),
    },
    {
      title: "Status",
      dataIndex: ["status"],
      render: (val) => getStatusTag(val) 
    },
  ];

  return (
    <>
      <Segmented
        options={["All", "Scheduled", "Completed", "Cancelled", "Rescheduled"]}
        className="w-fit mb-3"
        value={selectedView}
        onChange={setSelectedView}
      />

      <Table
        columns={columns}
        dataSource={slots || []}
        loading={loading}
        rowKey="_id"
      />

      <EnquiryDetailsDrawer
        enquiry={selectedEnquiry}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        parentPage="slotlist"
      />
    </>
  );
}

export default EnquirySlotsList;

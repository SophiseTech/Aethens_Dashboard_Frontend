import { useEffect, useMemo, useState } from "react";
import { Segmented, Table } from "antd";
import EnquiryDetailsDrawer from "@pages/Enquiries/Component/EnquiryDetailsDrawer";
import enquiryStore from "@stores/EnquiryStore";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";

function EnquirySlotsList() {
  const {
    demoSlots,          // You must add this to store -> stores response
    loading,
    getDemoSlots,       // new store function -> call API to fetch slots
  } = enquiryStore();

  const [selectedView, setSelectedView] = useState("Scheduled");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const {user} = userStore();
  const {selectedCenter} = centersStore();

  useEffect(() => {
    if(user.role === 'admin' && selectedCenter){
      getDemoSlots(selectedCenter);
    }else{
      getDemoSlots();     // fetch once when component loads
    }
  }, []);

  const handleRowClick = (record) => {
    setSelectedEnquiry(record);
    setDrawerVisible(true);
  };

  // Convert backend response to table-ready array
  const formattedList = useMemo(() => {
    if (!demoSlots) return [];

    const all = [
    ...(demoSlots.upcoming?.items || []),
    ...(demoSlots.completed?.items || []),
    ...(demoSlots.cancelled?.items || []),
    ...(demoSlots.rescheduled?.items || []),
  ];

  if (selectedView === "All") return all;

    switch (selectedView) {
      case "Scheduled":
        return demoSlots.upcoming?.items || [];
      case "Completed":
        return demoSlots.completed?.items || [];
      case "Cancelled":
        return demoSlots.cancelled?.items || [];
      case "Rescheduled":
        return demoSlots.rescheduled?.items || [];
      default:
        return [];
    }
  }, [demoSlots, selectedView]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
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
      title: "Phone",
      dataIndex: "phoneNumber",
    },
    {
      title: "Courses",
      dataIndex: "selectedCourses",
      render: (courses) => courses?.map(c => c.course_name).join(", "),
    },
    {
      title: "Demo Date",
      dataIndex: ["demoSlot", "scheduledAt"],
      render: (date) => (date ? new Date(date).toLocaleString() : "N/A"),
    },
    {
      title: "Status",
      dataIndex: ["demoSlot", "status"],
    },
  ];

  return (
    <>
      <Segmented
        options={["All","Scheduled", "Completed", "Cancelled", "Rescheduled"]}
        className="w-fit mb-3"
        value={selectedView}
        onChange={setSelectedView}
      />

      <Table
        columns={columns}
        dataSource={formattedList}
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

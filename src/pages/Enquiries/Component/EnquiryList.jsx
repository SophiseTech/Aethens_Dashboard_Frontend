import { useEffect, useMemo, useState, useCallback } from "react";
import { Segmented, Table } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import enquiryStore from "@stores/EnquiryStore";
import EnquiryDetailsDrawer from "@pages/Enquiries/Component/EnquiryDetailsDrawer";
import ViewWiseFilters from './ViewWiseFilters'

function EnquiryList() {
  const {
    enquiries,
    loading,
    getEnquiries,
    total,
    searchResults,
    searchQuery,
    searchTotal,
    search,
  } = enquiryStore();

  const nav = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // default view / page from URL params
  const currentPage = parseInt(queryParams.get("page")) || 1;
  const selectedView = queryParams.get("view") || 'All';

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  // const [selectedView, setSelectedView] = useState("All");

  const fetchEnquiries = useCallback(() => {
    if (searchQuery) {
      search(10, { searchQuery }, currentPage);
    } else {
      getEnquiries(10, currentPage, {stage: selectedView});
    }
  }, [searchQuery, getEnquiries, search, currentPage, selectedView]);

  useEffect(() => {
    fetchEnquiries();
    // fetchEnquiries depends on searchQuery/currentPage/selectedView
    // include fetchEnquiries to satisfy exhaustive-deps
  }, [selectedView, currentPage, searchQuery, fetchEnquiries]);

  const updateURL = (page, view) => {
    nav(`?page=${page}&view=${view}`, { replace: true });
  };

  const handlePageChange = (page, pageSize) => {
    updateURL(page, selectedView);
    loadMore(page, pageSize);
  };

  const loadMore = (page, pageSize) => {
    if (searchQuery) {
      search(pageSize, { searchQuery }, page);
    } else {
      getEnquiries(pageSize, page);
    }
  };

  const handleRowClick = (record) => {
    setSelectedEnquiry(record);
    setDrawerVisible(true);
  };

  // const enquiriesToDisplay = useMemo(() => {
  //   const base = searchQuery ? searchResults : enquiries;
  //   if (selectedView === "All") return base;
  //   return base.filter(
  //     (item) => item.stage?.toLowerCase() === selectedView.toLowerCase()
  //   );
  // }, [enquiries, searchResults, searchQuery, selectedView]);

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
      title: "Course Interested",
      dataIndex: "selectedCourses",
      render: (courses) => courses?.map(c => c.course_name).join(", ")
    },
    {
      title: "Status",
      dataIndex: "stage",
    },
  ];

  return (
    <>
      <Segmented
        options={["All", "New", "Demo", "Enrolled", "Closed"]}
        className="w-fit"
        value={selectedView}
        onChange={(view) => {updateURL(currentPage, view)}}
      />

      <ViewWiseFilters
        selectedView={selectedView}
        onApply={(filters) => {
          // reset to page 1 and call search with filters
          updateURL(1, selectedView)
          getEnquiries(10, 1, filters)
        }}
        onClear={() => {
          updateURL(1, selectedView)
          getEnquiries(10, 1)
        }}
      />

      <Table
        columns={columns}
        dataSource={enquiries}
        loading={loading}
        pagination={{
          current: currentPage,
          onChange: handlePageChange,
          total: searchQuery ? searchTotal : total,
          pageSize: 10,
        }}
        rowKey="_id"
      />

      <EnquiryDetailsDrawer
        enquiry={selectedEnquiry}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        parentPage="enquiryList"
      />
    </>
  );
}

export default EnquiryList;

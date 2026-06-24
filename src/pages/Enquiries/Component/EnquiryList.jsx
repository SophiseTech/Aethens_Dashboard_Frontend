import { useEffect, useState, useCallback } from "react";
import { Segmented, Table, Tooltip, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import enquiryStore from "@stores/EnquiryStore";
import EnquiryDetailsDrawer from "@pages/Enquiries/Component/EnquiryDetailsDrawer";
import ViewWiseFilters from './ViewWiseFilters'
import { formatDate } from "@utils/helper";
import Chip from "@components/Chips/Chip";
import EnquiryDashboard from "@pages/Enquiries/Component/EnquiryDashboard";
import userStore from "@stores/UserStore";
import centersStore from "@stores/CentersStore";
import enquiryService from "@services/Enquiry";
import dayjs from "dayjs";
import { capitalize } from "lodash";

function EnquiryList() {
  const {
    enquiries,
    loading,
    getEnquiries,
    total,
    searchQuery,
    searchTotal,
    search,
    refresh,
    setRefresh
  } = enquiryStore();
  const { user } = userStore();
  const { selectedCenter } = centersStore();

  const nav = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // default view / page from URL params
  const currentPage = parseInt(queryParams.get("page")) || 1;
  const selectedView = queryParams.get("view") || 'All';
  const enquiryIdFromUrl = queryParams.get("enquiryId");

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  // const [selectedView, setSelectedView] = useState("All");
  const [activeFilters, setActiveFilters] = useState({});

  const fetchEnquiries = useCallback(() => {
    if (searchQuery) {
      search(10, { searchQuery }, currentPage);
    } else {
      getEnquiries(10, currentPage, { ...activeFilters, stage: selectedView, centerId: selectedCenter });
    }
  }, [searchQuery, getEnquiries, search, currentPage, selectedView, selectedCenter, activeFilters]);

  useEffect(() => {
    fetchEnquiries();
    // fetchEnquiries depends on searchQuery/currentPage/selectedView
    // include fetchEnquiries to satisfy exhaustive-deps
  }, [selectedView, currentPage, searchQuery, fetchEnquiries, selectedCenter, refresh]);

  useEffect(() => {
    if (refresh) {
      fetchEnquiries()
      setRefresh(false)
    }
  }, [refresh])


  // Handle enquiryId from URL to auto-open drawer
  useEffect(() => {
    const openEnquiryFromUrl = async () => {
      if (enquiryIdFromUrl) {
        try {
          const enquiry = await enquiryService.getEnquiryDetails(enquiryIdFromUrl);
          if (enquiry) {
            setSelectedEnquiry(enquiry);
            setDrawerVisible(true);
            // Clear the enquiryId from URL after opening
            const newParams = new URLSearchParams(location.search);
            newParams.delete("enquiryId");
            nav(`?${newParams.toString()}`, { replace: true });
          }
        } catch (error) {
          console.error("Error fetching enquiry:", error);
          message.error("Failed to load enquiry details");
        }
      }
    };
    openEnquiryFromUrl();
  }, [enquiryIdFromUrl]);

  const updateURL = (page, view) => {
    nav(`?page=${page}&view=${view}`, { replace: true });
  };

  const handlePageChange = (page) => {
    updateURL(page, selectedView);
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
      title: "#",
      dataIndex: 'enquiryNumber',
      key: 'enquiryNumber',
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (value, record) => (
        <div className="flex gap-2 items-center">
          <p
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => handleRowClick(record)}
          >
            {value}
          </p>
          {record?.isTransferred && (<Chip key={value} label="Transferred" size="xs" type="draft" glow={false} />)}
        </div>
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
      title: "Age Category",
      dataIndex: "ageCategory",
      render: (value) => capitalize(value?.replaceAll('_', " "))
    },
    {
      title: selectedView === "Demo" ? "Demo Date" : "Created At",
      dataIndex: "createdAt",
      render: (_, row) => {
        const finalDate =
          (row?.stage === "Demo" && selectedView === "Demo")
            ? row?.demoSlot?.scheduledAt
            : row?.createdAt;

        return formatDate(finalDate);
      },
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      render: (value) => formatDate(value)
    },
    {
      title: "Status",
      dataIndex: "stage",
      render: (_, row) => {
        return row?.stage === "Demo"
          ? <>
            <Tooltip title={`${row?.followUpRemarks || row?.remarks || "No Remarks"}`}>
              <p>{row?.demoSlot?.status || "Not Scheduled"}</p>
              <p>{getFollowUpStatus(row)}</p>
            </Tooltip>
          </>
          : <>
            <Tooltip title={`${row?.followUpRemarks || row?.remarks || "No Remarks"}`}>
              <p className="">{row?.stage}</p>
              <p className="">{getFollowUpStatus(row)}</p>
            </Tooltip>
          </>;
      },
    }
  ];

  const getFollowUpStatus = (enquiry) => {
    if (!enquiry) return
    if (["Enrolled", "Closed"].includes(enquiry.stage)) return ""
    if (!enquiry.followUpDate) {
      return ""
    }
    if (enquiry.followUpDate && dayjs(enquiry.followUpDate).isAfter(dayjs())) {
      return <span className="text-green-500">| Followed-Up</span>
    }
    return <span className="text-red-500">| Follow-Up Overdue</span>
  }

  return (
    <>
      <Segmented
        options={["Dashboard", "All", "New", "Demo", "Enrolled", "Closed"]}
        className="w-fit"
        value={selectedView}
        onChange={(view) => {
          setActiveFilters({});
          updateURL(1, view);
        }}
      />

      {selectedView === 'Dashboard' ?
        <EnquiryDashboard />
        :
        <div>
          <ViewWiseFilters
            selectedView={selectedView}
            onApply={(filters) => {
              setActiveFilters(filters);
              updateURL(1, selectedView);
            }}
            onClear={() => {
              setActiveFilters({});
              updateURL(1, selectedView);
            }}
          />

          <div>
            <p>Total Enquiries: <span className="font-bold">{total}</span></p>
          </div>

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
            fetchEnquiries={fetchEnquiries}
          />
        </div>
      }
    </>
  );
}

export default EnquiryList;

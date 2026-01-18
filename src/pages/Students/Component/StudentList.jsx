import { useEffect, useMemo, useState, useRef } from "react";
import { Button, Segmented, Select, Table, Tag } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import studentStore from "@stores/StudentStore";
import userStore from "@stores/UserStore";
import { ROLES } from "@utils/constants";
import UserDetailsDrawer from "@components/UserDetailsDrawer";
import courseService from "@/services/Course";
import Chip from "@components/Chips/Chip";

function StudentList() {
  const {
    students,
    loading,
    getStudentsByCenter,
    total,
    searchResults,
    searchQuery,
    searchTotal,
    search,
    getCurrentSessionAttendees,
    currentSessionAttendees,
  } = studentStore();

  const { user } = userStore();

  const nav = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Get initial view and page from query parameters
  const initialView = queryParams.get("view") || "Current Students";
  const initialPage = parseInt(queryParams.get("page")) || 1;

  // const [visitedPages, setVisitedPages] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedView, setSelectedView] = useState(initialView);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);

  // Temporary filter states (before Apply is clicked)
  const [tempFromBranch, setTempFromBranch] = useState(null);

  // Applied filter states (after Apply is clicked)
  const [fromBranch, setFromBranch] = useState(null);

  const [allCenters, setAllCenters] = useState([]);

  // Ref to prevent concurrent fetches
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchStudents();
    console.log(students);
  }, [selectedView, currentPage, searchQuery, selectedCourses, fromBranch]);

  useEffect(() => {
    // Fetch all courses for filter dropdown
    const fetchCourses = async () => {
      try {
        const response = await courseService.getCourses({}, 0, 100);
        if (response?.courses) {
          setAllCourses(response.courses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    // Fetch all centers for migration filter dropdown
    const fetchCenters = async () => {
      try {
        const centersService = await import('@/services/Centers');
        const response = await centersService.default.getCenters({}, 0, 100);
        if (response?.centers) {
          setAllCenters(response.centers);
        }
      } catch (error) {
        console.error("Error fetching centers:", error);
      }
    };
    fetchCenters();
  }, []);

  const fetchStudents = () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log("⏭️ Skipping fetch - already in progress");
      return;
    }

    isFetchingRef.current = true;
    console.log("🔄 Starting fetch");

    try {
      // Only pass toBranch (user's center_id) when fromBranch filter is applied
      const toBranchParam = fromBranch ? user?.center_id : null;

      if (selectedView === "All Students") {
        if (searchQuery) {
          search(
            10,
            { searchQuery, query: { role: ROLES.STUDENT }, page: currentPage },
            currentPage
          );
        } else {
          getStudentsByCenter(10, currentPage, null, selectedCourses, fromBranch, toBranchParam);
        }
        // setVisitedPages(new Set([1]));
      } else if (selectedView === "Active Students") {
        // Fetch only active students from backend
        if (searchQuery) {
          search(
            10,
            { searchQuery, query: { role: ROLES.STUDENT, status: "active" }, page: currentPage },
            currentPage
          );
        } else {
          getStudentsByCenter(10, currentPage, "active", selectedCourses, fromBranch, toBranchParam);
        }
        // setVisitedPages(new Set([1]));
      } else {
        getCurrentSessionAttendees();
      }
    } finally {
      // Reset the flag after a short delay to allow the API call to complete
      setTimeout(() => {
        isFetchingRef.current = false;
        console.log("✅ Fetch completed");
      }, 100);
    }
  };

  const handleNameClick = (record) => {
    setSelectedUser(record);
    setDrawerVisible(true);
  };

  const handleSegmentChange = (view) => {
    setSelectedView(view);
    setSelectedCourses([]); // Clear course filter when view changes
    setFromBranch(null); // Clear applied migration filters
    setTempFromBranch(null); // Clear temporary migration filters
    setCurrentPage(1); // Reset to page 1
    updateURL(view, 1); // Update URL with new view and reset page to 1
  };

  const handleApplyFilters = () => {
    // Apply the temporary filter values
    setFromBranch(tempFromBranch);
    setCurrentPage(1); // Reset to page 1
    updateURL(selectedView, 1); // Reset to page 1 when applying filters
  };

  const handleClearFilters = () => {
    // Clear both temporary and applied filters
    setTempFromBranch(null);
    setFromBranch(null);
    setCurrentPage(1); // Reset to page 1
    updateURL(selectedView, 1); // Reset to page 1
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); // Update state
    updateURL(selectedView, page); // Update URL
    // No need to call loadMore here - the useEffect will trigger the fetch
  };

  const updateURL = (view, page) => {
    // Update the query parameters without adding to history
    nav(`?view=${view}&page=${page}`, { replace: true });
  };

  const courseFilters = useMemo(() => {
    return allCourses
      .map((course) => ({
        text: course.course_name,
        value: course._id,
      }))
      .sort((a, b) => a.text.localeCompare(b.text)); // Sort alphabetically by course name
  }, [allCourses]);

  const studentsToDisplay = useMemo(() => {
    let data = [];

    if (selectedView === "Current Students") {
      data = currentSessionAttendees;
    } else {
      data = searchQuery ? searchResults : students;
    }

    // Apply migration filters client-side for Current Students view
    // (For other views, filtering happens on backend)
    if (selectedView === "Current Students" && fromBranch) {
      data = data.filter((student) => {
        const migrated = student?.details_id?.migrated;
        if (!migrated) return false;

        // Check top-level migration fields (latest migration)
        const matchesFromBranch = fromBranch ? migrated.fromBranchId === fromBranch : true;
        // toBranch is always user's center_id
        const matchesToBranch = user?.center_id ? migrated.toBranchId === user.center_id : true;
        return matchesFromBranch && matchesToBranch;
      });
    }

    return data;
  }, [
    students,
    searchResults,
    searchQuery,
    currentSessionAttendees,
    selectedView,
    fromBranch,
    user?.center_id,
  ]);

  console.log("search query: ", searchQuery, searchResults, currentPage);

  const columns = [
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
      render: (name, record) => {
        const isMigrated = record?.details_id?.migrated;
        return (
          <div
            className="flex items-center gap-3"
            onClick={() => handleNameClick(record)}
            style={{ cursor: "pointer" }}
          >
            <img
              className="rounded-full aspect-square w-8 2xl:w-10 border border-border"
              src={record?.profile_img || '/images/default.jpg'}
              alt="Profile"
            />
            <p className="max-2xl:text-xs">{name}</p>
            {isMigrated && (
              <Tag color="blue" className="text-xs ml-1">
                Transferred
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Adm No",
      dataIndex: ["details_id", "admissionNumber"],
    },
    {
      title: "Course",
      dataIndex: ["details_id", "course", "course_name"],
      key: "course_name",
      filters: courseFilters,
      filteredValue: selectedCourses.length > 0 ? selectedCourses : null,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Type",
      dataIndex: "slotType",
    },
    {
      title: "Enrollment Date",
      dataIndex: ["details_id", "enrollment_date"],
      render: (date) => {
        return date ? <p>{new Date(date).toDateString()}</p> : <p>-</p>;
      },
    }

  ];

  if (selectedView === "Current Students") {
    columns.push(
      {
        title: "Status",
        dataIndex: "isPresent",
        render: (value) => <Chip type={value ? "success" : "danger"} label={value ? "Present" : "Absent"} glow={false} />
      }
    )
  } else {
    columns.push({
      title: "Attendance",
      dataIndex: "sessions_attended",
      render: (attendedCount, record) => {
        const totalSessions = record?.details_id?.course?.total_session || 0;
        const attended = record?.attended || 0;

        return (
          <p>
            {attended}/{totalSessions}
          </p>
        );
      },
    },)
  }

  const handleTableChange = (pagination, filters) => {
    // Handle course filter change
    const newCourseFilters = filters.course_name && filters.course_name.length > 0 ? filters.course_name : [];

    // Check if the filter has changed by comparing arrays
    const hasChanged = JSON.stringify(newCourseFilters.sort()) !== JSON.stringify(selectedCourses.sort());

    if (hasChanged) {
      setSelectedCourses(newCourseFilters);
      setCurrentPage(1); // Reset to page 1 when filter changes
      updateURL(selectedView, 1);
      // No need to call fetch here - the useEffect will handle it
    }
  };

  return (
    <>
      {/* Migration Filters - positioned below search, above view selector */}
      <div className="flex gap-3 mb-4 items-center flex-wrap">
        <Select
          placeholder="From Branch"
          value={tempFromBranch}
          onChange={(value) => setTempFromBranch(value)}
          allowClear
          style={{ minWidth: 150 }}
          options={allCenters
            .filter((center) => center._id !== user?.center_id)
            .map((center) => ({
              label: center.center_name,
              value: center._id,
            }))}
        />
        <Select
          placeholder="To Branch (Your Branch)"
          value={user?.center_id}
          disabled
          style={{ minWidth: 200 }}
          options={allCenters
            .filter((center) => center._id === user?.center_id)
            .map((center) => ({
              label: center.center_name,
              value: center._id,
            }))}
        />
        <Button
          type="primary"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
        <Button
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </div>

      {/* View Selector */}
      <Segmented
        options={["Current Students", "All Students", "Active Students"]}
        className="w-fit mb-4"
        value={selectedView}
        onChange={handleSegmentChange}
      />

      <Table
        columns={columns}
        dataSource={studentsToDisplay}
        loading={loading}
        onChange={handleTableChange}
        pagination={
          selectedView === "All Students" || selectedView === "Active Students"
            ? {
              current: currentPage,
              onChange: handlePageChange,
              total: searchQuery ? searchTotal : total,
              pageSize: 10,
              showSizeChanger: false,
            }
            : false
        }
        rowClassName={(record) => {
          // Example condition: highlight students with status 'Inactive'
          return record.slotType === "additional" ? "bg-blue-200" : "";
        }}
      />
      <UserDetailsDrawer
        user={selectedUser}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        showActions
        isStudentDetail
      />
    </>
  );
}

export default StudentList;

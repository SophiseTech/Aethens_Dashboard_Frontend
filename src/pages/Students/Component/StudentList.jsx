import React, { useEffect, useMemo, useState } from "react";
import { Button, Segmented, Space, Table } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import AllotSessions from "@pages/Students/Component/AllotSessions";
import SessionStatus from "@pages/Students/Component/SessionStatus";
import studentStore from "@stores/StudentStore";
import { ROLES } from "@utils/constants";
import UserDetailsDrawer from "@components/UserDetailsDrawer";
import { render } from "@react-pdf/renderer";
import courseService from "@/services/Course";

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

  const nav = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Get initial view and page from query parameters
  const initialView = queryParams.get("view") || "Current Students"; // Default to 'Current Students' if no query param
  const currentPage = parseInt(queryParams.get("page")) || 1; // Default to page 1 if no query param

  const [visitedPages, setVisitedPages] = useState(new Set());
  // const [currentPage, setCurrentPage] = useState(initialPage);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedView, setSelectedView] = useState(initialView);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    fetchStudents();
    console.log(students);
  }, [selectedView, currentPage, searchQuery, selectedCourse]);

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

  const fetchStudents = () => {
    if (selectedView === "All Students") {
      if (searchQuery) {
        search(
          10,
          { searchQuery, query: { role: ROLES.STUDENT }, page: currentPage },
          currentPage
        );
      } else {
        getStudentsByCenter(10, currentPage, null, selectedCourse);
      }
      setVisitedPages(new Set([1]));
    } else if (selectedView === "Active Students") {
      // Fetch only active students from backend
      if (searchQuery) {
        search(
          10,
          { searchQuery, query: { role: ROLES.STUDENT, status: "active" }, page: currentPage },
          currentPage
        );
      } else {
        getStudentsByCenter(10, currentPage, "active", selectedCourse);
      }
      setVisitedPages(new Set([1]));
    } else {
      getCurrentSessionAttendees();
    }
  };

  const handleNameClick = (record) => {
    setSelectedUser(record);
    setDrawerVisible(true);
  };

  const handleSegmentChange = (view) => {
    setSelectedView(view);
    setSelectedCourse(null); // Clear course filter when view changes
    updateURL(view, 1); // Update URL with new view and reset page to 1
  };

  const handlePageChange = (page, pageSize) => {
    updateURL(selectedView, page); // Update URL with new page
    // Don't call loadMore here - let the onChange handler deal with it
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
    if (selectedView === "Current Students") {
      return currentSessionAttendees;
    }

    // Return the data directly - filtering now happens at backend
    return searchQuery ? searchResults : students;
  }, [
    students,
    searchResults,
    searchQuery,
    currentSessionAttendees,
    selectedView,
  ]);

  console.log("search query: ", searchQuery, searchResults, currentPage);

  const columns = [
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
      render: (name, record) => (
        <div
          className="flex items-center gap-3"
          onClick={() => handleNameClick(record)}
          style={{ cursor: "pointer" }}
        >
          <img
            className="rounded-full aspect-square w-8 2xl:w-10 border border-border"
            src={record?.profile_img}
            alt="Profile"
          />
          <p className="max-2xl:text-xs">{name}</p>
        </div>
      ),
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
      filteredValue: selectedCourse ? [selectedCourse] : null,
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
      render: (date, record) => {
        const displayDate = date || record.createdAt;
        return displayDate ? <p>{new Date(displayDate).toDateString()}</p> : <p>-</p>;
      },
    },
    {
      title: "Sessions Attended",
      dataIndex: "sessions_attended",
      render: (attendedCount, record) => {
        const totalSessions = record?.details_id?.course?.total_session || 0;
        const attended = attendedCount || 0;

        return (
          <p>
            {attended}/{totalSessions}
          </p>
        );
      },
    },
  ];

  const loadMore = (page, pageSize) => {
    if (selectedView === "All Students") {
      if (searchQuery) {
        search(
          pageSize,
          { searchQuery, query: { role: ROLES.STUDENT }, page },
          page
        );
      } else {
        getStudentsByCenter(pageSize, page, null, selectedCourse);
      }
      setVisitedPages((prev) => new Set(prev).add(page));
    } else if (selectedView === "Active Students") {
      if (searchQuery) {
        search(
          pageSize,
          { searchQuery, query: { role: ROLES.STUDENT, status: "active" }, page },
          page
        );
      } else {
        getStudentsByCenter(pageSize, page, "active", selectedCourse);
      }
      setVisitedPages((prev) => new Set(prev).add(page));
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // Handle pagination
    if (pagination.current !== currentPage) {
      loadMore(pagination.current, pagination.pageSize);
    }

    // Handle course filter change
    const newCourseFilter = filters.course_name && filters.course_name.length > 0 ? filters.course_name[0] : null;

    if (newCourseFilter !== selectedCourse) {
      setSelectedCourse(newCourseFilter);
      // Reset to page 1 when filter changes
      if (newCourseFilter !== selectedCourse) {
        updateURL(selectedView, 1);
      }
    }
  };

  return (
    <>
      <Segmented
        options={["Current Students", "All Students", "Active Students"]}
        className="w-fit"
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

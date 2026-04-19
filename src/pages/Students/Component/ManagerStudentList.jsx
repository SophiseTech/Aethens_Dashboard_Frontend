import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Segmented, Table, Tag } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import studentStore from '@stores/StudentStore';
import { ROLES } from '@utils/constants';
import UserDetailsDrawer from '@components/UserDetailsDrawer';
import { useStore } from 'zustand';
import Chip from '@components/Chips/Chip';
import userStore from '@stores/UserStore';
import facultyAssignmentStore from '@stores/FacultyAssignmentStore';

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
    getTodaysSessionAttendees,
    todaysSessionAttendees,
  } = useStore(studentStore);

  const { user } = useStore(userStore);
  const { unassignedStudents, getUnassignedStudents } = useStore(facultyAssignmentStore);

  const nav = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const initialView = queryParams.get('view') || 'Current Students';
  const initialPage = parseInt(queryParams.get('page')) || 1;

  const [visitedPages, setVisitedPages] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedView, setSelectedView] = useState(initialView);

  const segmentOptions = useMemo(() => {
    if (user?.role === ROLES.FACULTY) {
      return ['Current Students', 'All Students', 'Todays Students'];
    }
    return ['Current Students', 'Unassigned Students', 'All Students', 'Todays Students'];
  }, [user?.role]);

  useEffect(() => {
    fetchStudents();
  }, [selectedView, searchQuery, currentPage]);

  useEffect(() => {
    if (!segmentOptions.includes(selectedView)) {
      setSelectedView(segmentOptions[0]);
      setCurrentPage(1);
    }
  }, [segmentOptions, selectedView]);

  const fetchStudents = () => {
    if (selectedView === 'All Students') {
      if (searchQuery) {
        search(10, { searchQuery, query: { role: ROLES.STUDENT, center_id: user.center_id }, page: currentPage }, currentPage);
      } else {
        getStudentsByCenter(10, currentPage);
      }
      setVisitedPages(new Set([1]));
    } else if (selectedView === 'Todays Students') {
      getTodaysSessionAttendees(user, user.center_id);
    } else if (selectedView === 'Unassigned Students' && user?.role !== ROLES.FACULTY) {
      getUnassignedStudents(user.center_id);
    } else {
      getCurrentSessionAttendees();
    }
  };

  const handleNameClick = (record) => {
    setSelectedUser(record?.student || record);
    setDrawerVisible(true);
  };

  const handleSegmentChange = (view) => {
    setSelectedView(view);
    setCurrentPage(1);
    updateURL(view, 1);
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    updateURL(selectedView, page);
    loadMore(page, pageSize);
  };

  const updateURL = (view, page) => {
    nav(`?view=${view}&page=${page}`, { replace: true });
  };

  const studentsToDisplay = useMemo(() => {
    if (selectedView === 'Current Students') return currentSessionAttendees;
    if (selectedView === 'Unassigned Students') return unassignedStudents;
    if (selectedView === 'Todays Students') return todaysSessionAttendees;
    return searchQuery ? searchResults : students;
  }, [students, searchResults, searchQuery, currentSessionAttendees, selectedView, todaysSessionAttendees, unassignedStudents]);

  const isCurrentView = selectedView === 'Current Students';

  const columns = [
    {
      title: 'Name',
      key: 'username',
      render: (_, record) => {
        const name = record?.student?.username || record?.username;
        const img = record?.student?.profile_img || record?.profile_img || '/images/default.jpg';
        const ringStyle = isCurrentView && record.isPresent !== undefined
          ? {
            outline: `3px solid ${record.isPresent ? '#52c41a' : '#ff4d4f'}`,
            outlineOffset: '2px',
          }
          : {};
        return (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNameClick(record)}>
            <img
              className="rounded-full aspect-square w-8 2xl:w-10 border border-border"
              style={ringStyle}
              src={img}
              alt="Profile"
            />
            <p className="max-2xl:text-xs">{name}</p>
          </div>
        );
      },
    },
    {
      title: 'Adm No',
      key: 'admissionNumber',
      render: (_, record) =>
        record?.student?.details_id?.admissionNumber ||
        record?.details_id?.admissionNumber ||
        '—',
    },
    {
      title: 'Course',
      key: 'course',
      render: (_, record) =>
        record?.student?.details_id?.course?.course_name ||
        record?.details_id?.course?.course_name ||
        '—',
    },
  ];

  if (isCurrentView) {
    columns.push(
      {
        title: 'Attendance',
        key: 'attendance',
        render: (_, record) => {
          const totalSessions =
            record?.student?.details_id?.course?.total_session ??
            record?.details_id?.course?.total_session ??
            0;
          const attended = record?.attended ?? 0;
          return <p className="text-sm">{attended}/{totalSessions}</p>;
        },
      },
      {
        title: "Faculty",
        key: "faculty",
        render: (_, record) => {
          const isAssigned = !!record.facultyName;
          const source = record.assignmentSource;
          const sourceColor = isAssigned ? (source === "AUTO" ? "blue" : "green") : "orange";
          const sourceLabel = isAssigned ? (source === "AUTO" ? "Auto-Assigned" : "Manual") : "Unassigned";
          const isUnassigned = !isAssigned;
          return (
            <Flex vertical gap={4} align="flex-start">
              <span className="font-medium text-[13px] text-gray-700 leading-none">
                {record.facultyName ?? "—"}
              </span>
              <Flex gap={8} align="center">
                <Tag
                  color={sourceColor}
                  className="m-0 border-transparent rounded-full px-2"
                  style={{ fontSize: "10px", lineHeight: "16px" }}
                >
                  {sourceLabel}
                </Tag>
              </Flex>
            </Flex>
          );
        },
      }
    );
  }

  if (selectedView === 'Unassigned Students') {
    columns.push({
      title: 'Marked At',
      dataIndex: 'assignedAt',
      render: (value) => value ? new Date(value).toLocaleString() : '—',
    });
  }

  const loadMore = (page, pageSize) => {
    if (selectedView === 'All Students') {
      if (searchQuery) {
        search(pageSize, { searchQuery, query: { role: ROLES.STUDENT }, page }, page);
      } else {
        getStudentsByCenter(pageSize, page);
      }
      setVisitedPages((prev) => new Set(prev).add(page));
    }
  };

  return (
    <>
      <Segmented
        options={segmentOptions}
        className="w-fit"
        value={selectedView}
        onChange={handleSegmentChange}
      />
      <Table
        rowKey={(record, idx) => record._id?.toString?.() || record.slotId?.toString?.() || String(idx)}
        columns={columns}
        dataSource={studentsToDisplay}
        loading={loading}
        pagination={selectedView === 'All Students' ? {
          current: currentPage,
          onChange: handlePageChange,
          total: searchQuery ? searchTotal : total,
          pageSize: 10,
          showSizeChanger: false,
        } : false}
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

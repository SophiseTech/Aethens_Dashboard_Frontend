import React, { useEffect, useMemo, useState } from 'react';
import { Button, Segmented, Space, Table } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import AllotSessions from '@pages/Students/Component/AllotSessions';
import SessionStatus from '@pages/Students/Component/SessionStatus';
import studentStore from '@stores/StudentStore';
import { ROLES } from '@utils/constants';
import UserDetailsDrawer from '@components/UserDetailsDrawer';

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
  const initialView = queryParams.get('view') || 'Current Students'; // Default to 'Current Students' if no query param
  const currentPage = parseInt(queryParams.get('page')) || 1; // Default to page 1 if no query param

  const [visitedPages, setVisitedPages] = useState(new Set());
  // const [currentPage, setCurrentPage] = useState(initialPage);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedView, setSelectedView] = useState(initialView);

  useEffect(() => {
    fetchStudents();
  }, [selectedView, currentPage, searchQuery]);

  const fetchStudents = () => {
    if (selectedView === "All Students") {
      if (searchQuery) {
        search(10, { searchQuery, query: { role: ROLES.STUDENT }, page: currentPage }, currentPage);
      } else {
        getStudentsByCenter(10, currentPage);
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
    // setCurrentPage(1); // Reset to page 1 when view changes
    updateURL(view, 1); // Update URL with new view and reset page to 1
  };

  const handlePageChange = (page, pageSize) => {
    // setCurrentPage(page);
    updateURL(selectedView, page); // Update URL with new page
    loadMore(page, pageSize); // Fetch data for the new page
  };

  const updateURL = (view, page) => {
    // Update the query parameters without adding to history
    nav(`?view=${view}&page=${page}`, { replace: true });
  };

  const studentsToDisplay = useMemo(() => {
    if (selectedView === "Current Students") return currentSessionAttendees;
    return searchQuery ? searchResults : students;
  }, [students, searchResults, searchQuery, currentSessionAttendees, selectedView]);

  console.log("search query: ", searchQuery, searchResults, currentPage);
  

  const columns = [
    {
      title: 'Name',
      dataIndex: 'username',
      key: 'username',
      render: (name, record) => (
        <div className="flex items-center gap-3" onClick={() => handleNameClick(record)} style={{ cursor: 'pointer' }}>
          <img className="rounded-full aspect-square w-8 2xl:w-10 border border-border" src={record?.profile_img} alt="Profile" />
          <p className="max-2xl:text-xs">{name}</p>
        </div>
      ),
    },
    {
      title: 'Adm No',
      dataIndex: ["details_id", "admissionNumber"],
    },
    {
      title: 'Course',
      dataIndex: ["details_id", "course", "course_name"],
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Type',
      dataIndex: 'slotType',
    },
  ];

  const loadMore = (page, pageSize) => {
    if (selectedView === "All Students") {
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
        options={["Current Students", "All Students"]}
        className='w-fit'
        value={selectedView}
        onChange={handleSegmentChange}
      />
      <Table
        columns={columns}
        dataSource={studentsToDisplay}
        loading={loading}
        pagination={selectedView === "All Students" ? {
          current: currentPage,
          onChange: handlePageChange,
          total: searchQuery ? searchTotal : total,
          pageSize: 10,
        } : false}
        rowClassName={(record) => {
          // Example condition: highlight students with status 'Inactive'
          return record.slotType === 'additional' ? 'bg-blue-200' : '';
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
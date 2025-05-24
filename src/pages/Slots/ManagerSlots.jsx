import { useEffect, useState } from 'react';
import { Select, Button, Table, message, Space, Typography, Empty, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import SessionStore from '@stores/SessionStore';
import { ROLES, weekDays } from '@utils/constants';
import sessionService from '@/services/Session';
import { sessionSlotOptionRenderer } from '@pages/Students/Component/AllotSessions';
import userStore from '@stores/UserStore';

const { Title } = Typography;

function ManagerSlots() {
  const [sessionOptions, setSessionOptions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [deallocatingIds, setDeallocatingIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1)
  const { user } = userStore()

  const { getAllSessions } = SessionStore();

  useEffect(() => {
    async function loadSessions() {
      try {
        setLoadingSessions(true);
        const allSessions = await getAllSessions();
        const options = allSessions.map((session) => {
          const localTime = dayjs(session.start_time).format('hh:mm A');
          return {
            label: `${weekDays[session?.weekDay]} - ${localTime}`,
            value: session._id,
            data: session
          };
        });
        setSessionOptions(options);
      } catch (error) {
        console.error('Failed to load sessions:', error);
        message.error('Failed to load session data');
      } finally {
        setLoadingSessions(false);
      }
    }
    loadSessions();
  }, [getAllSessions]);

  const loadStudents = async () => {
    if (!selectedSessionId) {
      message.warning('Please select a session first');
      return;
    }
    try {
      setLoadingStudents(true);
      const studentList = await sessionService.getStudentsBySessionId(selectedSessionId);
      const formatted = (studentList || []).map((student, idx) => ({
        key: student._id || idx,
        _id: student._id,
        name: student.username,
        email: student.email,
        status: student.status,
        course_name: student.course_name
      }));
      setStudents(formatted);
    } catch (error) {
      console.error('Failed to load students:', error);
      message.error('Failed to load student data');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleDeallocate = async (studentId) => {
    try {
      setDeallocatingIds((prev) => [...prev, studentId]);
      await sessionService.deallocateSessions(studentId);
      setStudents((prev) => prev.filter((student) => student._id !== studentId));
      message.success('Student deallocated successfully');
    } catch (error) {
      console.error('Failed to deallocate student:', error);
      message.error('Failed to deallocate student');
    } finally {
      setDeallocatingIds((prev) => prev.filter((id) => id !== studentId));
    }
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => {
        const pageSize = 10;;

        return index + 1 + (currentPage - 1) * pageSize;
      },
      roles: [ROLES.FACULTY, ROLES.MANAGER]
    },
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
      roles: [ROLES.FACULTY, ROLES.MANAGER]
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      roles: [ROLES.MANAGER]
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (status) => (
    //     <span style={{ color: status === 'active' ? 'green' : 'volcano' }}>{status}</span>
    //   ),
    //   roles: [ROLES.MANAGER]
    // },
    {
      title: 'Course',
      dataIndex: "course_name",
      key: 'course_name',
      roles: [ROLES.FACULTY, ROLES.MANAGER],
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        actionButtonsByRole.map((action) => {
          if (action.roles.includes(user.role)) {
            return action.render(record);
          }
          return null;
        })
      ),
    },
  ];

  const actionButtonsByRole = [
    {
      roles: [ROLES.MANAGER],
      render: (record) => (
        <Popconfirm
          title="Are you sure you want to deallocate this student?"
          onConfirm={() => handleDeallocate(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="primary"
            danger
            size="small"
            loading={deallocatingIds.includes(record._id)}
          >
            Deallocate
          </Button>
        </Popconfirm>
      ),
    }
  ]

  const columnsByRole = columns.filter((column) => {
    const columnRoles = column.roles || [];
    return columnRoles.includes(user.role);
  });

  return (
    <Space direction="vertical" style={{ padding: 24, width: '100%' }}>
      <Title level={3}>View Students by Session</Title>
      <Space wrap>
        <Select
          showSearch
          placeholder="Select a session"
          loading={loadingSessions}
          style={{ width: 300 }}
          options={sessionOptions}
          onChange={(value) => {
            setSelectedSessionId(value);
            setStudents([]);
          }}
          optionFilterProp="label"
          optionRender={(options) => sessionSlotOptionRenderer(options, user)}
        />
        <Button
          type="primary"
          onClick={loadStudents}
          loading={loadingStudents}
          disabled={!selectedSessionId}
        >
          {students.length > 0 ? 'Reload Students' : 'Load Students'}
        </Button>
      </Space>

      {selectedSessionId && (
        <Title level={5} style={{ marginTop: 16 }}>
          Showing students for session:{' '}
          {sessionOptions.find((opt) => opt.value === selectedSessionId)?.label || ''}
        </Title>
      )}

      {students.length > 0 ? (
        <Table
          dataSource={students}
          columns={columnsByRole}
          pagination={{
            current: currentPage,
            pageSize: 10,
            onChange: (page, pageSize) => {
              setCurrentPage(page); // Update your pagination state
            },
          }}
          loading={loadingStudents}
          bordered
        />
      ) : (
        !loadingStudents && <Empty description="No students found for this session." />
      )}
    </Space>
  );
}

export default ManagerSlots;

import { useEffect, useMemo, useState } from 'react';
import { Select, Button, Table, message, Space, Typography, Empty, Popconfirm, DatePicker, Tag } from 'antd';
import dayjs from 'dayjs';
import SessionStore from '@stores/SessionStore';
import { ROLES, weekDays } from '@utils/constants';
import sessionService from '@/services/Session';
import userStore from '@stores/UserStore';
import { useStore } from 'zustand';
import centersStore from '@stores/CentersStore';
import TitleLayout from '@components/layouts/Title';
import { sessionSlotOptionRenderer } from '@components/form/SessionDateSelector';

const { Title } = Typography;

const TYPE_TAG = {
  rescheduled: { color: 'orange', label: 'Rescheduled' },
  additional:  { color: 'blue',   label: 'Additional'  },
};

function ManagerSlots() {
  const [sessionOptions, setSessionOptions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [deallocatingIds, setDeallocatingIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [extraPage, setExtraPage] = useState(1);
  const [slotDate, setSlotDate] = useState(dayjs());
  const { user } = userStore();
  const { selectedCenter } = useStore(centersStore);

  const { getAllSessions } = SessionStore();

  useEffect(() => {
    async function loadSessions() {
      try {
        setLoadingSessions(true);
        const allSessions = await getAllSessions(slotDate);
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
  }, [getAllSessions, selectedCenter, slotDate]);

  useEffect(() => {
    setStudents([]);
    setSelectedSessionId(null);
  }, [slotDate]);

  const regularSlots = useMemo(
    () => students.filter((s) => s.type === 'regular').sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [students]
  );

  const extraSlots = useMemo(
    () => students.filter((s) => s.type === 'rescheduled' || s.type === 'additional').sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [students]
  );

  const loadStudents = async () => {
    if (!selectedSessionId) {
      message.warning('Please select a session first');
      return;
    }
    try {
      setLoadingStudents(true);
      const studentList = await sessionService.getStudentsBySessionId(selectedSessionId, slotDate);
      const formatted = (studentList || []).map((student, idx) => ({
        key: student._id || idx,
        _id: student._id,
        name: student.username,
        email: student.email,
        status: student.status,
        course_name: student.course_name,
        type: student.type,
      }));
      setStudents(formatted);
      setCurrentPage(1);
      setExtraPage(1);
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

  const deallocateAction = {
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
  };

  const baseColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      roles: [ROLES.FACULTY, ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
    },
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
      roles: [ROLES.FACULTY, ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      roles: [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
    },
    {
      title: 'Course',
      dataIndex: 'course_name',
      key: 'course_name',
      roles: [ROLES.FACULTY, ROLES.MANAGER, ROLES.ADMIN],
    },
    {
      title: 'Action',
      key: 'action',
      roles: [ROLES.MANAGER],
      render: (_, record) => deallocateAction.roles.includes(user.role) ? deallocateAction.render(record) : null,
    },
  ];

  const filterByRole = (cols) =>
    cols.filter((c) => (c.roles || []).includes(user.role));

  const regularColumns = filterByRole(baseColumns).map((col, colIdx) => ({
    ...col,
    render: col.key === 'index'
      ? (_, __, idx) => idx + 1 + (currentPage - 1) * 10
      : col.render,
  }));

  const extraColumns = filterByRole([
    ...baseColumns.slice(0, -1),
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      roles: [ROLES.FACULTY, ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER],
      render: (value) => {
        const cfg = TYPE_TAG[value];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : value;
      },
    },
    baseColumns[baseColumns.length - 1],
  ]).map((col) => ({
    ...col,
    render: col.key === 'index'
      ? (_, __, idx) => idx + 1 + (extraPage - 1) * 10
      : col.render,
  }));

  const hasData = students.length > 0;

  return (
    <TitleLayout title="View Students by Session">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
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
          <DatePicker onChange={setSlotDate} value={slotDate} />
          <Button
            type="primary"
            onClick={loadStudents}
            loading={loadingStudents}
            disabled={!selectedSessionId}
          >
            {hasData ? 'Reload Students' : 'Load Students'}
          </Button>
        </Space>

        {selectedSessionId && (
          <Title level={5} style={{ margin: 0 }}>
            Showing students for:{' '}
            {sessionOptions.find((opt) => opt.value === selectedSessionId)?.label || ''}
          </Title>
        )}

        {!hasData && !loadingStudents && (
          <Empty description="No students found for this session." />
        )}

        {(hasData || loadingStudents) && (
          <>
            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                Regular Slots
                {hasData && (
                  <Tag color="default" style={{ marginLeft: 8, fontWeight: 'normal' }}>
                    {regularSlots.length}
                  </Tag>
                )}
              </Title>
              <Table
                dataSource={regularSlots}
                columns={regularColumns}
                pagination={{
                  current: currentPage,
                  pageSize: 10,
                  onChange: setCurrentPage,
                  hideOnSinglePage: true,
                }}
                loading={loadingStudents}
                bordered
                size="small"
                locale={{ emptyText: 'No regular slots for this session.' }}
              />
            </div>

            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                Rescheduled &amp; Additional Slots
                {hasData && (
                  <Tag color="default" style={{ marginLeft: 8, fontWeight: 'normal' }}>
                    {extraSlots.length}
                  </Tag>
                )}
              </Title>
              <Table
                dataSource={extraSlots}
                columns={extraColumns}
                pagination={{
                  current: extraPage,
                  pageSize: 10,
                  onChange: setExtraPage,
                  hideOnSinglePage: true,
                }}
                loading={loadingStudents}
                bordered
                size="small"
                locale={{ emptyText: 'No rescheduled or additional slots for this session.' }}
              />
            </div>
          </>
        )}
      </Space>
    </TitleLayout>
  );
}

export default ManagerSlots;


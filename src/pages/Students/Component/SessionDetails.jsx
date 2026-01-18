import { Button, Modal, Table, DatePicker, Space, Typography, Card, Flex, Tag, message, Empty, Popconfirm } from 'antd';
import studentStore from '@stores/StudentStore';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { isUserActive } from '@utils/helper';
import slotService from '@/services/Slot';
import sessionService from '@/services/Session'; // Assuming you have a session service
import { render } from 'react-dom';

const { Text, Title } = Typography;

function ViewStudentSessions({ student, isModalOpen, setIsModalOpen }) {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().startOf('month'));
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [deallocating, setDeallocating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const { getActiveSessions } = studentStore();
  const activeStudentSessions = studentStore((state) => state.activeStudentSessions);
  const studentActiveSession = activeStudentSessions[student._id] || [];

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    const fetchSessions = async () => {
      if (isModalOpen) {
        try {
          setLoadingSessions(true);
          await getActiveSessions(student._id);
        } catch (error) {
          console.error('Error fetching sessions:', error);
          message.error('Failed to load sessions');
        } finally {
          setLoadingSessions(false);
        }
      }
    };
    // fetchSessions();
    fetchSlots()
  }, [isModalOpen]);

  const handleCancel = () => {
    setIsModalOpen(false);
    setSlots([]);
    setSelectedMonth(dayjs().startOf('month'));
  };

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);

      // Support both legacy numeric month (0-11) and new dayjs month object
      const isNumberMonth = typeof selectedMonth === 'number';
      const monthDayjs = isNumberMonth ? dayjs().month(selectedMonth) : selectedMonth;

      const start = (monthDayjs && monthDayjs.startOf ? monthDayjs.startOf('month') : dayjs().startOf('month')).toDate();
      const end = (monthDayjs && monthDayjs.endOf ? monthDayjs.endOf('month') : dayjs().endOf('month')).toDate();

      const response = await slotService.getSlots({
        query: {
          start_date: {
            $gte: start,
            $lte: end
          },
          booked_student_id: student._id,
          // course_id: student?.details_id?.course_id?._id || student?.details_id?.course_id,
          isActive: true
        },
        populate: "session",
        sort: "start_date",
      }, 0, 0);
      setSlots(response?.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      message.error('Failed to load slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDeallocateSessions = async () => {
    try {
      setDeallocating(true);
      // Confirm before deallocation
      Modal.confirm({
        title: 'Are you sure you want to deallocate all sessions?',
        content: 'This will remove all scheduled sessions for this student.',
        okText: 'Yes, deallocate',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          // Call your deallocation API for each session
          await sessionService.deallocateSessions(student._id)

          // Refresh the sessions
          await getActiveSessions(student._id);
          setSlots([]);
          message.success('Sessions deallocated successfully');
        }
      });
    } catch (error) {
      console.error('Error deallocating sessions:', error);
      message.error('Failed to deallocate sessions');
    } finally {
      setDeallocating(false);
    }
  };

  const handleSyncSlots = async () => {
    try {
      setSyncing(true);
      await slotService.syncSlots(student._id);
      message.success('Slots synced successfully');
      // Optionally refresh slots or sessions here
      await fetchSlots();
    } catch (error) {
      message.error('Failed to sync slots');
    } finally {
      setSyncing(false);
    }
  };



  const getStatusTag = (status) => {
    const statusMap = {
      scheduled: { color: 'blue', text: 'Scheduled' },
      completed: { color: 'green', text: 'Completed' },
      cancelled: { color: 'red', text: 'Cancelled' },
      missed: { color: 'orange', text: 'Missed' }
    };

    const statusInfo = statusMap[status?.toLowerCase()] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const handleDeleteSlot = async (record) => {
    try {
      await slotService.deleteSlot(record._id);
      message.success('Slot deleted successfully');
      setSlots((prevSlots) => prevSlots.filter((slot) => slot._id !== record._id));
    } catch (error) {
      console.error('Error deleting slot:', error);
      message.error('Failed to delete slot');
    }
  };

  const handleMarkAttended = async (record) => {
    try {
      await slotService.updateSlotStatus(record._id, 'attended');
      message.success('Slot marked as attended');
      setSlots((prevSlots) => prevSlots.map((slot) => (slot._id === record._id ? { ...slot, status: 'attended' } : slot)));
    } catch (error) {
      console.error('Error marking slot as attended:', error);
      message.error('Failed to mark slot as attended');
    }
  };

  const handleMarkUnattended = async (record) => {
    try {
      let status = "booked"
      if (dayjs(record.start_date).isBefore(dayjs())) {
        status = "absent"
      }
      await slotService.updateSlotStatus(record._id, status);
      message.success('Slot marked as unattended');
      setSlots((prevSlots) => prevSlots.map((slot) => (slot._id === record._id ? { ...slot, status: status } : slot)));
    } catch (error) {
      console.error('Error marking slot as unattended:', error);
      message.error('Failed to mark slot as unattended');
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'start_date',
      key: 'date',
      render: (date) => dayjs(date).format("dddd, D MMM, YYYY"),
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date)
    },
    {
      title: 'Time',
      dataIndex: ["session", 'start_time'],
      key: 'time',
      render: (time) => time ? dayjs(time).format("h:mm A") : '-',
      sorter: (a, b) => {
        const timeA = a.session?.start_time || '';
        const timeB = b.session?.start_time || '';
        return timeA.localeCompare(timeB);
      }
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1),
      filters: [
        { text: 'Regular', value: 'regular' },
        { text: 'Additional', value: 'additional' }
      ],
      onFilter: (value, record) => record.type?.toLowerCase() === value,

    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Scheduled', value: 'scheduled' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
        { text: 'Missed', value: 'missed' }
      ],
      onFilter: (value, record) => record.status?.toLowerCase() === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this slot?"
            onConfirm={() => handleDeleteSlot(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>

          {record.status?.toLowerCase() !== 'attended' ? (
            <Popconfirm
              title="Mark this slot as attended?"
              onConfirm={() => handleMarkAttended(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link">Mark Attended</Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Mark this slot as unattended?"
              onConfirm={() => handleMarkUnattended(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link">Mark Unattended</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }

  ];

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>{student.username}'s Sessions</Title>}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={800}
      destroyOnClose
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* <Flex gap={10} wrap>
          {loadingSessions ? (
            <Card loading={true} style={{ width: '100%' }} />
          ) :
            studentActiveSession.length <= 0 ? (
              <Empty description="No active sessions found. Please allot sessions" style={{ width: '100%' }} />
            )
              : (
                studentActiveSession.map((session, index) => {
                  const sessionDay = weekDays[session.session_id.weekDay];
                  const startTime = dayjs(session.session_id.start_time).format('h:mm A');
                  const endTime = dayjs(session.session_id.end_time).format('h:mm A');
                  const expiresAt = dayjs(session.expires_at).format('DD MMM YYYY');

                  return (
                    <Card
                      key={index}
                      title={`Session ${index + 1}`}
                      size="small"
                      style={{ minWidth: 250, flex: 1 }}
                      loading={loadingSessions}
                    >
                      <Space direction="vertical">
                        <div>
                          <Text strong>Day: </Text>
                          <Text>{sessionDay}</Text>
                        </div>

                        <div>
                          <Text strong>Time: </Text>
                          <Text>{startTime} - {endTime}</Text>
                        </div>

                        <div>
                          <Text strong>Type: </Text>
                          <Text>{session.type.charAt(0).toUpperCase() + session.type.slice(1)}</Text>
                        </div>

                        <div>
                          <Text strong>Expires on: </Text>
                          <Text>{expiresAt}</Text>
                        </div>
                      </Space>
                    </Card>
                  );
                })
              )
          }
        </Flex> */}

        <Flex justify="space-between" align="center">
          <Space size="middle" align="center">
            <DatePicker
              picker="month"
              style={{ width: 200 }}
              value={selectedMonth}
              onChange={(date) => setSelectedMonth(date)}
              disabled={loadingSlots}
              format="MMMM YYYY"
            />
            <Button
              onClick={fetchSlots}
              loading={loadingSlots}
              type="primary"
            >
              Load Slots
            </Button>
          </Space>

          <Space size="middle">
            {studentActiveSession.length > 0 && (
              <Button
                danger
                type="primary"
                onClick={handleDeallocateSessions}
                loading={deallocating}
                disabled={deallocating || loadingSessions}
              >
                Deallocate Sessions
              </Button>
            )}
            <Button
              type="default"
              onClick={handleSyncSlots}
              loading={syncing}
              disabled={syncing || loadingSessions}
            >
              Sync Slots
            </Button>
          </Space>
        </Flex>

        <Table
          columns={columns}
          dataSource={slots}
          rowKey="_id"
          loading={loadingSlots}
          pagination={{ pageSize: 5 }}
          scroll={{ x: true }}
          bordered
        />
      </Space>
    </Modal>
  );
}

export default ViewStudentSessions;
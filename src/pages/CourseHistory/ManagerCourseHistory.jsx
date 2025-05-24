import { useEffect, useState } from 'react';
import { Card, Dropdown, Menu, Space, Typography, Empty, Spin, message, List, Button, Tag, Tooltip } from 'antd';
import { EllipsisOutlined, ReloadOutlined, FileTextOutlined, DownloadOutlined, CalendarOutlined } from '@ant-design/icons';
import studentService from '@/services/Student';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '@utils/helper';
import { use } from 'react';
import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';

const { Title, Text } = Typography;

// Course options dropdown component
function CourseOptions({ course, onAction }) {
  const { user } = userStore()
  const menu = (
    <Menu
      onClick={({ key }) => onAction(key, course)}
      items={[
        { key: 'materials', icon: <FileTextOutlined />, label: 'View Materials', disabled: user.role === ROLES.FACULTY || user.role === ROLES.STUDENT },
        { key: 'attendance', icon: <CalendarOutlined />, label: 'View Attendance', disabled: user.role === ROLES.MANAGER },
        // { key: 'certificate', icon: <DownloadOutlined />, label: 'Download Certificate' },
      ]}
    />
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button icon={<EllipsisOutlined />} type="text" />
    </Dropdown>
  );
}

// Course card component
function CourseCard({ course, onAction }) {
  return (
    <Card
      hoverable
      style={{
        width: '100%',
        borderRadius: 16,
        background: 'linear-gradient(to bottom right, #ffffff, #f9fafc)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.3s',
      }}
      bodyStyle={{ padding: 20 }}
      extra={<CourseOptions course={course} onAction={onAction} />}
    >
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>
          {course.course_name}
        </Title>
        <Text type="secondary">{course.code}</Text>
        <Tag color="blue" style={{ marginTop: 8, width: 'fit-content' }}>
          Completed
        </Tag>
        <Text style={{ marginTop: 8 }}>
          Enrolled on: <strong>{formatDate(course.start_date)}</strong>
        </Text>
        <Text style={{ marginTop: 8 }}>
          Completed on: <strong>{formatDate(course.end_date)}</strong>
        </Text>
      </Space>
    </Card>
  );
}

// Main page component
function ManagerCourseHistory() {
  const [loading, setLoading] = useState(false);
  const [previousCourses, setPreviousCourses] = useState([]);
  const { studentId } = useParams();
  const nav = useNavigate()
  const { user } = userStore()

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let student_id = studentId
      if (user.role === ROLES.STUDENT) {
        student_id = user._id
      }
      const response = await studentService.getCourseHistory(0, 10, { query: { user_id: student_id } });
      setPreviousCourses(response?.courseHistories || []);
    } catch (error) {
      message.error('Failed to load previous courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (actionKey, course) => {
    if (actionKey === 'materials') {
      return nav(`/manager/materials?student_id=${studentId}&course_id=${course.course_id}`);
    } else if (actionKey === 'attendance') {
      if (user.role === ROLES.STUDENT) {
        return nav(`/attendance/c/${course.course_id}`);
      } else if (user.role === ROLES.FACULTY) {
        return nav(`/faculty/attendance/${studentId}/c/${course.course_id}`);
      }
    }
  };

  return (
    <Space direction="vertical" style={{ padding: 32, width: '100%' }} size="large">
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={3} style={{ marginBottom: 0 }}>
          Previous Courses
        </Title>
        <Tooltip title="Refresh course list">
          <Button icon={<ReloadOutlined />} onClick={fetchCourses} loading={loading} />
        </Tooltip>
      </Space>

      {loading ? (
        <Spin tip="Loading previous courses..." size="large" style={{ marginTop: 40 }} />
      ) : previousCourses.length > 0 ? (
        <List
          grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
          dataSource={previousCourses}
          renderItem={(course) => (
            <List.Item>
              <CourseCard course={course} onAction={handleAction} />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description={
            <span style={{ color: '#888' }}>
              No previous courses found for this student.
            </span>
          }
          style={{ marginTop: 80 }}
        />
      )}
    </Space>
  );
}

export default ManagerCourseHistory;

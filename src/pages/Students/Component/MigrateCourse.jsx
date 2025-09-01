/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, Button, Select, Typography, Space, Flex, Card, message } from 'antd';
import { useEffect, useState } from 'react';
import courseService from '@/services/Course';
import studentService from '@/services/Student';
import { isUserActive } from '@utils/helper';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

function MigrateCourse({ student }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [prevCourses, setPrevCourses] = useState(new Map());

  useEffect(() => {
    const fetchCourses = async () => {
      if (isModalOpen) {
        try {
          setLoadingCourses(true);
          const res = await courseService.getCourses({}, 0, 0);
          const prevCoursesResponse = await studentService.getCourseHistory(0, 10, { query: { user_id: student?._id } });
          setPrevCourses(prevCoursesResponse?.courseHistories || []);
          const prevCoursesMap = new Map(prevCoursesResponse?.courseHistories?.map((c) => [c.course_id, c]));
          setPrevCourses(prevCoursesMap)

          const availableCourses = res?.courses?.filter(c => (c._id !== (student?.details_id?.course_id?._id || student?.details_id?.course_id))) || [];
          setCourses(availableCourses);
        } catch (err) {
          console.error(err);
          message.error('Failed to load courses');
        } finally {
          setLoadingCourses(false);
        }
      }
    };
    fetchCourses();
  }, [isModalOpen, student.course_id]);

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleMigration = (migrateSlots) => {
    if (!selectedCourse) {
      message.warning('Please select a new course');
      return;
    }

    Modal.confirm({
      title: 'Are you sure?',
      content: `This will ${migrateSlots ? 'migrate existing slots' : 'delete all existing slots'} and assign the new course. Materials and sessions will be affected.`,
      okText: migrateSlots ? 'Migrate Slots' : 'Delete All Slots',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          setProcessing(true);
          await studentService.migrateStudentCourse(student._id, student?.details_id?._id, selectedCourse, migrateSlots);
          message.success('Course updated successfully');
          handleCancel();
        } catch (error) {
          console.error(error);
          message.error('Failed to migrate course');
        } finally {
          setProcessing(false);
        }
      }
    });
  };
  console.log(prevCourses);

  return (
    <>
      {/* Button to open Migrate Course Modal */}
      <Button onClick={() => setIsModalOpen(true)} disabled={!isUserActive(student)} variant='filled' color='purple'>
        Migrate Course
      </Button>

      {/* Migrate Course Modal */}
      <Modal
        title={<Title level={4}>Migrate Course</Title>}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Space direction="vertical" size="small">
              <div>
                <Text strong>Student: </Text>
                <Text>{student.username}</Text>
              </div>
              <div>
                <Text strong>Current Course: </Text>
                <Text>{student.details_id?.course?.course_name || 'N/A'}</Text>
              </div>
            </Space>
          </Card>

          <Flex gap={10} wrap="wrap">
            <Select
              style={{ minWidth: 250 }}
              placeholder="Select New Course"
              value={selectedCourse}
              onChange={(value) => setSelectedCourse(value)}
              loading={loadingCourses}
              options={courses.map(course => ({
                label: course.course_name,
                value: course._id,
                disabled: !!prevCourses.get(course._id)
              }))}
            />
          </Flex>

          <Flex justify="end" gap={10} wrap="wrap">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              danger
              onClick={() => handleMigration(false)}
              loading={processing}
              disabled={!selectedCourse || processing}
            >
              Migrate And Delete All Slots
            </Button>
            <Button
              type="primary"
              onClick={() => handleMigration(true)}
              loading={processing}
              disabled={!selectedCourse || processing}
            >
              Migrate Slots
            </Button>
          </Flex>
        </Space>
      </Modal>
    </>
  );
}

MigrateCourse.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
    course_id: PropTypes.string,
    details_id: PropTypes.shape({
      _id: PropTypes.string,
      course_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string,
        }),
      ]),
      course: PropTypes.shape({
        course_name: PropTypes.string,
      }),
    }),
  }).isRequired,
};

export default MigrateCourse;

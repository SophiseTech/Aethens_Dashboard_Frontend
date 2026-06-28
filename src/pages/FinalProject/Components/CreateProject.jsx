import { ClockCircleOutlined, PlusOutlined, ProjectOutlined, UserOutlined } from '@ant-design/icons';
import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import useCourse from '@hooks/useCourse';
import { useFinalProject } from '@hooks/useFinalProject';
import useSearchableStudents from '@hooks/useSearchableStudents';
import useStudents from '@hooks/useStudents';
import useUser from '@hooks/useUser';
import { Avatar, Card, Col, Empty, Form, message, Row, Space, Spin } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react'

function CreateProject() {
  const [form] = Form.useForm();
  // const { getStudentsByCenter, loading: studentListLoading, } = useStudents()
  const { courseOptions, getCourses, loading: courseLoading } = useCourse()
  const { createProject, createLoading } = useFinalProject()
  const { user } = useUser()
  const { searchStudents, students, loading: studentListLoading } = useSearchableStudents()

  useEffect(() => {
    searchStudents(0, 15, { searchQuery: '' });
    getCourses(0)
  }, [])


  const handleSubmit = async (values) => {
    try {
      // Add your API call here to create the project
      console.log('Creating project with values:', values);
      values.facultyId = user._id
      await createProject(values)
      message.success('Project created successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to create project');
    }
  };

  const handleDebouncedStudentSearch = useCallback(
    debounce((searchQuery) => {
      try {
        console.log(searchQuery);
        searchStudents(0, 15, { searchQuery });
      } catch (error) {
        console.error(error);
      }
    }, 300),
    []
  );

  const studentOptions = useMemo(() => students?.map(item => ({ label: item.username, value: item._id })), [students])

  return (
    <Card
      title={
        <Space>
          <PlusOutlined />
          <span>Create New Project</span>
        </Space>
      }
      className="mb-6"
    >
      <CustomForm form={form} action={handleSubmit}>
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <CustomSelect name={'studentId'} label={'Select Student'} options={studentListLoading ? [] : (studentOptions || [])}
              onSearch={handleDebouncedStudentSearch}
              loading={studentListLoading}
              notFoundContent={
                studentListLoading ? <Spin size="small" /> : <Empty />
              }
              optionRender={(option) => (
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  {option.label}
                </Space>
              )}
            />
          </Col>

          <Col xs={24} md={12}>
            <CustomSelect name={'courseId'} label={'Select Course'} options={courseOptions || []} />
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <CustomInput name={'title'} label={'Project Title'} required inputProps={{ prefix: <ProjectOutlined /> }} />
          </Col>

          <Col xs={24} md={12}>
            <CustomDatePicker name={"endDate"} required={false} inputProps={{ suffixIcon: <ClockCircleOutlined /> }} label={'Deadline'} className='w-full' />
          </Col>

          <CustomInput name={'description'} label={'Project Details'} required={false} />

          <CustomSubmit disabled={courseLoading || studentListLoading || createLoading} loading={createLoading} />
        </Row>
      </CustomForm>
    </Card>
  );
}

export default CreateProject
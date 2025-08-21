import { ClockCircleOutlined, PlusOutlined, ProjectOutlined, UserOutlined } from '@ant-design/icons';
import CustomDatePicker from '@components/form/CustomDatePicker';
import CustomForm from '@components/form/CustomForm';
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import useCourse from '@hooks/useCourse';
import { useFinalProject } from '@hooks/useFinalProject';
import useStudents from '@hooks/useStudents';
import useUser from '@hooks/useUser';
import { Avatar, Card, Col, Form, message, Row, Space } from 'antd';
import React, { useEffect } from 'react'

function CreateProject() {
  const [form] = Form.useForm();
  const { getStudentsByCenter, studentOptions, loading: studentListLoading, } = useStudents()
  const { courseOptions, getCourses, loading: courseLoading } = useCourse()
  const { createProject, createLoading } = useFinalProject()
  const { user } = useUser()

  useEffect(() => {
    getStudentsByCenter(0)
    getCourses()
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
            <CustomSelect name={'studentId'} label={'Select Student'} options={studentOptions || []}
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
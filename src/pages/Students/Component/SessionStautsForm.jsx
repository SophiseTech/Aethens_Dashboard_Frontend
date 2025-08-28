import CustomCheckbox from '@components/form/CustomCheckBox';
import CustomForm from '@components/form/CustomForm'
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import courseStore from '@stores/CourseStore';
import facultyRemarksStore from '@stores/FacultyRemarksStore';
import facultyStore from '@stores/FacultyStore';
import userStore from '@stores/UserStore';
import { Flex, Form } from 'antd';
import React, { useEffect, useState } from 'react'
import { useStore } from 'zustand';

function SessionStautsForm({ handleOk, student }) {
  const [form] = Form.useForm();
  const { createFacultyRemark, createLoading } = useStore(facultyRemarksStore)
  const { getCourse, course } = useStore(courseStore)
  const { getFacultiesByCenter, faculties, total } = useStore(facultyStore)

  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);
  const { user } = useStore(userStore)

  useEffect(() => {
    if (student?.details_id?.course_id) {
      getCourse(student.details_id.course_id)
    }
    // if (!faculties || total === 0 || faculties.length < total) {
    //   getFacultiesByCenter(0)
    // }
  }, [])

  const onSubmit = async (values) => {
    // const faculty = faculties?.find(faculty => faculty.username === values.faculty_id)
    values.faculty_id = user._id
    values.student_id = student._id
    values.course_id = student.details_id.course_id
    if (values.isTopicComplete) {
      values.completedOn = new Date()
    }
    createFacultyRemark(values)
    // handleOk()
  }

  const initialValues = {
    module: "",
    unit: "",
    topic: "",
    faculty_id: "",
    remarks: "",
    isTopicComplete: false
  }

  // Extract module names as options
  const moduleOptions = course?.modules?.map(module => ({
    label: module.name,
    value: module.name,
  })) || [];

  const facultyOptions = faculties?.map(faculty => ({
    label: faculty.username,
    value: faculty.username,
  })) || []

  // Handle module change
  const handleModuleChange = (moduleName) => {
    setSelectedModule(moduleName);
    setSelectedUnit(null); // Reset unit selection
    setTopics([]); // Reset topics

    const selectedModuleData = course.modules?.find(m => m.name === moduleName);
    if (selectedModuleData) {
      setUnits(selectedModuleData.units.map(unit => ({
        label: unit.name,
        value: unit.name,
      })));
    } else {
      setUnits([]);
    }
  };

  // Handle unit change
  const handleUnitChange = (unitName) => {
    setSelectedUnit(unitName);

    const selectedModuleData = course.modules?.find(m => m.name === selectedModule);
    if (!selectedModuleData) return;

    const selectedUnitData = selectedModuleData.units.find(u => u.name === unitName);
    if (selectedUnitData) {
      setTopics(selectedUnitData.topics.map(topic => ({
        label: topic,
        value: topic,
      })));
    } else {
      setTopics([]);
    }
  };


  return (
    <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
      <Flex gap={5}>
        <CustomSelect label={"Select Module"} name={"module"} options={moduleOptions} onChange={handleModuleChange} />
        <CustomSelect label={"Select Unit"} name={"unit"} options={units} required={false} onChange={handleUnitChange} />
        <CustomSelect label={"Select Topic"} name={"topic"} options={topics} required={false} />
        {/* <CustomSelect label={"Select Faculty"} name={"faculty_id"} options={facultyOptions} /> */}
      </Flex>
      <CustomInput label={"Remarks"} name={"remarks"} placeholder={"Any remarks regarding the student..."} type='textarea' required={false} />
      <CustomCheckbox label={"Is the topic completed?"} name={"isTopicComplete"} />
      <CustomSubmit className='bg-primary' label='Submit' loading={createLoading} />

    </CustomForm>
  )
}

export default SessionStautsForm
import CustomCheckbox from '@components/form/CustomCheckBox';
import CustomForm from '@components/form/CustomForm'
import CustomInput from '@components/form/CustomInput';
import CustomSelect from '@components/form/CustomSelect';
import CustomSubmit from '@components/form/CustomSubmit';
import diplomaCourseService from '@services/DiplomaCourse';
import facultyRemarksStore from '@stores/FacultyRemarksStore';
import userStore from '@stores/UserStore';
import { Flex, Form, Spin } from 'antd';
import React, { useEffect, useState } from 'react'
import { useStore } from 'zustand';

function DiplomaSessionStatusForm({ handleOk, student, diplomaCourseId }) {
  const [form] = Form.useForm();
  const { createFacultyRemark, createLoading } = useStore(facultyRemarksStore)
  const { user } = useStore(userStore)

  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (!diplomaCourseId) {
      setCourseLoading(false);
      return;
    }
    setCourseLoading(true);
    diplomaCourseService.getById(diplomaCourseId)
      .then(setCourse)
      .finally(() => setCourseLoading(false));
  }, [diplomaCourseId])

  if (courseLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spin tip="Loading course..." />
      </div>
    );
  }

  const onSubmit = async (values) => {
    values.faculty_id = user._id
    values.student_id = student._id
    values.diplomaCourse_id = diplomaCourseId
    if (values.isTopicComplete) {
      values.completedOn = new Date()
    }
    createFacultyRemark(values)
    handleOk?.()
  }

  const initialValues = {
    term: undefined,
    subject: "",
    module: "",
    unit: "",
    topic: "",
    remarks: "",
    isTopicComplete: false
  }

  const termOptions = course?.terms?.map(term => ({
    label: `Term ${term.termNumber}`,
    value: term.termNumber,
  })) || [];

  const handleTermChange = (termNumber) => {
    setSelectedTerm(termNumber);
    setSelectedSubject(null);
    setSelectedModule(null);
    setSelectedUnit(null);
    setModuleOptions([]);
    setUnits([]);
    setTopics([]);
    form.setFieldsValue({ subject: undefined, module: undefined, unit: undefined, topic: undefined });

    const termData = course?.terms?.find(t => t.termNumber === termNumber);
    setSubjectOptions((termData?.subjects || []).map(subject => ({
      label: subject.name,
      value: subject.name,
    })));
  };

  const handleSubjectChange = (subjectName) => {
    setSelectedSubject(subjectName);
    setSelectedModule(null);
    setSelectedUnit(null);
    setUnits([]);
    setTopics([]);
    form.setFieldsValue({ module: undefined, unit: undefined, topic: undefined });

    const termData = course?.terms?.find(t => t.termNumber === selectedTerm);
    const subjectData = termData?.subjects?.find(s => s.name === subjectName);
    setModuleOptions((subjectData?.modules || []).map(module => ({
      label: module.name,
      value: module.name,
    })));
  };

  const handleModuleChange = (moduleName) => {
    setSelectedModule(moduleName);
    setSelectedUnit(null);
    setTopics([]);

    const termData = course?.terms?.find(t => t.termNumber === selectedTerm);
    const subjectData = termData?.subjects?.find(s => s.name === selectedSubject);
    const selectedModuleData = subjectData?.modules?.find(m => m.name === moduleName);
    if (selectedModuleData) {
      setUnits(selectedModuleData.units.map(unit => ({
        label: unit.name,
        value: unit.name,
      })));
    } else {
      setUnits([]);
    }
  };

  const handleUnitChange = (unitName) => {
    setSelectedUnit(unitName);

    const termData = course?.terms?.find(t => t.termNumber === selectedTerm);
    const subjectData = termData?.subjects?.find(s => s.name === selectedSubject);
    const selectedModuleData = subjectData?.modules?.find(m => m.name === selectedModule);
    if (!selectedModuleData) return;

    const selectedUnitData = selectedModuleData.units.find(u => u.name === unitName);
    if (selectedUnitData) {
      setTopics(selectedUnitData.topics.map(topic => ({
        label: topic.name || "No Topic",
        value: topic.name || "No Topic",
      })));
    } else {
      setTopics([]);
    }
  };

  return (
    <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
      <Flex gap={5}>
        <CustomSelect label={"Select Term"} name={"term"} options={termOptions} onChange={handleTermChange} />
        <CustomSelect label={"Select Subject"} name={"subject"} options={subjectOptions} onChange={handleSubjectChange} disabled={!selectedTerm} />
      </Flex>
      <Flex gap={5}>
        <CustomSelect label={"Select Module"} name={"module"} options={moduleOptions} onChange={handleModuleChange} disabled={!selectedSubject} />
        <CustomSelect label={"Select Unit"} name={"unit"} options={units} required={false} onChange={handleUnitChange} disabled={!selectedModule} />
        <CustomSelect label={"Select Topic"} name={"topic"} options={topics} required={false} disabled={!selectedUnit} />
      </Flex>
      <CustomInput label={"Remarks"} name={"remarks"} placeholder={"Any remarks regarding the student..."} type='textarea' required={false} />
      <CustomCheckbox label={"Is the topic completed?"} name={"isTopicComplete"} />
      <CustomSubmit className='bg-primary' label='Submit' loading={createLoading} />
    </CustomForm>
  )
}

export default DiplomaSessionStatusForm

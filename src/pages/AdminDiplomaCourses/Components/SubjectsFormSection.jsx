import { Button, Card, Collapse, Input, Space, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import ModulesFormSection from '@pages/AdminCourses/Components/ModulesFormSection';

const { Text } = Typography;
const { Panel } = Collapse;

/**
 * Diploma courses have one extra nesting level over short-term courses:
 * subjects -> modules -> units -> topics. Reuses ModulesFormSection per-subject
 * so the modules/units/topics editing UX stays identical between course types.
 */
function SubjectsFormSection({ value = [], onChange }) {
    const subjects = value || [];

    const handleAddSubject = () => {
        onChange([...subjects, { name: '', modules: [] }]);
    };

    const handleRemoveSubject = (subjectIndex) => {
        onChange(subjects.filter((_, i) => i !== subjectIndex));
    };

    const handleSubjectNameChange = (subjectIndex, name) => {
        const newSubjects = [...subjects];
        newSubjects[subjectIndex] = { ...newSubjects[subjectIndex], name };
        onChange(newSubjects);
    };

    const handleModulesChange = (subjectIndex, modules) => {
        const newSubjects = [...subjects];
        newSubjects[subjectIndex] = { ...newSubjects[subjectIndex], modules };
        onChange(newSubjects);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <Text strong>Subjects</Text>
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddSubject} size="small">
                    Add Subject
                </Button>
            </div>

            {subjects.length === 0 ? (
                <Card size="small">
                    <Text type="secondary">No subjects added yet. Click "Add Subject" to begin.</Text>
                </Card>
            ) : (
                <Collapse accordion>
                    {subjects.map((subject, subjectIndex) => (
                        <Panel
                            header={
                                <div className="flex justify-between items-center">
                                    <span>{subject.name || `Subject ${subjectIndex + 1}`}</span>
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveSubject(subjectIndex);
                                        }}
                                    />
                                </div>
                            }
                            key={subjectIndex}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Input
                                    placeholder="Subject Name"
                                    value={subject.name}
                                    onChange={(e) => handleSubjectNameChange(subjectIndex, e.target.value)}
                                />
                                <ModulesFormSection
                                    value={subject.modules}
                                    onChange={(modules) => handleModulesChange(subjectIndex, modules)}
                                />
                            </Space>
                        </Panel>
                    ))}
                </Collapse>
            )}
        </div>
    );
}

export default SubjectsFormSection;

import { Button, Card, Checkbox, Form, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

/**
 * ProjectPhasesFormSection — a Form.List-powered dynamic form section
 * for adding/removing final project phases within the course modal.
 *
 * Each phase has: title (required), description (optional), requiresSubject (checkbox).
 * phaseNumber is auto-derived from index.
 */
function ProjectPhasesFormSection({ value = [], onChange }) {
    return (
        <Form.List name="projectPhases">
            {(fields, { add, remove }) => (
                <div className="flex flex-col gap-3">
                    {fields.map(({ key, name, ...restField }, index) => (
                        <Card
                            key={key}
                            size="small"
                            title={`Phase ${index + 1}`}
                            extra={
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(name)}
                                    size="small"
                                />
                            }
                            style={{ borderColor: '#d9d9d9' }}
                        >
                            <Form.Item
                                {...restField}
                                name={[name, 'title']}
                                rules={[{ required: true, message: 'Phase title is required' }]}
                                style={{ marginBottom: 8 }}
                            >
                                <Input placeholder="Phase title (e.g. Concept Sketch)" />
                            </Form.Item>

                            <Form.Item
                                {...restField}
                                name={[name, 'description']}
                                style={{ marginBottom: 8 }}
                            >
                                <TextArea
                                    placeholder="Phase description (optional)"
                                    rows={2}
                                    autoSize={{ minRows: 1, maxRows: 4 }}
                                />
                            </Form.Item>

                            <Form.Item
                                {...restField}
                                name={[name, 'requiresSubject']}
                                valuePropName="checked"
                                style={{ marginBottom: 0 }}
                            >
                                <Checkbox>Requires Subject</Checkbox>
                            </Form.Item>
                        </Card>
                    ))}

                    <Button
                        type="dashed"
                        onClick={() => add({ title: '', description: '', requiresSubject: false })}
                        icon={<PlusOutlined />}
                        block
                    >
                        Add Phase
                    </Button>
                </div>
            )}
        </Form.List>
    );
}

export default ProjectPhasesFormSection;

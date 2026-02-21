import { useState } from 'react';
import { Card, Button, Input, InputNumber, Space, Typography, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

/**
 * Component for managing course modules structure
 * Handles nested modules -> units -> topics (each topic has name + sessionsRequired)
 */
function ModulesFormSection({ value = [], onChange }) {
    const modules = value || [];

    const handleAddModule = () => {
        onChange([...modules, { name: '', units: [] }]);
    };

    const handleRemoveModule = (moduleIndex) => {
        const newModules = modules.filter((_, i) => i !== moduleIndex);
        onChange(newModules);
    };

    const handleModuleNameChange = (moduleIndex, name) => {
        const newModules = [...modules];
        newModules[moduleIndex].name = name;
        onChange(newModules);
    };

    const handleAddUnit = (moduleIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].units.push({ name: '', topics: [] });
        onChange(newModules);
    };

    const handleRemoveUnit = (moduleIndex, unitIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].units = newModules[moduleIndex].units.filter((_, i) => i !== unitIndex);
        onChange(newModules);
    };

    const handleUnitNameChange = (moduleIndex, unitIndex, name) => {
        const newModules = [...modules];
        newModules[moduleIndex].units[unitIndex].name = name;
        onChange(newModules);
    };

    const handleAddTopic = (moduleIndex, unitIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].units[unitIndex].topics.push({ name: '', sessionsRequired: 0 });
        onChange(newModules);
    };

    const handleRemoveTopic = (moduleIndex, unitIndex, topicIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].units[unitIndex].topics =
            newModules[moduleIndex].units[unitIndex].topics.filter((_, i) => i !== topicIndex);
        onChange(newModules);
    };

    const handleTopicFieldChange = (moduleIndex, unitIndex, topicIndex, field, val) => {
        const newModules = [...modules];
        const topic = newModules[moduleIndex].units[unitIndex].topics[topicIndex];
        // Handle backward-compat: topic may still be a plain string from old data
        if (typeof topic === 'string') {
            newModules[moduleIndex].units[unitIndex].topics[topicIndex] =
                field === 'name' ? { name: val, sessionsRequired: 0 } : { name: topic, sessionsRequired: val };
        } else {
            newModules[moduleIndex].units[unitIndex].topics[topicIndex] = { ...topic, [field]: val };
        }
        onChange(newModules);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <Text strong>Modules</Text>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddModule}
                    size="small"
                >
                    Add Module
                </Button>
            </div>

            {modules.length === 0 ? (
                <Card size="small">
                    <Text type="secondary">No modules added yet. Click "Add Module" to begin.</Text>
                </Card>
            ) : (
                <Collapse accordion>
                    {modules.map((module, moduleIndex) => (
                        <Panel
                            header={
                                <div className="flex justify-between items-center">
                                    <span>{module.name || `Module ${moduleIndex + 1}`}</span>
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveModule(moduleIndex);
                                        }}
                                    />
                                </div>
                            }
                            key={moduleIndex}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Input
                                    placeholder="Module Name"
                                    value={module.name}
                                    onChange={(e) => handleModuleNameChange(moduleIndex, e.target.value)}
                                />

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Text strong>Units</Text>
                                        <Button
                                            type="dashed"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleAddUnit(moduleIndex)}
                                        >
                                            Add Unit
                                        </Button>
                                    </div>

                                    {module.units && module.units.length > 0 ? (
                                        module.units.map((unit, unitIndex) => (
                                            <Card
                                                key={unitIndex}
                                                size="small"
                                                className="mb-2"
                                                extra={
                                                    <MinusCircleOutlined
                                                        className="text-red-500"
                                                        onClick={() => handleRemoveUnit(moduleIndex, unitIndex)}
                                                    />
                                                }
                                            >
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    <Input
                                                        placeholder="Unit Name"
                                                        value={unit.name}
                                                        onChange={(e) =>
                                                            handleUnitNameChange(moduleIndex, unitIndex, e.target.value)
                                                        }
                                                    />

                                                    {/* Topics list */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <Text className="text-xs" type="secondary">Topics</Text>
                                                            <Button
                                                                type="dashed"
                                                                size="small"
                                                                icon={<PlusOutlined />}
                                                                onClick={() => handleAddTopic(moduleIndex, unitIndex)}
                                                            >
                                                                Add Topic
                                                            </Button>
                                                        </div>

                                                        {unit.topics && unit.topics.length > 0 ? (
                                                            unit.topics.map((topic, topicIndex) => {
                                                                const topicName = typeof topic === 'string' ? topic : topic.name || '';
                                                                const topicSessions = typeof topic === 'string' ? 0 : topic.sessionsRequired || 0;
                                                                return (
                                                                    <div key={topicIndex} className="flex gap-2 items-center mb-1">
                                                                        <Input
                                                                            placeholder="Topic name"
                                                                            value={topicName}
                                                                            size="small"
                                                                            style={{ flex: 1 }}
                                                                            onChange={(e) =>
                                                                                handleTopicFieldChange(moduleIndex, unitIndex, topicIndex, 'name', e.target.value)
                                                                            }
                                                                        />
                                                                        <InputNumber
                                                                            placeholder="Sessions"
                                                                            min={0}
                                                                            value={topicSessions}
                                                                            size="small"
                                                                            style={{ width: 90 }}
                                                                            addonAfter="sess."
                                                                            onChange={(val) =>
                                                                                handleTopicFieldChange(moduleIndex, unitIndex, topicIndex, 'sessionsRequired', val || 0)
                                                                            }
                                                                        />
                                                                        <MinusCircleOutlined
                                                                            className="text-red-400"
                                                                            onClick={() => handleRemoveTopic(moduleIndex, unitIndex, topicIndex)}
                                                                        />
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <Text type="secondary" className="text-xs">
                                                                No topics added yet
                                                            </Text>
                                                        )}
                                                    </div>
                                                </Space>
                                            </Card>
                                        ))
                                    ) : (
                                        <Text type="secondary" className="text-xs">
                                            No units added yet
                                        </Text>
                                    )}
                                </div>
                            </Space>
                        </Panel>
                    ))}
                </Collapse>
            )}
        </div>
    );
}

export default ModulesFormSection;

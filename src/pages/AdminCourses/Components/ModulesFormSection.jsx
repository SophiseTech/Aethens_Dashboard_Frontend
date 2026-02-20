import { useState } from 'react';
import { Card, Button, Input, Space, Typography, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

/**
 * Component for managing course modules structure
 * Handles nested modules -> units -> topics
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

    const handleTopicChange = (moduleIndex, unitIndex, topicValue) => {
        const newModules = [...modules];
        // Store as string directly to avoid issues with typing
        // Convert to array only when submitting the form
        newModules[moduleIndex].units[unitIndex].topics = topicValue;
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
                                                    <Input.TextArea
                                                        placeholder="Topics (comma-separated)"
                                                        value={
                                                            Array.isArray(unit.topics)
                                                                ? unit.topics.join(', ')
                                                                : unit.topics || ''
                                                        }
                                                        onChange={(e) =>
                                                            handleTopicChange(moduleIndex, unitIndex, e.target.value)
                                                        }
                                                        rows={2}
                                                    />
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

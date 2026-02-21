import { useState, useEffect } from 'react';
import {
    Drawer,
    Card,
    Typography,
    Row,
    Col,
    Divider,
    Button,
    Tag,
    Modal,
    message,
    Collapse,
    List,
    Spin,
    Image,
    Empty,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    BookOutlined,
    FileImageOutlined,
    ToolOutlined,
} from '@ant-design/icons';
import courseStore from '@stores/CourseStore';
import inventoryService from '@services/Inventory';
import EditCourseModal from './EditCourseModal';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;
const { Panel } = Collapse;

const CourseDetailsDrawer = ({ course, visible, onClose, onRefresh }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [materialItems, setMaterialItems] = useState([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const { deleteCourse, loading } = courseStore();
    console.log(course);

    // useEffect(() => {
    //     if (visible && course?.defaultMaterialItems?.length > 0) {
    //         fetchMaterialItems();
    //     }
    // }, [visible, course]);

    const fetchMaterialItems = async () => {
        try {
            setLoadingMaterials(true);
            // Fetch all inventory items and filter by IDs
            const response = await inventoryService.getInventoryItems(0, 1000);
            if (response?.items) {
                const filtered = response.items.filter(item =>
                    course.defaultMaterialItems.includes(item._id)
                );
                setMaterialItems(filtered);
            }
        } catch (error) {
            console.error('Error fetching material items:', error);
        } finally {
            setLoadingMaterials(false);
        }
    };

    const handleEditClick = () => setIsEditModalVisible(true);

    const handleDeleteClick = () => {
        confirm({
            title: 'Are you sure you want to delete this course?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteCourse(course._id);
                    message.success('Course deleted successfully');
                    onClose();
                    onRefresh();
                } catch (error) {
                    console.error('Error deleting course:', error);
                }
            },
        });
    };

    const handleEditSave = () => {
        setIsEditModalVisible(false);
        onRefresh();
    };

    if (!course) return null;

    return (
        <>
            <Drawer
                title="Course Details"
                placement="right"
                open={visible}
                onClose={onClose}
                width={620}
                headerStyle={{ background: '#f0f2f5' }}
                bodyStyle={{ padding: 20 }}
                extra={
                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEditClick}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="solid"
                            color="danger"
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteClick}
                            loading={loading}
                        >
                            Delete
                        </Button>
                    </div>
                }
            >
                {/* Course Header */}
                <Card bordered={false} style={{ background: '#fafafa' }}>
                    <Title level={3} style={{ marginBottom: 8 }}>
                        {course.course_name}
                    </Title>
                    <div className="flex gap-2 items-center">
                        <Tag color={course.syllabusType === 'custom' ? 'purple' : 'blue'}>
                            {course.syllabusType || 'general'} syllabus
                        </Tag>
                        {course.createdAt && (
                            <Text type="secondary" className="text-xs">
                                Created: {new Date(course.createdAt).toLocaleDateString()}
                            </Text>
                        )}
                    </div>
                </Card>

                <Divider />

                {/* Basic Information */}
                <Card bordered={false}>
                    <Title level={5}>
                        <BookOutlined /> Basic Information
                    </Title>
                    <Row gutter={[16, 12]}>
                        <Col span={12}>
                            <Text strong>Duration:</Text>
                            <br />
                            <Text>
                                {course.duration
                                    ? `${course.duration.count} ${course.duration.type}${course.duration.count > 1 ? 's' : ''
                                    }`
                                    : 'N/A'}
                            </Text>
                        </Col>

                        <Col span={12}>
                            <Text strong>Rate:</Text>
                            <br />
                            <Text>{course.rate ? `₹${course.rate.toLocaleString()}` : 'N/A'}</Text>
                        </Col>

                        <Col span={12}>
                            <Text strong>Total Sessions:</Text>
                            <br />
                            <Text>{course.total_session || 'N/A'}</Text>
                        </Col>

                        <Col span={12}>
                            <Text strong>Total Days:</Text>
                            <br />
                            <Text>
                                {course.duration?.type === 'month'
                                    ? course.duration.count * 30
                                    : course.duration?.count || 'N/A'}
                            </Text>
                        </Col>
                    </Row>
                </Card>

                {/* Modules - For General Type */}
                {(!course.syllabusType || course.syllabusType === 'general') &&
                    course.modules &&
                    course.modules.length > 0 && (
                        <>
                            <Divider />
                            <Card bordered={false}>
                                <Title level={5}>
                                    <BookOutlined /> Modules ({course.modules.length})
                                </Title>
                                <Collapse accordion>
                                    {course.modules.map((module, moduleIndex) => (
                                        <Panel
                                            header={
                                                <div>
                                                    <Text strong>{module.name}</Text>
                                                    <br />
                                                    <Text type="secondary" className="text-xs">
                                                        {module.units?.length || 0} unit
                                                        {module.units?.length !== 1 ? 's' : ''}
                                                    </Text>
                                                </div>
                                            }
                                            key={moduleIndex}
                                        >
                                            {module.units && module.units.length > 0 ? (
                                                <List
                                                    dataSource={module.units}
                                                    renderItem={(unit, unitIndex) => (
                                                        <List.Item key={unitIndex}>
                                                            <div style={{ width: '100%' }}>
                                                                <Text strong>{unit.name}</Text>
                                                                {unit.topics &&
                                                                    unit.topics.length > 0 && (
                                                                        <div className="mt-2">
                                                                            <Text
                                                                                type="secondary"
                                                                                className="text-xs"
                                                                            >
                                                                                Topics:
                                                                            </Text>
                                                                            <ul
                                                                                style={{
                                                                                    marginTop: 4,
                                                                                    paddingLeft: 20,
                                                                                }}
                                                                            >
                                                                                {(Array.isArray(
                                                                                    unit.topics
                                                                                )
                                                                                    ? unit.topics
                                                                                    : unit.topics
                                                                                        .split(',')
                                                                                        .map((t) =>
                                                                                            t.trim()
                                                                                        )
                                                                                ).map(
                                                                                    (
                                                                                        topic,
                                                                                        topicIndex
                                                                                    ) => (
                                                                                        <li
                                                                                            key={
                                                                                                topicIndex
                                                                                            }
                                                                                        >
                                                                                            <Text>
                                                                                                {typeof topic === 'string' ? topic : topic.name}
                                                                                            </Text>
                                                                                            {typeof topic === 'object' && topic.sessionsRequired > 0 && (
                                                                                                <Text type="secondary" className="text-xs ml-2">
                                                                                                    ({topic.sessionsRequired} sess.)
                                                                                                </Text>
                                                                                            )}
                                                                                        </li>
                                                                                    )
                                                                                )}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </List.Item>
                                                    )}
                                                />
                                            ) : (
                                                <Empty
                                                    description="No units defined"
                                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                />
                                            )}
                                        </Panel>
                                    ))}
                                </Collapse>
                            </Card>
                        </>
                    )}

                {/* Syllabus Images - For Custom Type */}
                {course.syllabusType === 'custom' &&
                    course.images &&
                    course.images.length > 0 && (
                        <>
                            <Divider />
                            <Card bordered={false}>
                                <Title level={5}>
                                    <FileImageOutlined /> Syllabus Images ({course.images.length})
                                </Title>
                                <List
                                    dataSource={course.images}
                                    renderItem={(image, index) => (
                                        <List.Item key={image._id || index}>
                                            <Card size="small" style={{ width: '100%' }}>
                                                <div className="flex gap-3 items-center">
                                                    <Image
                                                        src={image.url}
                                                        alt={image.name}
                                                        width={60}
                                                        height={60}
                                                        style={{ objectFit: 'cover' }}
                                                        preview
                                                    />
                                                    <div className="flex-1">
                                                        <Text strong>{image.name}</Text>
                                                        <br />
                                                        {image.sessionsRequired > 0 && (
                                                            <Text
                                                                type="secondary"
                                                                className="text-xs"
                                                            >
                                                                Sessions Required:{' '}
                                                                {image.sessionsRequired}
                                                            </Text>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </>
                    )}

                {/* Default Materials */}
                {course.defaultMaterialItems && course.defaultMaterialItems.length > 0 && (
                    <>
                        <Divider />
                        <Card bordered={false}>
                            <Title level={5}>
                                <ToolOutlined /> Default Materials (
                                {course.defaultMaterialItems.length})
                            </Title>
                            {loadingMaterials ? (
                                <div className="flex justify-center py-4">
                                    <Spin tip="Loading materials..." />
                                </div>
                            ) : course.defaultMaterialItems.length > 0 ? (
                                <List
                                    dataSource={course.defaultMaterialItems}
                                    renderItem={(item) => (
                                        <List.Item key={item._id}>
                                            <Text>{item.name}</Text>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Text type="secondary">
                                    {course.defaultMaterialItems.length} material item
                                    {course.defaultMaterialItems.length > 1 ? 's' : ''} configured
                                </Text>
                            )}
                        </Card>
                    </>
                )}
            </Drawer>

            {/* Edit Modal */}
            <EditCourseModal
                course={course}
                visible={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                onSave={handleEditSave}
            />
        </>
    );
};

export default CourseDetailsDrawer;

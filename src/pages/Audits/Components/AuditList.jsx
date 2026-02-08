import { Table, Tag, Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import inventoryAuditStore from '@stores/InventoryAuditStore';
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { ROLES } from '@utils/constants';
import dayjs from 'dayjs';


function AuditList({ onViewDetails, onConductAudit }) {
    const { audits, loading, deleteAudit } = inventoryAuditStore();
    const { user } = userStore();

    const canDelete = permissions.audits.delete.includes(user?.role);
    const canViewDiscrepancy = permissions.audits.view_discrepancy.includes(user?.role);

    const handleDelete = async (id) => {
        await deleteAudit(id);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'default',
            'in-progress': 'processing',
            completed: 'success',
            approved: 'cyan',
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Audit Date',
            dataIndex: 'audit_date',
            key: 'audit_date',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Auditor',
            dataIndex: ['auditor_id', 'username'],
            key: 'auditor',
            render: (username) => username || 'N/A',
        },
        {
            title: 'Center',
            dataIndex: ['center_id', 'name'],
            key: 'center',
            render: (name) => name || 'N/A',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>,
        },
        {
            title: 'Items Count',
            dataIndex: 'items',
            key: 'items_count',
            render: (items) => items?.length || 0,
        },
        ...(canViewDiscrepancy
            ? [
                {
                    title: 'Total Discrepancy',
                    key: 'total_discrepancy',
                    render: (_, record) => {
                        const total = record.items?.reduce((sum, item) => sum + (item.discrepancy || 0), 0) || 0;
                        return <span className={total !== 0 ? 'text-red-500 font-semibold' : ''}>{total}</span>;
                    },
                },
            ]
            : []),
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {user.role === ROLES.ADMIN ? (
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => onViewDetails(record)}
                            size="small"
                        >
                            View
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => onConductAudit(record)}
                            size="small"
                            disabled={record.status === 'approved'}
                        >
                            Conduct
                        </Button>
                    )}
                    {canDelete && (
                        <Popconfirm
                            title="Delete this audit?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="link" danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={audits}
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            size="small"
        />
    );
}

export default AuditList;

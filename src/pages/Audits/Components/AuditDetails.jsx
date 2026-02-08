import { Drawer, Descriptions, Table, Tag, Divider } from 'antd';
import dayjs from 'dayjs';


function AuditDetails({ open, audit, onClose }) {
    if (!audit) return null;

    const columns = [
        {
            title: 'Item',
            dataIndex: ['item_id', 'name'],
            key: 'item',
        },
        {
            title: 'System Qty',
            dataIndex: 'system_quantity',
            key: 'system_qty',
        },
        {
            title: 'Audited Qty',
            dataIndex: 'audited_quantity',
            key: 'audited_qty',
            render: (qty) => qty ?? 'Pending',
        },
        {
            title: 'Discrepancy',
            dataIndex: 'discrepancy',
            key: 'discrepancy',
            render: (value) => (
                <span className={value !== 0 ? 'text-red-500 font-semibold' : 'text-green-500'}>
                    {value > 0 ? `+${value}` : value}
                </span>
            ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            ellipsis: true,
        },
    ];

    const getStatusColor = (status) => {
        const colors = {
            pending: 'default',
            'in-progress': 'processing',
            completed: 'success',
            approved: 'cyan',
        };
        return colors[status] || 'default';
    };

    return (
        <Drawer title="Audit Details" open={open} onClose={onClose} width={800}>
            <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Audit Date">
                    {dayjs(audit.audit_date).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(audit.status)}>{audit.status?.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Center">{audit.center_id?.name || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Auditor">
                    {audit.auditor_id?.username || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Remarks" span={2}>
                    {audit.remarks || 'No remarks'}
                </Descriptions.Item>
            </Descriptions>

            <Divider>Items</Divider>

            <Table
                columns={columns}
                dataSource={audit.items}
                rowKey={(record) => record.item_id._id}
                pagination={false}
                scroll={{ x: 600 }}
                size="small"
            />

            <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="font-semibold">Summary:</p>
                <p>Total Items: {audit.items?.length}</p>
                <p>
                    Total Discrepancy:{' '}
                    <span className="font-bold">
                        {audit.items?.reduce((sum, item) => sum + (item.discrepancy || 0), 0)}
                    </span>
                </p>
            </div>
        </Drawer>
    );
}

export default AuditDetails;

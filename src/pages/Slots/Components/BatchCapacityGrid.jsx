import { Card, Drawer, Empty, Skeleton, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import useBatchCapacity, { WAITING_ALERT_DAYS, WAITING_WARN_DAYS } from '@hooks/useBatchCapacity';
import { weekDays } from '@utils/constants';
import { getSlotColor } from '@utils/helper';

const { Text, Title } = Typography;

const NEXT_STATUS_TAG = {
  rescheduled: { color: 'orange', label: 'Rescheduled' },
  absent: { color: 'red', label: 'Absent' },
};

const waitingColor = (days) => {
  if (days > WAITING_ALERT_DAYS) return 'red';
  if (days > WAITING_WARN_DAYS) return 'orange';
  return 'default';
};

const formatDate = (value) => dayjs(value).format('ddd, DD MMM');

// Weekly batch capacity: how many students belong to each weekday + time
// session, independent of any single date. "Waiting" students have sessions
// left but nothing allocated, listed under their last batch for follow-up.
function BatchCapacityGrid() {
  const { rows, days, loading, isAllCenters, selected, selectedLabel, selectBatch, closeBatch } = useBatchCapacity();

  const columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      fixed: 'left',
      width: 90,
      render: (value) => <Text strong>{value}</Text>,
    },
    ...days.map((day) => ({
      title: weekDays[day],
      key: day,
      align: 'center',
      width: 110,
      onCell: (record) => ({
        onClick: () => record[day] && selectBatch(record[day]),
        style: { cursor: record[day] ? 'pointer' : 'default', padding: 4 },
      }),
      render: (_, record) => {
        const batch = record[day];
        if (!batch) return <Text type="secondary">—</Text>;
        const freePercent = batch.max > 0 ? (batch.free / batch.max) * 100 : 0;
        return (
          <div className="rounded-md px-2 py-1" style={{ background: getSlotColor(freePercent) }}>
            <div style={{ fontWeight: 600 }}>
              {batch.memberCount}/{batch.max}
              {batch.memberCount >= batch.max && <Text type="danger" style={{ marginLeft: 4, fontSize: 11 }}>FULL</Text>}
            </div>
            {batch.waitingCount > 0 && (
              <div style={{ fontSize: 11, color: '#ad6800' }}>+{batch.waitingCount} waiting</div>
            )}
          </div>
        );
      },
    })),
  ];

  const memberColumns = [
    { title: '#', key: 'index', width: 50, render: (_, __, idx) => idx + 1 },
    { title: 'Student Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Next Class',
      dataIndex: 'nextClass',
      key: 'nextClass',
      render: (value, record) => {
        const cfg = NEXT_STATUS_TAG[record.nextStatus];
        return (
          <>
            {formatDate(value)}
            {cfg && <Tag color={cfg.color} style={{ marginLeft: 6 }}>{cfg.label}</Tag>}
          </>
        );
      },
    },
  ];

  const waitingColumns = [
    { title: '#', key: 'index', width: 50, render: (_, __, idx) => idx + 1 },
    { title: 'Student Name', dataIndex: 'name', key: 'name' },
    { title: 'Last Class', dataIndex: 'lastClass', key: 'lastClass', render: formatDate },
    { title: 'Sessions Left', dataIndex: 'remaining', key: 'remaining', width: 110 },
    {
      title: 'Waiting',
      dataIndex: 'daysWaiting',
      key: 'daysWaiting',
      width: 90,
      render: (value) => <Tag color={waitingColor(value)}>{value}d</Tag>,
    },
  ];

  return (
    <Card
      size="small"
      title="Batch Capacity"
      extra={<Text type="secondary" style={{ fontSize: 12 }}>Students in each weekly batch · click a batch for details</Text>}
    >
      {loading ? (
        <Skeleton active />
      ) : rows.length === 0 ? (
        <Empty description={isAllCenters ? 'Select a center to see batch capacity.' : 'No batches found.'} />
      ) : (
        <Table
          dataSource={rows}
          columns={columns}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: 'max-content' }}
        />
      )}

      <Drawer
        title={`Batch: ${selectedLabel}`}
        open={!!selected}
        onClose={closeBatch}
        width={640}
      >
        {selected && (
          <>
            <Title level={5} style={{ marginBottom: 8 }}>
              Members
              <Tag style={{ marginLeft: 8, fontWeight: 'normal' }}>{selected.memberCount}/{selected.max}</Tag>
            </Title>
            <Table
              dataSource={selected.members}
              columns={memberColumns}
              rowKey={(r) => r.studentId}
              pagination={{ pageSize: 20, hideOnSinglePage: true }}
              size="small"
              bordered
              locale={{ emptyText: 'No students in this batch.' }}
            />

            <Title level={5} style={{ marginTop: 24, marginBottom: 4 }}>
              Waiting for Allocation
              <Tag color={selected.waitingCount ? 'orange' : 'default'} style={{ marginLeft: 8, fontWeight: 'normal' }}>
                {selected.waitingCount}
              </Tag>
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
              Sessions left in the course but nothing allocated. Their last classes were in this batch.
            </Text>
            <Table
              dataSource={selected.waiting}
              columns={waitingColumns}
              rowKey={(r) => r.studentId}
              pagination={{ pageSize: 20, hideOnSinglePage: true }}
              size="small"
              bordered
              locale={{ emptyText: 'No students waiting.' }}
            />
          </>
        )}
      </Drawer>
    </Card>
  );
}

export default BatchCapacityGrid;

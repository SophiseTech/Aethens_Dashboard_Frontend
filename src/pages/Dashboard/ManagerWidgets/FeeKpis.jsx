import { useMemo } from 'react';
import { Card, Col, Row, Table, Tag, Empty, Typography } from 'antd';
import { WarningOutlined, ClockCircleOutlined, CalendarOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import DataDisplay from '@pages/Dashboard/Components/DataDisplay';
import EChart from '@pages/Dashboard/Chart/EChart';
import FeeTracker from '@pages/Students/Component/FeeTracker';
import useFeeKpis from '@hooks/useFeeKpis';
import dayjs from 'dayjs';

const { Text } = Typography;

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function FeeKpis() {
  const {
    kpis,
    loading,
    selectedStudent,
    modalVisible,
    openStudent,
    closeModal,
  } = useFeeKpis();

  const aging = kpis?.overdue?.aging;

  const agingOptions = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    xaxis: { categories: ['0-15 days', '16-30 days', '31+ days'] },
    colors: ['#F5A623'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => formatCurrency(val) } },
  }), []);

  const agingSeries = aging
    ? [{ name: 'Overdue Amount', data: [aging['0-15'].amount, aging['16-30'].amount, aging['31+'].amount] }]
    : [];

  const hasAgingData = aging && (aging['0-15'].amount + aging['16-30'].amount + aging['31+'].amount) > 0;

  const defaulterColumns = [
    { title: 'Student', dataIndex: 'studentName', key: 'studentName' },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={type === 'installment' ? 'purple' : 'orange'}>{type}</Tag>,
    },
    {
      title: 'Overdue Amount',
      dataIndex: 'overdueAmount',
      key: 'overdueAmount',
      render: (amount) => <Text strong className='text-red-500'>{formatCurrency(amount)}</Text>,
    },
    {
      title: 'Oldest',
      dataIndex: 'oldestOverdueDays',
      key: 'oldestOverdueDays',
      render: (days) => days ? `${days}d` : '-',
    },
  ];

  const lapsedColumns = [
    { title: 'Student', dataIndex: 'studentName', key: 'studentName' },
    {
      title: 'Last Paid Month',
      dataIndex: 'lastPaidMonth',
      key: 'lastPaidMonth',
      render: (month) => dayjs(month).format('MMM YYYY'),
    },
  ];

  const dueThisMonthColumns = [
    { title: 'Student', dataIndex: 'studentName', key: 'studentName' },
    {
      title: 'Due Month',
      dataIndex: 'dueMonth',
      key: 'dueMonth',
      render: (month, row) => (
        <>
          {dayjs(month).format('MMM YYYY')}
          {row.carriedOver && <Tag color='volcano' className='ml-1'>Carried Over</Tag>}
        </>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
    },
  ];

  return (
    <Card
      className='w-full border border-border'
      title={
        <div className='flex gap-2 items-center'>
          <WarningOutlined />
          <span>Fee KPIs</span>
        </div>
      }
      loading={loading && !kpis}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <DataDisplay
            title='Total Overdue'
            count={formatCurrency(kpis?.overdue?.totalAmount)}
            // prefix='₹'
            icon={<WarningOutlined className='text-xl text-white' />}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <DataDisplay
            title='Defaulters'
            count={kpis?.overdue?.defaultersCount}
            icon={<ExclamationCircleOutlined className='text-xl text-white' />}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <DataDisplay
            title='Due This Month'
            count={formatCurrency(kpis?.dueThisMonth?.amount)}
            // prefix='₹'
            icon={<CalendarOutlined className='text-xl text-white' />}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <DataDisplay
            title='Upcoming Dues (30d)'
            count={formatCurrency(kpis?.upcomingDues?.next30?.amount)}
            // prefix='₹'
            icon={<CalendarOutlined className='text-xl text-white' />}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <DataDisplay
            title='Needs Current-Month Fee'
            count={kpis?.lapsedActive?.count}
            icon={<ClockCircleOutlined className='text-xl text-white' />}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className='mt-4'>
        <Col xs={24} lg={8}>
          <Card size='small' title='Overdue Aging' className='h-full'>
            {hasAgingData ? (
              <EChart series={agingSeries} options={agingOptions} type='bar' height={220} />
            ) : (
              <Empty description='No overdue fees' image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card size='small' title='Top Defaulters' className='h-full'>
            <Table
              size='small'
              rowKey={(row) => row.studentId}
              dataSource={kpis?.topDefaulters || []}
              columns={defaulterColumns}
              pagination={false}
              locale={{ emptyText: <Empty description='No defaulters' image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              onRow={(row) => ({ onClick: () => openStudent(row.studentId), className: 'cursor-pointer' })}
              scroll={{ y: 240 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className='mt-4'>
        <Col xs={24} lg={12}>
          <Card size='small' title='Due This Month'>
            <Table
              size='small'
              rowKey={(row, index) => `${row.studentId}-${index}`}
              dataSource={kpis?.dueThisMonth?.students || []}
              columns={dueThisMonthColumns}
              pagination={false}
              locale={{ emptyText: <Empty description='Nothing due this month' image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              onRow={(row) => ({ onClick: () => openStudent(row.studentId), className: 'cursor-pointer' })}
              scroll={{ y: 200 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size='small' title='Needs Current-Month Fee (Continuing Without Billing)'>
            <Table
              size='small'
              rowKey={(row) => row.studentId}
              dataSource={kpis?.lapsedActive?.students || []}
              columns={lapsedColumns}
              pagination={false}
              locale={{ emptyText: <Empty description='All caught up' image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              onRow={(row) => ({ onClick: () => openStudent(row.studentId), className: 'cursor-pointer' })}
              scroll={{ y: 200 }}
            />
          </Card>
        </Col>
      </Row>

      {modalVisible && selectedStudent && (
        <FeeTracker
          student={selectedStudent}
          visible={modalVisible}
          onCancel={closeModal}
        />
      )}
    </Card>
  );
}

export default FeeKpis;

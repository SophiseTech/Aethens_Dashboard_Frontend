import React from 'react'

function PhaseTracker() {
  const [selectedCourse, setSelectedCourse] = useState(1);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Badge status="success" />;
      case 'in-progress':
        return <Badge status="processing" />;
      case 'in-review':
        return <Badge status="warning" />;
      case 'rejected':
        return <Badge status="error" />;
      default:
        return <Badge status="default" />;
    }
  };

  const progressColumns = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    ...mockPhases.map((phase, index) => ({
      title: phase.name,
      key: `phase-${index}`,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={`${phase.name}: ${record.phases[index]?.status || 'not-started'}`}>
          {getStatusIcon(record.phases[index]?.status || 'not-started')}
        </Tooltip>
      ),
    })),
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const completed = record.phases.filter(p => p.status === 'completed').length;
        const total = record.phases.length;
        const percentage = Math.round((completed / total) * 100);

        return (
          <div style={{ width: '100px' }}>
            <Progress percent={percentage} size="small" />
          </div>
        );
      },
    },
  ];

  const handleExport = (format) => {
    console.log(`Exporting data in ${format} format`);
    Modal.info({
      title: 'Export Started',
      content: `Your ${format} export is being prepared and will download shortly.`,
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Project Phase Tracker</Title>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport('CSV')}
          >
            Export CSV
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport('PDF')}
          >
            Export PDF
          </Button>
        </Space>
      </div>

      {/* Course Selector */}
      <Card className="mb-4">
        <Space>
          <Text strong>Course:</Text>
          <Select
            value={selectedCourse}
            onChange={setSelectedCourse}
            style={{ minWidth: 300 }}
          >
            {mockCourses.map(course => (
              <Option key={course.id} value={course.id}>
                {course.name}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Legend */}
      <Card className="mb-4">
        <Text strong className="mr-4">Legend:</Text>
        <Space wrap>
          <Space><Badge status="success" />Completed</Space>
          <Space><Badge status="processing" />In Progress</Space>
          <Space><Badge status="warning" />In Review</Space>
          <Space><Badge status="error" />Rejected</Space>
          <Space><Badge status="default" />Not Started</Space>
        </Space>
      </Card>

      {/* Progress Table */}
      <Card>
        <Table
          columns={progressColumns}
          dataSource={mockStudentProgress}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );

}

export default PhaseTracker
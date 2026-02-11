import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { isValidURL } from '@utils/helper';
import { Table, Badge, Tag, Select, Input, Space } from 'antd';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from 'zustand';
import CustomSyllabusList from './CustomSyllabusList';

const { Search } = Input;

function SyllabusList({ syllabusData, loading, statusFilter, setStatusFilter, searchText, setSearchText }) {
  // Get user data
  const { user } = useStore(userStore);

  // Handle general syllabus type (existing logic)
  const modules = syllabusData?.modules || syllabusData || []; // Backward compatibility

  // Transform syllabus data into a flat table format
  // NO MORE FILTERING - Backend handles it
  const tableData = useMemo(() => {
    // Skip processing for custom syllabus type
    if (syllabusData?.syllabusType === 'custom') {
      return [];
    }

    let dataIndex = 0;
    const formattedData = [];

    modules?.forEach((module) => {
      let moduleAdded = false;

      module.units?.forEach((unit) => {
        let unitAdded = false;

        unit.topics?.forEach((topic) => {
          formattedData.push({
            key: dataIndex++,
            module: module.name,
            unit: unit.name,
            topic: topic?.name || topic,
            completed: topic?.completed || false,
            sessionCount: topic?.sessionCount || 0,
          });
          unitAdded = true;
          moduleAdded = true;
        });

        if (!unitAdded) {
          formattedData.push({
            key: dataIndex++,
            module: module.name,
            unit: unit.name,
            topic: "-",
            completed: unit?.completed || false,
            sessionCount: 0,
          });
          moduleAdded = true;
        }
      });

      if (!moduleAdded) {
        formattedData.push({
          key: dataIndex++,
          module: module.name,
          unit: "-",
          topic: "-",
          completed: module?.completed || false,
          sessionCount: 0,
        });
      }
    });

    return formattedData;
  }, [modules, syllabusData?.syllabusType]);

  // Define table columns
  const columns = [
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit) => {
        if (isValidURL(unit)) {
          return (
            <Link to={unit} target='_blank'>
              <Badge color='blue' text='Click here to access' />
            </Link>
          );
        }
        return unit;
      },
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
    },
  ];

  // Add "Status" and "Sessions" columns only if user is a student
  if (user.role === ROLES.STUDENT) {
    columns.push(
      {
        title: 'Sessions',
        dataIndex: 'sessionCount',
        key: 'sessionCount',
        render: (sessionCount) => {
          // TODO: Replace dummy total (10) with actual total from backend when available
          const totalSessions = 10;
          return (
            <span className="text-sm">
              <span className="font-semibold">{sessionCount}</span>
              <span className="text-gray-500">/{totalSessions}</span>
            </span>
          );
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (_, record) => {
          const { completed, sessionCount } = record;

          if (completed) {
            return <Tag color="success">Completed</Tag>;
          } else if (sessionCount >= 1) {
            return <Tag color="processing">Ongoing</Tag>;
          } else {
            return <Tag color="default">Not Started</Tag>;
          }
        },
      }
    );
  }

  // Handle custom syllabus type - return after all hooks have been called
  if (syllabusData?.syllabusType === 'custom') {
    return <CustomSyllabusList
      images={syllabusData.images}
      loading={loading}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      searchText={searchText}
      setSearchText={setSearchText}
    />;
  }

  return (
    <div>
      {/* Filters - Only show for students */}
      {user.role === ROLES.STUDENT && (
        <Space className="mb-4" wrap>
          <Select
            style={{ width: 160 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Completed', value: 'completed' },
              { label: 'Ongoing', value: 'ongoing' },
              { label: 'Not Started', value: 'notStarted' },
            ]}
          />
          <Search
            placeholder="Search module, unit, or topic"
            allowClear
            style={{ width: 280 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={setSearchText}
          />
        </Space>
      )}

      {/* Table */}
      <Table
        columns={columns}
        dataSource={tableData}
        rowClassName={(record) => (record.completed ? 'completed-row' : '')}
        pagination={false}
        className='flex-1'
        loading={loading}
      />
    </div>
  );
}

export default SyllabusList;

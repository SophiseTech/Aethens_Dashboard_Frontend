import userStore from '@stores/UserStore';
import { ROLES } from '@utils/constants';
import { isValidURL } from '@utils/helper';
import { Table, Badge, Tag } from 'antd';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from 'zustand';

function SyllabusList({ modules, loading }) {
  // Get user data
  const { user } = useStore(userStore);

  // Transform syllabus data into a flat table format
  const tableData = useMemo(() => {
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
            completed: false,
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
          completed: false,
        });
      }
    });
  
    return formattedData;
  }, [modules]);

  // Define table columns
  const columns = [
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (text) =>
        isValidURL(text) ? <Link target='_blank' to={text}>View Image</Link> : <p>{text}</p>,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (text) =>
        isValidURL(text) ? <Link target='_blank' to={text}>View Image</Link> : <p>{text}</p>,
    },
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      render: (text) =>
        isValidURL(text) ? <Link target='_blank' to={text}>View Image</Link> : <p>{text}</p>,
    },
  ];

  // Add "Completed" column only if user is a student
  if (user.role === ROLES.STUDENT) {
    columns.push({
      title: 'Completed',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed) => (
        <Tag color={completed ? 'success' : 'error'}>
          {completed ? 'Completed' : 'Pending'}
        </Tag>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowClassName={(record) => (record.completed ? 'completed-row' : '')}
      pagination={false}
      className='flex-1'
      loading={loading}
    />
  );
}

export default SyllabusList;

import { PlusOutlined } from '@ant-design/icons';
import CustomSelect from '@components/form/CustomSelect';
import { AutoComplete, Button, Flex, Form, Input, InputNumber, Popconfirm, Select, Table, Typography } from 'antd'
import React, { useState } from 'react'



function DynamicInpuTable({ form, name, columns = [], options = [], onSelect = () => { }, disableAddItem, disableDelete }) {

  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.key === editingKey;
  const rows = Form.useWatch(name, form)

  const edit = (record, index) => {
    form.setFieldValue([name, index], {
      name: '',
      age: '',
      address: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = async () => {
    setEditingKey('');
  };

  const save = async (key, index) => {
    try {
      await form.validateFields([[name, index]], { validateOnly: false, recursive: true });
      const newData = rows[index];
      form.setFieldValue([name, index], newData)
      setEditingKey('');
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const addRow = () => {
    if (disableAddItem) return
    const rows = form.getFieldValue(name)
    let newRow = {}
    columns?.map(column => {
      newRow[column.dataIndex] = column.defaultValue || ""
    })
    const key = `${rows.length}`
    newRow.key = key
    form.setFieldValue(name, [...rows, newRow])
    setEditingKey(key);
  }

  const remove = async (record, index) => {
    if (disableDelete) return
    const removedRows = rows.filter(row => row.key !== record.key)

    await form.setFieldValue(name, removedRows)
    if (editingKey === record.key) setEditingKey('')
  }

  const columnsWithActions = [
    ...columns,
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record, index) => {
        const editable = isEditing(record);
        return editable ? (
          <Flex gap={5} align='center'>
            <Button
              variant='filled'
              color='green'
              onClick={() => save(record.key, index)}
              style={{
                marginInlineEnd: 8,
              }}
              className='whitespace-nowrap'
            >
              Save
            </Button>
            {!disableDelete &&
              <Popconfirm title="Sure to delete?" onConfirm={() => remove(record, index)}>
                <Button variant='filled' color='red'>Delete</Button>
              </Popconfirm>
            }
          </Flex>
        ) : (
          <div className='flex gap-2'>
            <Button disabled={editingKey !== ''} onClick={() => edit(record, index)} variant='filled' color='blue'>
              Edit
            </Button>

            {!disableDelete &&
              <Button disabled={editingKey !== ''} onClick={() => remove(record, index)} variant='filled' color='red'>
                Delete
              </Button>
            }
          </div>
        );
      },
    },
  ];

  const mergedColumns = columnsWithActions.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record, index) => ({
        record,
        inputType: col.type,
        dataIndex: col.dataIndex,
        title: col.title,
        name: name,
        index,
        options,
        onSelect,
        selectAfter: col.selectAfter,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div className='flex flex-col'>
      <Form.Item
        name={name}
        className='w-full'
        rules={[
          {
            validator: async (_, items) => {
              if (!items || items.length < 1) {
                return Promise.reject(new Error("At least 1 items required"));
              }
            },
          },
        ]}
      >
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={rows}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
        />
      </Form.Item>
      {!disableAddItem &&
        <Button onClick={addRow} disabled={editingKey !== ''} className='self-start' variant='solid' color='green' icon={<PlusOutlined />}>
          Add Item
        </Button>
      }
    </div>
  )
}

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  name,
  options,
  children,
  onSelect,
  selectAfter,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ?
    <InputNumber />
    : inputType === "autocomplete" ?
      <Select
        options={options}
        onSelect={(value) => onSelect(value, index)}
        filterOption={(inputValue, option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        }
        showSearch
      />
      : inputType === "percentage" ? <Input addonAfter={selectAfter(index)} />
        : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={[name, index, dataIndex]}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            }
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default DynamicInpuTable
import { PlusOutlined } from '@ant-design/icons';
import CustomSelect from '@components/form/CustomSelect';
import { AutoComplete, Button, Flex, Form, Input, InputNumber, Popconfirm, Select, Spin, Table, Typography } from 'antd'
import { debounce } from 'lodash';
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
      width: '10%',
      render: (_, record, index) => {
        const editable = isEditing(record);
        return editable ? (
          <Flex gap={5} align='center' wrap='wrap'>
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
        options: col.options,
        onSelect,
        onSearch: col.onSearch,
        selectAfter: col.selectAfter,
        editing: isEditing(record),
        itemType: col.itemType,
      }),
    };
  });

  return (
    <div className='flex flex-col itemsInputTable'>
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
          scroll={{
            // x: 'max-content',
          }}
          className='max-lg:overflow-auto'
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
  onSearch,
  itemType,
  ...restProps
}) => {

  const [searchLoading, setSearchLoading] = useState(false)

  const debouncedSearch = React.useMemo(() => {
    if (!onSearch) return () => { };
    return debounce((val) => {
      try {
        setSearchLoading(true);
        onSearch?.(val, index);
      } catch (error) {
        console.log(error);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [onSearch, index]);
  
  const inputNode = inputType === 'number' ?
    <InputNumber />
    : inputType === "autocomplete" ?
      <Select
        options={options}
        onSelect={(value, option) => onSelect(value, index, option)}
        filterOption={itemType !== "course" ? false : (input, option) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }}
        onSearch={debouncedSearch}
        showSearch
      >
        {searchLoading ? <Spin className='animate-spin' /> : options?.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
      : inputType === "percentage" ? <Input addonAfter={selectAfter(index)} />
      : inputType === "select" ?
      <Select
        options={options}
      >
      </Select>
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
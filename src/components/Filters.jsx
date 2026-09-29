import { Input, Select, DatePicker, Button, Flex, notification, Row, Col } from 'antd';
import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { toISTEndOfDayISO, toISTStartOfDayISO } from '@utils/helper';

const { RangePicker } = DatePicker;
const EMPTY_OBJECT = {};
const Filters = ({ filters = [], onApply = () => { }, onReset = () => { }, defaultValues = EMPTY_OBJECT }) => {
  const [filterValues, setFilterValues] = useState({});

  // Convert formatted defaultValues back to dayjs objects
  useEffect(() => {
    const convertedDefaults = _.mapValues(defaultValues, (value) => {
      if (_.isPlainObject(value) && (value.$gte || value.$lte)) {
        const val = []
        if (value.$gte) {
          val.push(dayjs(value.$gte))
        } else {
          val.push(null)
        }
        if (value.$lte) {
          val.push(dayjs(value.$lte))
        } else {
          val.push(null)
        }
        return val;
      }
      return dayjs.isDayjs(value) ? dayjs(value) : value;
    });
    setFilterValues(convertedDefaults);
  }, [defaultValues]);

  const handleChange = (key, customOnChange) => (value) => {
    const nextVal = value?.target ? value.target.value : value;
    setFilterValues((prev) => ({
      ...prev,
      [key]: nextVal
    }));
    if (typeof customOnChange === 'function') {
      customOnChange(nextVal);
    }
  };

  const resetFilter = () => {
    setFilterValues({});
    onReset();
  };

  const applyFilter = () => {
    const activeFilters = _.pickBy(
      filterValues,
      (value) => value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)
    );

    if (_.isEmpty(activeFilters)) {
      notification.info({
        message: "Alert",
        description: "Please apply any filter",
        placement: "topRight",
      });
      return;
    }

    const formattedFilters = { ...activeFilters };

    // Format date and range filters
    Object.keys(formattedFilters).forEach((key) => {
      const value = formattedFilters[key];

      // Single Date
      if (dayjs.isDayjs(value)) {
        formattedFilters[key] = {
          $gte: toISTStartOfDayISO(value),
          $lte: toISTEndOfDayISO(value)
        };
      }

      // Date Range
      if (Array.isArray(value) && value.length === 2) {
        formattedFilters[key] = {}
        if (value[0] && dayjs.isDayjs(value[0])) {
          formattedFilters[key].$gte = toISTStartOfDayISO(value[0])
        }
        if (value[1] && dayjs.isDayjs(value[1])) {
          formattedFilters[key].$lte = toISTEndOfDayISO(value[1])
        }
      }
    });

    onApply(formattedFilters);
  };

  const renderFilter = (filter) => {
    const { key, type, placeholder, options, mode, onSearch, onPopupScroll, loading, filterOption, notFoundContent, onChange } = filter;
    const isMultiple = mode === 'multiple';
    const commonProps = {
      placeholder,
      onChange: handleChange(key, onChange),
      style: { width: '100%' },
      value: filterValues[key] !== undefined ? filterValues[key] : (isMultiple ? [] : undefined)
    };

    switch (type) {
      case 'input':
        return <Input {...commonProps} type={type} />;
      case 'number':
        return <Input {...commonProps} type={type} />;
      case 'date':
        return <DatePicker {...commonProps} value={filterValues[key] || null} />;
      case 'select':
        return (
          <Select
            {...commonProps}
            mode={mode}
            loading={loading}
            onSearch={onSearch}
            onPopupScroll={onPopupScroll}
            showSearch
            allowClear
            maxTagCount="responsive"
            filterOption={
              filterOption !== undefined
                ? filterOption
                : (input, option) =>
                    (option?.children ?? option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={notFoundContent}
          >
            {options?.map(({ value, label }) => (
              <Select.Option key={value} value={value} label={label}>{label}</Select.Option>
            ))}
          </Select>
        );
      case 'range':
        return <RangePicker {...commonProps} value={filterValues[key] || []} />;
      default:
        return null;
    }
  };

  if (filters.length === 0) return null;

  return (
    <div className='p-3 mb-3 rounded-xl border bg-card border-border'>
      <Row gutter={[8, 8]}>
        {filters.map((filter) => (
          <Col span={filter.span || 24} key={filter.key}>
            {renderFilter(filter)}
          </Col>
        ))}
      </Row>
      <Flex gap={5} className='mt-2'>
        <Button variant='filled' color='green' onClick={applyFilter}>
          Apply
        </Button>
        <Button variant='filled' color='red' onClick={resetFilter}>
          Reset
        </Button>
      </Flex>
    </div>
  );
};

export default Filters;

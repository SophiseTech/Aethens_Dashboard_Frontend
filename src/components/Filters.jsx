import { Input, Select, DatePicker, Button, Flex, notification } from 'antd';
import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const Filters = ({ filters = [], onApply = () => { }, onReset = () => { }, defaultValues = {} }) => {
  const [filterValues, setFilterValues] = useState({});

  // Convert formatted defaultValues back to dayjs objects
  useEffect(() => {
    const convertedDefaults = _.mapValues(defaultValues, (value) => {
      if (_.isObject(value)) {
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
      // if (_.isObject(value) && Object.hasOwn(value, '$gte') && Object.hasOwn(value, '$lte')) {
      //   return [dayjs(value.$gte), dayjs(value.$lte)]; // Convert to range format
      // }
      return dayjs.isDayjs(value) ? dayjs(value) : value;
    });
    setFilterValues(convertedDefaults);
  }, [defaultValues]);

  const handleChange = (key) => (value) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value?.target ? value.target.value : value
    }));
  };

  const resetFilter = () => {
    setFilterValues({});
    onReset();
  };

  const applyFilter = () => {
    if (_.isEmpty(filterValues)) {
      notification.info({
        message: "Alert",
        description: "Please apply any filter",
        placement: "topRight",
      });
      return;
    }

    const formattedFilters = _.pickBy(filterValues, (value) => value !== null && value !== undefined && value !== "");
    console.log("FormattedFilters0::", formattedFilters)

    // Format date and range filters
    Object.keys(formattedFilters).forEach((key) => {
      const value = formattedFilters[key];

      // Single Date
      if (dayjs.isDayjs(value)) {
        formattedFilters[key] = {
          $gte: dayjs(value).startOf('day').toISOString(),
          $lte: dayjs(value).endOf('day').toISOString()
        };
      }

      // Date Range
      if (Array.isArray(value) && value.length === 2) {
        formattedFilters[key] = {}
        if (value[0] && dayjs.isDayjs(value[0])) {
          formattedFilters[key].$gte = dayjs(value[0]).startOf('day').toISOString()
        }
        if (value[1] && dayjs.isDayjs(value[1])) {
          formattedFilters[key].$lte = dayjs(value[1]).endOf('day').toISOString()
        }
      }
    });
    console.log("FormattedFilters::", formattedFilters)
    onApply(formattedFilters);
  };
  console.log(filterValues);

  const renderFilter = ({ key, type, placeholder, options }) => {
    const commonProps = {
      placeholder,
      onChange: handleChange(key),
      style: { width: '100%', marginBottom: 10 },
      value: filterValues[key] || undefined
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
          <Select {...commonProps}>
            {options?.map(({ value, label }) => (
              <Select.Option key={value} value={value}>{label}</Select.Option>
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
    <div className='mb-3 bg-card p-3 rounded-xl border-border border'>
      {filters.map((filter) => (
        <div key={filter.key}>{renderFilter(filter)}</div>
      ))}
      <Flex gap={5}>
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

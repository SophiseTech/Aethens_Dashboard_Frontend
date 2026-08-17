import React from "react";
import { Table, Select, Input, Tag } from "antd";
import PropTypes from "prop-types";

export const AVAILABLE_FIELDS = [
  { label: "Recipient name", value: "name" },
  { label: "Course name", value: "course_name" },
  { label: "Center name", value: "center_name" },
  { label: "Diploma batch name", value: "diploma_batch_name" },
  { label: "Diploma intake name", value: "diploma_intake_name" },
];

// One row per template variable. Each maps to either a per-recipient field
// (resolved from RecipientGroupService's fields snapshot) or a fixed value.
export default function VariableMappingEditor({ templateVariables = [], mapping = [], onChange }) {
  const updateRow = (index, patch) => {
    onChange(mapping.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const columns = [
    {
      title: "{{n}}",
      dataIndex: "index",
      width: 60,
      render: (v) => <Tag>{`{{${v}}}`}</Tag>,
    },
    {
      title: "Meta example",
      width: 140,
      render: (_v, _r, i) => <span className="text-gray-400 text-xs">{templateVariables[i]?.example}</span>,
    },
    {
      title: "Source",
      dataIndex: "sourceType",
      width: 130,
      render: (v, _r, i) => (
        <Select
          value={v}
          onChange={(value) => updateRow(i, { sourceType: value })}
          options={[
            { label: "Recipient field", value: "field" },
            { label: "Fixed value", value: "static" },
          ]}
        />
      ),
    },
    {
      title: "Value",
      render: (_v, row, i) =>
        row.sourceType === "static" ? (
          <Input value={row.staticValue} onChange={(e) => updateRow(i, { staticValue: e.target.value })} placeholder="Fixed text" />
        ) : (
          <Select
            value={row.field}
            onChange={(value) => updateRow(i, { field: value })}
            options={AVAILABLE_FIELDS}
            placeholder="Choose field"
            style={{ width: "100%" }}
          />
        ),
    },
    {
      title: "Fallback",
      dataIndex: "fallbackValue",
      render: (v, _r, i) => (
        <Input value={v} onChange={(e) => updateRow(i, { fallbackValue: e.target.value })} placeholder="If empty..." />
      ),
    },
  ];

  return <Table dataSource={mapping} columns={columns} rowKey="index" size="small" pagination={false} />;
}

VariableMappingEditor.propTypes = {
  templateVariables: PropTypes.array,
  mapping: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

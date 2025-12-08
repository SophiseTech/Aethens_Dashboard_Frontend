import { useRef, useEffect } from "react";
import { Form, Card, Row, Col, Button, Space } from "antd";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import CustomInput from "@components/form/CustomInput";
import CustomSelect from "@components/form/CustomSelect";
import CustomDatePicker from "@components/form/CustomDatePicker";
import CustomFileUpload from "@components/form/CustomFileUpload";
import PropTypes from "prop-types";

export default function DynamicMultiInputArray({
  name,
  fields = [],
  componentsMap = {},
  minItems = 0,
  maxItems = Infinity,
  addButtonText = "Add item",
  cardProps = {},
}) {
  const initialized = useRef(false);
  const defaultMap = {
    input: CustomInput,
    select: CustomSelect,
    date: CustomDatePicker,
    file: CustomFileUpload,
    ...componentsMap,
  };

  /** Run initializer on first mount */
  useEffect(() => {
    initialized.current = false; // allow re-run after form reset
  }, []);

  return (
    <Form.List name={name}>
      {(listFields, { add, remove }) => {
        /** ✔ Auto-add min rows:
         * - On first render
         * - After reset
         * - After submit
         * - Whenever list becomes empty
         */
        if (!initialized.current && listFields.length === 0) {
          initialized.current = true;

          for (let i = 0; i < minItems; i++) {
            const empty = fields.reduce((acc, f) => {
              acc[f.key] = f.defaultValue ?? null;
              return acc;
            }, {});
            add(empty);
          }
        }

        return (
          <Space direction="vertical" size="middle" className="w-full">
            {listFields.map((fieldMeta, index) => (
              <Card key={fieldMeta.key} size="small" {...cardProps}>
                <Row gutter={[12, 12]} align="top">
                  {fields.map((f) => {
                    const Component =
                      typeof f.component === "string"
                        ? defaultMap[f.component] || CustomInput
                        : f.component || CustomInput;

                    const wrap = f.wrapWithFormItem !== false;

                    return (
                      <Col xs={24} sm={f.colSpan || 24} key={f.key}>
                        {wrap ? (
                          <Form.Item
                            name={[fieldMeta.name, f.key]}
                            rules={f.rules}
                            initialValue={f.defaultValue}
                            valuePropName={f.valuePropName || "value"}
                            label={f.label}
                          >
                            <Component {...(f.props || {})} />
                          </Form.Item>
                        ) : (
                          <Component
                            name={[fieldMeta.name, f.key]}
                            label={f.label}
                            {...(f.props || {})}
                          />
                        )}
                      </Col>
                    );
                  })}

                  <Col xs={24} style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <Space>
                      <Button
                        type="text"
                        icon={<PlusCircleOutlined style={{ fontSize: 18 }} />}
                        onClick={() => {
                          const empty = fields.reduce((acc, f) => {
                            acc[f.key] = f.defaultValue ?? null;
                            return acc;
                          }, {});
                          add(empty, index + 1);
                        }}
                        disabled={listFields.length >= maxItems}
                      />

                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined style={{ fontSize: 18 }} />}
                        onClick={() => remove(fieldMeta.name)}
                        disabled={listFields.length <= minItems}
                      />
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}

            <Button
              block
              type="dashed"
              onClick={() => {
                const empty = fields.reduce((acc, f) => {
                  acc[f.key] = f.defaultValue ?? null;
                  return acc;
                }, {});
                add(empty);
              }}
              disabled={listFields.length >= maxItems}
            >
              <PlusCircleOutlined /> {addButtonText}
            </Button>
          </Space>
        );
      }}
    </Form.List>
  );
}

DynamicMultiInputArray.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.node,
      component: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
      props: PropTypes.object,
      colSpan: PropTypes.number,
      defaultValue: PropTypes.any,
      rules: PropTypes.array,
      valuePropName: PropTypes.string,
      wrapWithFormItem: PropTypes.bool, // default true
    })
  ),
  componentsMap: PropTypes.object,
  minItems: PropTypes.number,
  maxItems: PropTypes.number,
  addButtonText: PropTypes.string,
  cardProps: PropTypes.object,
};
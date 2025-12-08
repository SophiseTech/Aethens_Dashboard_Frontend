import { Form, DatePicker } from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";

function CustomDatePicker({
  name,
  label,
  placeholder = "Select a date",
  className = "",
  time = false,
  required = true,
  disabled = false,
  inputProps = {},
  disabledMode = null, // "before" | "after" | "range"
  targetDate = null,
  range = null,
}) {
  const disabledDate = (current) => {
    if (!current) return false;

    if (disabledMode === "before" && targetDate) {
      return current.isBefore(dayjs(targetDate), "day");
    }

    if (disabledMode === "after" && targetDate) {
      return current.isAfter(dayjs(targetDate), "day");
    }

    if (disabledMode === "range" && range?.start && range?.end) {
      return (
        current.isBefore(dayjs(range.start), "day") ||
        current.isAfter(dayjs(range.end), "day")
      );
    }

    return false;
  };

  return (
    <Form.Item
      name={name}
      label={label}
      rules={[
        {
          required: required,
          message: `Please select the ${label}!`,
        },
      ]}
      className="w-full"
    >
      <DatePicker
        placeholder={placeholder}
        className={className}
        showTime={time}
        format={time ? "DD-MM-YYYY HH:mm" : "DD-MM-YYYY"}
        disabled={disabled}
        disabledDate={disabledDate}
        {...inputProps}
      />
    </Form.Item>
  );
}

CustomDatePicker.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  time: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  inputProps: PropTypes.object,

  // new props
  disabledMode: PropTypes.oneOf([null, "before", "after", "range"]),
  targetDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.object, // dayjs object
  ]),
  range: PropTypes.shape({
    start: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.object,
    ]),
    end: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.object,
    ]),
  }),
};

export default CustomDatePicker;

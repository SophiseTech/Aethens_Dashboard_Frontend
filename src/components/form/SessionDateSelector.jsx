import { Form, Button, Space, Card, Row, Col, Select, Empty, Tag, Spin, Flex, DatePicker } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import CustomDatePicker from '@components/form/CustomDatePicker';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ROLES } from '@utils/constants';
import userStore from '@stores/UserStore';
import { getSlotColor } from '@utils/helper';

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Format session label with day and time
 */
const formatSessionLabel = (session) => {
  if (!session?.start_time || session.weekDay === undefined) return "";
  return `${weekDays[session.weekDay]} - ${dayjs(session.start_time).format("h:mm A")}`;
};

/**
 * Render session option with availability details
 * Shows remaining slots and additional slots with color coding.
 * Staff see two numbers: seats free on the selected date, and the weekly batch
 * (members / max, plus students waiting for allocation). countMode "batch" puts
 * the batch number first — used when allotting a student into a batch.
 */
export const sessionSlotOptionRenderer = (option, user, showSlotCount = true, countMode = 'day') => {
  const { data: session } = option.data;
  if (!session) return null;

  const { remainingSlots: regularRemainingSLots = 0, additional = 0, effectiveRemainingSlots: totalRemainingSlots = 0, rescheduled = 0, freeSlotPercent, demo, batchMembers, batchWaiting = 0, max } = session;
  const weekday = weekDays[session.weekDay];
  const time = dayjs(session.start_time).format('h:mm A');
  const isStaff = !!user?.role && user.role !== ROLES.STUDENT;
  const hasBatch = isStaff && batchMembers !== null && batchMembers !== undefined;
  const remainingSlots = !isStaff ? totalRemainingSlots : regularRemainingSLots

  // Determine color based on remaining slots
  let slotColor = getSlotColor(freeSlotPercent)

  const tagStyle = { fontWeight: 600, borderRadius: 4, marginRight: 0 };
  const dayTag = (
    <Tag key="day" color={'default'} style={tagStyle}>
      {totalRemainingSlots} free on this date
    </Tag>
  );
  const batchTag = (
    <Tag key="batch" color={'blue'} style={tagStyle}>
      Batch {batchMembers}/{max}{batchWaiting > 0 ? ` (+${batchWaiting} waiting)` : ''}
    </Tag>
  );
  const countTags = hasBatch
    ? (countMode === 'batch' ? [batchTag, dayTag] : [dayTag, batchTag])
    : [(
      <Tag key="slots" color={'default'} style={tagStyle}>
        {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} left
      </Tag>
    )];

  return (
    <Flex direction="vertical" justify="space-between" align="center" size={2} style={{ width: '100%', background: slotColor }} className='px-2 py-1 rounded-lg'>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.05em', fontWeight: 'bold', margin: 0 }}>{weekday}</p>
        <p style={{ fontWeight: "bold", margin: 0 }}>{time}</p>
      </div>
      {showSlotCount && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {countTags}
          {(demo > 0 && [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER].includes(user.role)) && (
            <Tag
              color='warning'
              style={{
                fontWeight: 600,
                borderRadius: 4,
                marginRight: 0
              }}
            >
              D - {demo}
            </Tag>
          )}
          {(additional > 0 && [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER].includes(user.role)) && (
            <Tag
              color='gold'
              style={{
                fontWeight: 600,
                borderRadius: 4,
                marginRight: 0
              }}
            >
              A - {additional}
            </Tag>
          )}
          {(rescheduled > 0 && [ROLES.MANAGER, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER].includes(user.role)) && (
            <Tag
              color='geekblue'
              style={{
                fontWeight: 600,
                borderRadius: 4,
                marginRight: 0
              }}
            >
              R - {rescheduled}
            </Tag>
          )}
        </div>
      )}
    </Flex>
  );
};

/**
 * Format sessions array for Select options
 */
const formatSessions = (sessions) => {
  return (sessions || []).map(session => ({
    label: formatSessionLabel(session),
    value: session._id,
    data: session,
  }));
};

/**
 * SessionDateRow Component
 * Individual row for selecting a date and session pair.
 * Calls getAvailableSessions when date changes to trigger store update.
 * Uses availableSessions prop that updates when store changes.
 */
function SessionDateRow({
  fieldMeta,
  index,
  onRemove,
  getAvailableSessions,
  availableSessions = [],
  loading = false,
  minItems = 1,
  totalItems = 1,
  listName = 'sessionSchedule',
  countMode = 'day',
}) {
  const form = Form.useFormInstance();
  const lastFetchedRef = useRef(null); // Day this row last fetched sessions for

  const dateValue = Form.useWatch([listName, fieldMeta.name, 'date']);
  const sessionValue = Form.useWatch([listName, fieldMeta.name, 'session_id']);
  const prevDateRef = useRef(dateValue);

  console.log('SessionDateRow render:', {
    index,
    dateValue: dateValue?.format("YYYY-MM-DD"),
    sessionValue,
    formValue: form.getFieldValue([listName, fieldMeta.name, 'session_id'])
  });

  // Call getAvailableSessions when date changes to trigger store update
  // Reset session value when date changes or is cleared
  useEffect(() => {
    const prevDate = prevDateRef.current;
    console.log('SessionDateRow useEffect:', {
      index,
      prevDate: prevDate?.format("YYYY-MM-DD"),
      dateValue: dateValue?.format("YYYY-MM-DD")
    });

    if (!dateValue) {
      if (prevDate) {
        console.log('Clearing session_id because dateValue is null');
        form.setFieldValue([listName, fieldMeta.name, 'session_id'], undefined);
      }
      prevDateRef.current = dateValue;
      return;
    }

    // Fetch when this row's day changes (the shared list may hold another row's day)
    const dateStr = dateValue.format("YYYY-MM-DD");
    if (lastFetchedRef.current !== dateStr) {
      lastFetchedRef.current = dateStr;
      getAvailableSessions(dateValue, null, 'booking');
    }

    // Reset session select if date changed and was not previously null/undefined
    if (prevDate && !dateValue.isSame(prevDate, 'day')) {
      console.log('Resetting session_id because date changed');
      form.setFieldValue([listName, fieldMeta.name, 'session_id'], undefined);
    }

    prevDateRef.current = dateValue;
  }, [dateValue, getAvailableSessions, form, listName, fieldMeta.name]);

  // availableSessions is shared by every row and holds the last date fetched, so keep
  // only this row's weekday — otherwise a row can pair its date with another day's session
  const rowSessions = dateValue
    ? (availableSessions || []).filter((session) => session.weekDay === dateValue.day())
    : [];
  const formattedSessions = formatSessions(rowSessions);

  // Reload this row's date when its dropdown opens (another row may have replaced the list)
  const handleDropdownOpen = (open) => {
    if (open && dateValue) getAvailableSessions(dateValue, null, 'booking');
  };
  const selectedSessionData = formattedSessions.find(s => s.value === sessionValue);
  const { user } = userStore();

  return (
    <Card
      size="small"
      className="bg-stone-50"
      style={{ border: "1px solid #e0e0e0" }}
    >
      <Row gutter={[12, 12]} align="middle">
        {/* Date Picker */}
        <Col xs={24} sm={12} md={10}>
          <Form.Item
            name={[fieldMeta.name, 'date']}
            autoComplete="off"
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarOutlined /> Start Date
              </span>
            }
            rules={[{ required: true, message: "Please select a date" }]}
            className='mb-0'
          >
            <DatePicker
              placeholder={"Select date"}
              className={"w-full"}

            />
          </Form.Item>
        </Col>

        {/* Session Selector */}
        <Col xs={24} sm={12} md={12}>
          <Form.Item
            name={[fieldMeta.name, 'session_id']}
            autoComplete="off"
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClockCircleOutlined /> Session
              </span>
            }
            rules={[{ required: true, message: "Please select a session" }]}
            style={{ marginBottom: 0 }}
          >
            <Select
              value={sessionValue}
              placeholder="Select a session"
              options={formattedSessions}
              aria-autocomplete='false'
              showSearch
              loading={loading}
              disabled={!dateValue}
              onDropdownVisibleChange={handleDropdownOpen}
              filterOption={(inputValue, option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              }
              optionRender={(option) => {
                return sessionSlotOptionRenderer(option, user, true, countMode)
              }}
              notFoundContent={
                loading ? (
                  <div className="flex gap-2 items-center p-2">
                    <Spin size="small" />
                    <span>Loading sessions...</span>
                  </div>
                ) : !dateValue ? (
                  "Select a date first"
                ) : formattedSessions.length === 0 ? (
                  "No sessions available"
                ) : null
              }
            />
          </Form.Item>
        </Col>

        {/* Remove Button */}
        <Col xs={24} sm={24} md={2} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="text"
            danger
            icon={<MinusCircleOutlined style={{ fontSize: 18 }} />}
            onClick={() => onRemove(index)}
            disabled={totalItems <= minItems}
            title={totalItems <= minItems ? "Minimum item reached" : "Remove this date & session"}
          />
        </Col>

        {/* Display selected session details */}
        {dateValue && sessionValue && selectedSessionData && (
          <Col xs={24}>
            <div className="p-2 text-xs text-gray-600 bg-white rounded border border-gray-200">
              ✓ {dayjs(dateValue).format("ddd, MMM DD, YYYY")} - {selectedSessionData.label}
            </div>
          </Col>
        )}
      </Row>
    </Card>
  );
}

/**
 * SessionDateSelector Component
 * 
 * Manages multiple date-session pairs where each date has one session.
 * Uses Zustand store pattern: getAvailableSessions triggers store update,
 * availableSessions prop contains current store state.
 * 
 * @param {Object} props
 * @param {string} props.name - Form field name for the session-date pairs array
 * @param {string} props.label - Label for the form item
 * @param {Function} props.getAvailableSessions - Store action to fetch sessions for a date
 * @param {Array} props.availableSessions - Sessions from store (updated by getAvailableSessions)
 * @param {boolean} props.loading - Loading state for session fetching
 * @param {number} props.maxItems - Maximum number of date-session pairs (default: Infinity)
 * @param {number} props.minItems - Minimum number of date-session pairs (default: 1)
 * @param {string} props.countMode - "day" (default) or "batch": which slot count staff see first
 */
function SessionDateSelector({
  name,
  label = "Session Schedule",
  getAvailableSessions,
  availableSessions = [],
  loading = false,
  maxItems = Infinity,
  minItems = 1,
  countMode = 'day',
}) {
  return (
    <Form.List name={name}>
      {(listFields, { add, remove }) => {
        const handleAdd = () => {
          if (listFields.length < maxItems) {
            add({ date: dayjs(), session_id: null });
          }
        };

        const handleRemove = (index) => {
          remove(index);
        };

        return (
          <Form.Item label={label}>
            <Space direction="vertical" size="middle" className="w-full">
              {listFields.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No session dates added"
                  style={{ marginTop: 24, marginBottom: 24 }}
                />
              ) : (
                listFields.map((fieldMeta, index) => (
                  <SessionDateRow
                    key={fieldMeta.key}
                    fieldMeta={fieldMeta}
                    index={index}
                    onRemove={handleRemove}
                    getAvailableSessions={getAvailableSessions}
                    availableSessions={availableSessions}
                    loading={loading}
                    minItems={minItems}
                    totalItems={listFields.length}
                    listName={name}
                    countMode={countMode}
                  />
                ))
              )}

              <Button
                block
                type="dashed"
                onClick={handleAdd}
                disabled={listFields.length >= maxItems}
                icon={<PlusCircleOutlined />}
              >
                Add Another Date & Session
              </Button>
            </Space>
          </Form.Item>
        );
      }}
    </Form.List>
  );
}

SessionDateSelector.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  getAvailableSessions: PropTypes.func.isRequired,
  availableSessions: PropTypes.array,
  loading: PropTypes.bool,
  maxItems: PropTypes.number,
  minItems: PropTypes.number,
  countMode: PropTypes.oneOf(['day', 'batch']),
};

SessionDateSelector.defaultProps = {
  label: "Session Schedule",
  availableSessions: [],
  loading: false,
  maxItems: Infinity,
  minItems: 1,
};

export default SessionDateSelector;

import { Form, Button, Space, Card, Row, Col, Select, Empty, Tag, Spin, Flex, DatePicker } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import CustomDatePicker from '@components/form/CustomDatePicker';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ROLES } from '@utils/constants';
import userStore from '@stores/UserStore';

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
 * Shows remaining slots and additional slots with color coding
 */
export const sessionSlotOptionRenderer = (option, user, showSlotCount = true) => {
  const { data: session } = option.data;
  if (!session) return null;

  const { remainingSlots: regularRemainingSLots = 0, additional = 0, effectiveRemainingSlots: totalRemainingSlots = 0 } = session;
  const weekday = weekDays[session.weekDay];
  const time = dayjs(session.start_time).format('h:mm A');
  const remainingSlots = user.role === ROLES.STUDENT ? totalRemainingSlots : regularRemainingSLots

  // Determine color based on remaining slots
  let slotColor = 'green';
  if (remainingSlots <= 5) slotColor = 'orange';
  if (remainingSlots <= 2) slotColor = 'red';

  return (
    <Flex direction="vertical" justify="space-between" align="center" size={2} style={{ width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.05em', fontWeight: 'bold', margin: 0 }}>{weekday}</p>
        <p style={{ fontWeight: "bold", margin: 0 }}>{time}</p>
      </div>
      {showSlotCount && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Tag
            color={slotColor}
            style={{
              fontWeight: 600,
              borderRadius: 4,
              marginRight: 0
            }}
          >
            {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} left
          </Tag>
          {(additional > 0 && user.role === ROLES.MANAGER) && (
            <Tag
              color='gold'
              style={{
                fontWeight: 600,
                borderRadius: 4,
                marginRight: 0
              }}
            >
              + {additional}
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
}) {
  const hasCalledRef = useRef(new Set()); // Track dates we've already triggered

  const dateValue = Form.useWatch(['sessionSchedule', fieldMeta.name, 'date']);
  const sessionValue = Form.useWatch(['sessionSchedule', fieldMeta.name, 'session_id']);

  // Call getAvailableSessions when date changes to trigger store update
  useEffect(() => {
    if (!dateValue) return;

    const dateStr = dateValue.format("YYYY-MM-DD");

    // Only call once per unique date to avoid duplicate calls
    if (!hasCalledRef.current.has(dateStr)) {
      hasCalledRef.current.add(dateStr);
      getAvailableSessions(dateValue);
    }
  }, [dateValue, getAvailableSessions]);

  // Format available sessions for Select component
  const formattedSessions = formatSessions(availableSessions);
  const selectedSessionData = formattedSessions.find(s => s.value === sessionValue);
  const { user } = userStore()

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
              placeholder="Select a session"
              options={formattedSessions}
              aria-autocomplete='false'
              showSearch
              loading={loading}
              disabled={!dateValue || formattedSessions.length === 0}
              filterOption={(inputValue, option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              }
              optionRender={(option) => {
                return sessionSlotOptionRenderer(option, user)
              }}
              notFoundContent={
                loading ? (
                  <div className="flex items-center gap-2 p-2">
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
            <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
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
 */
function SessionDateSelector({
  name,
  label = "Session Schedule",
  getAvailableSessions,
  availableSessions = [],
  loading = false,
  maxItems = Infinity,
  minItems = 1,
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
};

SessionDateSelector.defaultProps = {
  label: "Session Schedule",
  availableSessions: [],
  loading: false,
  maxItems: Infinity,
  minItems: 1,
};

export default SessionDateSelector;

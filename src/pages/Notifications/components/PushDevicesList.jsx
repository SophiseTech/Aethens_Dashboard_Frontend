import PropTypes from 'prop-types';
import { Button, List, Spin, Tag, Typography } from 'antd';
import { DesktopOutlined } from '@ant-design/icons';
import { formatDate } from '@utils/helper';

const { Text } = Typography;

export default function PushDevicesList({ devices, currentEndpoint, loading, removingEndpoint, onRemove }) {
  if (loading) {
    return (
      <div className="py-4 text-center">
        <Spin size="small" />
      </div>
    );
  }

  if (!devices.length) {
    return <Text type="secondary" className="text-xs">Your account is not receiving notifications on any device.</Text>;
  }

  return (
    <List
      size="small"
      dataSource={devices}
      renderItem={(device) => (
        <List.Item
          actions={[
            <Button
              key="remove"
              size="small"
              danger
              loading={removingEndpoint === device.endpoint}
              onClick={() => onRemove(device.endpoint)}
            >
              Remove
            </Button>,
          ]}
        >
          <List.Item.Meta
            avatar={<DesktopOutlined className="text-lg text-gray-500" />}
            title={
              <span className="flex items-center gap-2">
                {device.deviceLabel || 'Unknown device'}
                {device.endpoint === currentEndpoint && <Tag color="blue">This device</Tag>}
              </span>
            }
            description={<Text type="secondary" className="text-xs">Last seen {formatDate(device.lastSeenAt)}</Text>}
          />
        </List.Item>
      )}
    />
  );
}

PushDevicesList.propTypes = {
  devices: PropTypes.arrayOf(
    PropTypes.shape({
      endpoint: PropTypes.string.isRequired,
      deviceLabel: PropTypes.string,
      lastSeenAt: PropTypes.string,
    })
  ).isRequired,
  currentEndpoint: PropTypes.string,
  loading: PropTypes.bool,
  removingEndpoint: PropTypes.string,
  onRemove: PropTypes.func.isRequired,
};

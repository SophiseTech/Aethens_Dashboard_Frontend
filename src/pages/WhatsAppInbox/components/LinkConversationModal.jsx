import PropTypes from "prop-types";
import { Button, Empty, Input, List, Modal, Spin, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import useWhatsAppLink from "@hooks/useWhatsAppLink";

const { Text } = Typography;

function LinkConversationModal({ open, onClose, phone }) {
  const { search, setSearch, options, loading, linking, link } = useWhatsAppLink(open, onClose);

  return (
    <Modal title="Link to enquiry or student" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <div className="flex flex-col gap-3">
        <Text type="secondary">
          {phone} isn&apos;t linked to anyone yet. Search by name or phone and pick the right record.
        </Text>
        <Input
          autoFocus
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading ? (
          <div className="flex justify-center py-6">
            <Spin />
          </div>
        ) : (
          <List
            size="small"
            dataSource={options}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={search.trim().length < 2 ? "Type at least 2 characters" : "No matches"}
                />
              ),
            }}
            renderItem={(option) => (
              <List.Item
                actions={[
                  <Button key="link" size="small" type="primary" loading={linking} onClick={() => link(option)}>
                    Link
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <span className="flex items-center gap-2">
                      <Tag color={option.type === "Student" ? "green" : "blue"} className="!mr-0">
                        {option.type}
                      </Tag>
                      {option.title}
                    </span>
                  }
                  description={option.subtitle}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  );
}

LinkConversationModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  phone: PropTypes.string,
};

export default LinkConversationModal;

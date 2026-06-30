import { Drawer, Descriptions, Tag, Spin, Typography, Divider, Image } from "antd";
import { FileOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import PropTypes from "prop-types";

const { Text, Link } = Typography;

const STATUS_COLORS = {
  pending: "orange",
  confirmed: "green",
  rejected: "red",
  reviewed: "blue",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Approved",
  rejected: "Rejected",
  reviewed: "Reviewed",
};

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function BatchSchedule({ batch }) {
  if (!batch) return <Text type="secondary">—</Text>;

  const days = batch.weekDays?.length
    ? [...batch.weekDays].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
    : [];

  return (
    <div className="flex flex-col gap-2">
      <Text>{batch.name}</Text>
      {(batch.start_time || batch.end_time) && (
        <Text type="secondary" className="text-xs">
          {batch.start_time ? dayjs(batch.start_time).format("hh:mm A") : "—"}
          {" – "}
          {batch.end_time ? dayjs(batch.end_time).format("hh:mm A") : "—"}
        </Text>
      )}
      {days.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {days.map((day) => (
            <Tag key={day} className="text-xs">{day}</Tag>
          ))}
        </div>
      )}
    </div>
  );
}

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i;

function isImage(url) {
  return IMAGE_EXTENSIONS.test(url);
}

function DocumentItem({ doc }) {
  const label = doc.documentType || doc.fileName || "Document";
  const tag = doc.mandatory
    ? <Tag color="red" className="text-xs">Required</Tag>
    : <Tag color="default" className="text-xs">Optional</Tag>;

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2">
        <Text className="text-sm font-medium">{label}</Text>
        {tag}
      </div>
      {isImage(doc.fileUrl) ? (
        <Image
          src={doc.fileUrl}
          alt={label}
          width={180}
          className="rounded border border-gray-200 object-cover"
          preview={{ src: doc.fileUrl }}
        />
      ) : (
        <div className="flex items-center gap-1">
          <FileOutlined className="text-gray-400 text-xs" />
          <Link href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm">
            {doc.fileName || "View file"}
          </Link>
        </div>
      )}
    </div>
  );
}

function DocumentList({ documents }) {
  if (!documents?.length) {
    return <Text type="secondary">No documents uploaded</Text>;
  }
  return (
    <div className="flex flex-col">
      {documents.map((doc) => (
        <DocumentItem key={doc._id} doc={doc} />
      ))}
    </div>
  );
}

function ApplicationDrawer({ open, application, loading, onClose }) {
  return (
    <Drawer
      title="Application Details"
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
    >
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
        </div>
      ) : application ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Text className="text-lg font-semibold">{application.name}</Text>
            <Tag color={STATUS_COLORS[application.status] ?? "default"}>
              {STATUS_LABELS[application.status] ?? application.status}
            </Tag>
          </div>

          <Divider className="my-0" />

          <Descriptions column={1} size="small" labelStyle={{ fontWeight: 500, width: 130 }}>
            <Descriptions.Item label="Phone">{application.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label="Location">{application.location}</Descriptions.Item>
            <Descriptions.Item label="Address">{application.address}</Descriptions.Item>
            <Descriptions.Item label="Applied On">
              {dayjs(application.createdAt).format("DD MMM YYYY, hh:mm A")}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" className="text-sm font-medium">Preferred Batch</Divider>

          <BatchSchedule batch={application.preferredBatch} />

          <Divider orientation="left" className="text-sm font-medium">Documents</Divider>

          <DocumentList documents={application.documents} />
        </div>
      ) : null}
    </Drawer>
  );
}

ApplicationDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  application: PropTypes.object,
  loading: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

BatchSchedule.propTypes = {
  batch: PropTypes.object,
};

DocumentItem.propTypes = {
  doc: PropTypes.object.isRequired,
};

DocumentList.propTypes = {
  documents: PropTypes.array,
};

export default ApplicationDrawer;

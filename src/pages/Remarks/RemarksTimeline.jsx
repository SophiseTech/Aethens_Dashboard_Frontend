import PropTypes from "prop-types";
import { Avatar, Card, Empty, Tag, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";

/**
 * Single remark item in timeline — enhanced with role color and extra details
 */
function RemarkItem({ remark }) {
  const role = (remark.author?.role || remark.role || "unknown").toLowerCase();
  const ROLE_COLORS = {
    admin: "#E55350",
    manager: "#2B90FF",
    faculty: "#3DBE7D",
    parent: "#F6AD55",
    default: "#6B7280",
  };
  const color = ROLE_COLORS[role] || ROLE_COLORS.default;
  const message = remark.message || remark.text || "";

  return (
    <Card className="mb-3 shadow-sm overflow-hidden" size="small" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="flex items-start gap-3">
        <Avatar size={48} src={remark.author?.avatar} style={{ backgroundColor: color }}>
          {!remark.author?.avatar && (remark.initials || <UserOutlined />)}
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold">{remark.author?.name || "Unknown"}</div>
              <div className="flex items-center gap-2 mt-1">
                <Tag color={color} style={{ textTransform: "capitalize", padding: "0 8px" }}>{role}</Tag>
                <div className="text-xs text-gray-500">{remark.author?._id ? `id: ${remark.author._id}` : ""}</div>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              <Tooltip title={remark.createdAt || remark.formattedDate || ""}>
                <span>{remark.formattedDate}</span>
              </Tooltip>
            </div>
          </div>

          <div className="text-sm whitespace-pre-wrap mb-2">{message}</div>

          <div className="text-xs text-gray-400 flex gap-4">
            <div>{message ? `${message.split(/\s+/).length} words` : ""}</div>
            <div>{message ? `${message.length} chars` : ""}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
RemarkItem.propTypes = {
  remark: PropTypes.object.isRequired,
};

export default function RemarksTimeline({ remarks }) {
  if (!remarks || remarks.length === 0) {
    return <Empty description="No remarks yet" />;
  }

  return (
    <div className="remarks-timeline">
      {remarks.map((r) => (
        <RemarkItem key={r._id} remark={r} />
      ))}
    </div>
  );
}
RemarksTimeline.propTypes = {
  remarks: PropTypes.array,
};

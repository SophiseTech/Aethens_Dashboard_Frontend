import PropTypes from "prop-types";
import { Avatar, Card, Empty, Tag, Tooltip, Popconfirm, Button } from "antd";
import { UserOutlined, DeleteOutlined } from "@ant-design/icons";
import useUser from "@hooks/useUser";

/**
 * Single remark item in timeline — enhanced with role color and extra details
 */
function RemarkItem({ remark, onDelete }) {
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
  const { user } = useUser()

  const canDelete = user && (user.role === "admin" || user._id === remark.author?._id);

  return (
    <Card className="mb-3 shadow-sm overflow-hidden" size="small" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="flex items-start gap-3">
        <Avatar size={48} src={remark.author?.avatar} style={{ backgroundColor: color }}>
          {!remark.author?.avatar && (remark.initials || <UserOutlined />)}
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold">{remark.author?.username || "Unknown"}</div>
              <div className="flex items-center gap-2 mt-1">
                <Tag color={color} style={{ textTransform: "capitalize", padding: "0 8px" }}>{role}</Tag>
                {/* <div className="text-xs text-gray-500">{remark.author?._id ? `id: ${remark.author._id}` : ""}</div> */}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Tooltip title={remark.createdAt || remark.formattedDate || ""}>
                <span>{remark.formattedDate}</span>
              </Tooltip>

              {canDelete && onDelete && (
                <Popconfirm title="Delete this remark?" okText="Delete" cancelText="Cancel" placement="left" onConfirm={() => onDelete(remark._id)}>
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              )}
            </div>
          </div>

          <div className="text-sm whitespace-pre-wrap mb-2">{message}</div>
        </div>
      </div>
    </Card>
  );
}
RemarkItem.propTypes = {
  remark: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
};

export default function RemarksTimeline({ remarks, onDelete }) {
  if (!remarks || remarks.length === 0) {
    return <Empty description="No remarks yet" />;
  }

  return (
    <div className="remarks-timeline">
      {remarks.map((r) => (
        <RemarkItem key={r._id} remark={r} onDelete={onDelete} />
      ))}
    </div>
  );
}
RemarksTimeline.propTypes = {
  remarks: PropTypes.array,
  onDelete: PropTypes.func,
};

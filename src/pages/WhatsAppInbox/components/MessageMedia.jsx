import PropTypes from "prop-types";
import { Button, Image, Spin, Typography } from "antd";
import { FileOutlined, LoadingOutlined, WarningOutlined } from "@ant-design/icons";
import useWhatsAppMedia from "@hooks/useWhatsAppMedia";

const { Text } = Typography;

const KIND_LABELS = { image: "Photo", sticker: "Sticker", audio: "Voice message", video: "Video", document: "Document" };

function MessageMedia({ message }) {
  const { media, url, loading, failed, pending, open } = useWhatsAppMedia(message);
  const label = media.filename || KIND_LABELS[media.kind] || "File";

  if (pending) {
    return (
      <Text type="secondary" className="text-xs flex items-center gap-1">
        <LoadingOutlined /> Saving {label.toLowerCase()}…
      </Text>
    );
  }

  if (failed) {
    return (
      <Button size="small" icon={<WarningOutlined />} onClick={open} loading={loading}>
        {label} not downloaded, try again
      </Button>
    );
  }

  if (["image", "sticker"].includes(media.kind)) {
    return url ? (
      <Image src={url} alt={label} className="rounded max-w-[240px] max-h-[320px] object-cover" />
    ) : (
      <div className="w-40 h-28 flex items-center justify-center bg-gray-100 rounded">
        <Spin size="small" />
      </div>
    );
  }

  if (media.kind === "audio") {
    return url ? <audio controls src={url} className="max-w-[260px]" /> : <Spin size="small" />;
  }

  if (media.kind === "video") {
    return url ? <video controls src={url} className="rounded max-w-[260px] max-h-[320px]" /> : <Spin size="small" />;
  }

  return (
    <Button size="small" icon={<FileOutlined />} onClick={open} loading={loading}>
      {label}
    </Button>
  );
}

MessageMedia.propTypes = {
  message: PropTypes.object.isRequired,
};

export default MessageMedia;

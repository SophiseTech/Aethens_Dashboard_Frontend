import { UserOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import PropTypes from "prop-types";
import UserDetailsDrawer from "@components/UserDetailsDrawer";

function StudentContextHoverDrawer({
  enabled = false,
  open = false,
  onOpen = () => {},
  onClose = () => {},
  student = null,
}) {
  if (!enabled || !student?._id) return null;

  return (
    <>
      {!open && (
        <Tooltip title="Open Student Drawer" placement="left">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<UserOutlined />}
            onClick={onOpen}
            style={{
              position: "fixed",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1000,
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.18)",
            }}
          />
        </Tooltip>
      )}
      <UserDetailsDrawer
        user={student}
        visible={open}
        onClose={onClose}
        isStudentDetail
      />
    </>
  );
}

StudentContextHoverDrawer.propTypes = {
  enabled: PropTypes.bool,
  open: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  student: PropTypes.object,
};

export default StudentContextHoverDrawer;


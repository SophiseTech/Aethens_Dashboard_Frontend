import { useEffect, useState } from "react";
import { Button, Typography, Avatar, Skeleton } from "antd";
import useRemarks from "@hooks/useRemarks";
import { get } from "@utils/Requests";
import RemarksTimeline from "./RemarksTimeline";
import AddRemarkModal from "./AddRemarkModal";
import { useParams } from "react-router-dom";
import useModal from "@hooks/useModal";
import useUser from "@hooks/useUser";

const { Title } = Typography;

export default function StudentRemarksPage() {
  const { studentId } = useParams();

  const [adding, setAdding] = useState(false);
  const { remarks, loading, page, limit, total, fetchStudentRemarks, addRemark, deleteRemark, student } = useRemarks();
  const modal = useModal();
  const user = useUser()


  useEffect(() => {
    if (studentId) {
      fetchStudentRemarks(studentId, 1, 10);
    }
  }, [studentId, fetchStudentRemarks]);

  const handleAdd = async (values) => {
    if (!studentId) return;
    setAdding(true);
    values.role = user?.role
    values.studentId = studentId
    await addRemark(values);
    await fetchStudentRemarks(studentId, 1, 10);
    setAdding(false);
    modal.handleCancel();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Title level={4}>Student Remarks</Title>
        <Button type="primary" onClick={() => modal.showModal()}>Add Remark</Button>
      </div>

      {/* Student details */}
      <div className="mb-4">
        <div className="flex items-center gap-4 p-3 bg-white rounded border shadow-sm max-w-sm">
          {loading ? (
            <Skeleton active avatar paragraph={false} />
          ) : (
            <>
              <Avatar size={48} src={student?.profile_img}>
                {(!student?.profile_img) && (student?.username || student?.name || "U").split(" ").map(n => n[0]).slice(0, 2).join("")}
              </Avatar>
              <div>
                <div className="font-medium">{student?.username || student?.name || "Unknown Student"}</div>
                <div className="text-sm text-gray-500">{student?.email || "—"}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <RemarksTimeline remarks={remarks} onDelete={deleteRemark} />

      <AddRemarkModal
        visible={modal.isModalOpen}
        onCancel={() => modal.handleCancel()}
        onAdd={handleAdd}
        adding={adding}
      />
    </div>
  );
}

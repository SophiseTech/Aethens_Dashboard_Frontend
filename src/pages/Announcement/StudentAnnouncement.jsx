import { Spin, Empty } from "antd";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import useStudentAnnouncements from "@hooks/useStudentAnnouncements";
import { formatDate } from "@utils/helper";
import TitleLayout from "@components/layouts/Title";

const isRecent = (date) => {
  if (!date) return false;
  const days = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 3;
};

const FeaturedCard = ({ announcement }) => (
  <div className="p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden bg-radialCardGradient text-white">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <img src="/icons/megaphone.svg" className="w-6 h-6" alt="" />
        <span className="font-bold text-xs uppercase tracking-wide opacity-80">
          Latest Announcement
        </span>
      </div>
      {isRecent(announcement.created_at) && (
        <span className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
          New
        </span>
      )}
    </div>

    <div>
      <h2 className="font-bold text-lg 2xl:text-2xl">{announcement.title}</h2>
      <p className="mt-2 opacity-90 whitespace-pre-line">{announcement.body}</p>
    </div>

    <div className="flex items-center gap-4 text-xs opacity-80 pt-2 border-t border-white/20">
      <span className="flex items-center gap-1">
        <CalendarOutlined />
        {announcement.created_at ? formatDate(new Date(announcement.created_at)) : "-"}
      </span>
      {announcement.expires_at && (
        <span className="flex items-center gap-1">
          <ClockCircleOutlined />
          Expires {formatDate(new Date(announcement.expires_at))}
        </span>
      )}
    </div>

    <img
      src="/icons/target_lite.svg"
      alt=""
      className="absolute -right-10 -bottom-10 opacity-50"
    />
  </div>
);

const AnnouncementCard = ({ announcement }) => (
  <div className="p-5 rounded-3xl border border-border bg-white flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <h3 className="font-bold text-primary line-clamp-2">{announcement.title}</h3>
      {isRecent(announcement.created_at) && (
        <span className="shrink-0 bg-accent text-primary text-xs font-bold px-2 py-0.5 rounded-full">
          New
        </span>
      )}
    </div>

    <p className="text-gray-500 text-sm whitespace-pre-line">{announcement.body}</p>

    <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-border mt-auto">
      <span className="flex items-center gap-1">
        <CalendarOutlined />
        {announcement.created_at ? formatDate(new Date(announcement.created_at)) : "-"}
      </span>
      {announcement.expires_at && (
        <span className="flex items-center gap-1">
          <ClockCircleOutlined />
          Expires {formatDate(new Date(announcement.expires_at))}
        </span>
      )}
    </div>
  </div>
);

const StudentAnnouncement = () => {
  const { announcements, loading } = useStudentAnnouncements();
  const [featured, ...rest] = announcements;

  return (
    <TitleLayout title="Announcements">
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Spin size="large" />
        </div>
      ) : announcements.length === 0 ? (
        <Empty description="No active announcements" className="m-auto" />
      ) : (
        <div className="flex flex-col gap-5">
          {featured && <FeaturedCard announcement={featured} />}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {rest.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id || announcement._id}
                  announcement={announcement}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </TitleLayout>
  );
};

export default StudentAnnouncement;

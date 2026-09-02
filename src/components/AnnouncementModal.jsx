import { useMemo, useState } from "react";
import { Modal, Checkbox, Button } from "antd";
import dayjs from "dayjs";
import useUser from "@hooks/useUser";

// One-off in-app announcement. Self-contained on purpose — when the event is
// over, delete this file and its mount in components/layouts/Sidebar.jsx.
const STORAGE_KEY = "announcement:onam-hsr-2026";
// Stop showing after the event day (4th Sep 2026), end of day IST.
const EXPIRES_AT = "2026-09-04T23:59:59+05:30";
const FORM_URL = "https://forms.gle/g5WvWYjmwWvi84hr6";

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
}

export default function AnnouncementModal() {
  const { user } = useUser();
  const expired = useMemo(() => dayjs().isAfter(dayjs(EXPIRES_AT)), []);
  const [open, setOpen] = useState(() => !readDismissed() && !expired);
  const [dontShowAgain, setDontShowAgain] = useState(readDismissed);

  if (!user || expired) return null;

  const handleDontShowAgain = (e) => {
    const { checked } = e.target;
    setDontShowAgain(checked);
    try {
      if (checked) localStorage.setItem(STORAGE_KEY, "dismissed");
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors (quota exceeded, private mode, etc.)
    }
  };

  const close = () => setOpen(false);

  return (
    <Modal
      open={open}
      onCancel={close}
      centered
      width={560}
      title="🎉 Onam Celebration — HSR Branch"
      footer={[
        <Checkbox
          key="dsa"
          checked={dontShowAgain}
          onChange={handleDontShowAgain}
          className="float-left"
        >
          I&apos;ve already filled the form — don&apos;t show this again
        </Checkbox>,
        <Button key="form" type="primary" href={FORM_URL} target="_blank" rel="noreferrer">
          Fill the Google Form
        </Button>,
        <Button key="close" onClick={close}>
          Close
        </Button>,
      ]}
    >
      <div className="space-y-3 text-[13px] leading-relaxed">
        <p>
          <strong>Greetings from School of Athens Fine Art Academy!</strong>
        </p>
        <p>
          We are delighted to invite all our{" "}
          <strong>students, parents, family members, and well-wishers</strong> to join us for the
          Onam celebration at our <strong>HSR Branch</strong>! 🎉
        </p>
        <p>
          Let&apos;s come together to celebrate, enjoy, and create wonderful memories as one School
          of Athens family. ❤️🎨
        </p>
        <ul className="list-none space-y-1 pl-0">
          <li>
            📅 <strong>Date:</strong> Friday, 4th September 2026
          </li>
          <li>
            ⏰ <strong>Time:</strong> 9:00 AM to 2:00 PM
          </li>
          <li>
            📍 <strong>Venue:</strong> School of Athens Fine Art Academy – HSR Branch
          </li>
        </ul>
        <p>
          👨‍👩‍👧‍👦 <strong>All are welcome!</strong> Students are encouraged to bring their{" "}
          <strong>family members</strong> and be part of the celebration.
        </p>
        <p>
          📝 <strong>Participation Confirmation:</strong> Kindly confirm your participation by
          filling out the Google Form below before <strong>2nd September 2026</strong>:
        </p>
        <p>
          🔗{" "}
          <a href={FORM_URL} target="_blank" rel="noreferrer">
            {FORM_URL}
          </a>
        </p>
        <p>We look forward to celebrating this special occasion with you and your family! 🌟</p>
        <p className="mb-0">
          <strong>Warm Regards,</strong>
          <br />
          <strong>School of Athens Fine Art Academy</strong>
        </p>
      </div>
    </Modal>
  );
}

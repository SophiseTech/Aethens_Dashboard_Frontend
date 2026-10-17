import dayjs from "dayjs";

// "5h 12m left" for the 24-hour free-text reply window.
export function formatWindowRemaining(ms) {
  const totalMinutes = Math.max(Math.floor(ms / 60000), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

// Conversation list time: clock time today, weekday this week, else the date.
export function formatListTime(date) {
  if (!date) return "";
  const value = dayjs(date);
  const now = dayjs();
  if (value.isSame(now, "day")) return value.format("h:mm A");
  if (now.diff(value, "day") < 7) return value.format("ddd");
  return value.format("DD MMM YY");
}

export const formatMessageTime = (date) => (date ? dayjs(date).format("DD MMM, h:mm A") : "");

// Which record a conversation is linked to, for the tag next to its name.
export function conversationLinkTag(conversation) {
  if (conversation?.student) return { label: "Student", color: "green" };
  if (conversation?.enquiry) {
    const number = conversation.enquiry.enquiryNumber ? ` #${conversation.enquiry.enquiryNumber}` : "";
    return { label: `Enquiry${number}`, color: "blue" };
  }
  return { label: "Not linked", color: "default" };
}

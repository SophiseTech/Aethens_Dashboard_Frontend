import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import _ from "lodash";
import React from "react";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date) => {
  if (!date) return "";
  // Add 5 hours 30 minutes to convert to UTC+5:30, then format
  return dayjs(date)
    .tz("Asia/Kolkata")
    .format("D MMM, YYYY");
};

export const formatTime = (time) => {
  if (!time) return ""

  return dayjs(time).format("h:mm A")
};

export const calculateAge = (dob) => {
    if (!dob) return null;

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

export const groupActivities = (activities) => {
  if (!activities) return {}

  // Get today's, yesterday's, and reference dates
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  return activities.reduce((groups, item) => {
    const assignedDate = new Date(item.assigned_date);
    const formattedDate = formatDate(assignedDate);

    if (formatDate(today) === formattedDate) {
      groups["Today"] = groups["Today"] || [];
      groups["Today"].push(item);
    } else if (formatDate(yesterday) === formattedDate) {
      groups["Yesterday"] = groups["Yesterday"] || [];
      groups["Yesterday"].push(item);
    } else {
      groups[formattedDate] = groups[formattedDate] || [];
      groups[formattedDate].push(item);
    }

    return groups;
  }, {});
}

export function groupByMonthName(data) {
  // Step 1: Group by "Month Year"
  const groupedData = data.reduce((groups, item) => {
    const monthName = dayjs(item.start_date).format('MMMM YYYY');
    if (!groups[monthName]) {
      groups[monthName] = [];
    }
    groups[monthName].push(item);
    return groups;
  }, {});

  // Step 2: Sort each group
  Object.values(groupedData).forEach(group => {
    group.sort((a, b) => {
      const dateComparison = dayjs(a?.start_date).unix() - dayjs(b?.start_date).unix();
      if (dateComparison !== 0) return dateComparison;
      return dayjs(a.session?.start_time).unix() - dayjs(b.session?.start_time).unix();
    });
  });

  // Step 3: Sort the groupedData by month-year key chronologically
  const sortedGroupedData = Object.fromEntries(
    Object.entries(groupedData).sort(([a], [b]) =>
      dayjs(a, 'MMMM YYYY').unix() - dayjs(b, 'MMMM YYYY').unix()
    )
  );

  return sortedGroupedData;
}


export function groupByField(data, field, initial = {}) {
  return data.reduce((groups, item) => {
    if (!groups[item[field]]) {
      groups[item[field]] = []; // Initialize group if not present
    }
    groups[item[field]].push(item); // Add the item to the respective group
    return groups;
  }, initial);
}

export const sumFromObjects = (array, field) =>
  Number(array.reduce((acc, curr) => acc + (Number(curr[field]) || 0), 0).toFixed(2));


export function getValue(obj, keys) {
  const reducedKeys = keys.reduce((acc, key) => {
    // Return undefined if the accumulator is null or undefined at any level
    return acc && acc[key] !== undefined ? acc[key] : "";
  }, obj);
  return (_.isObject(reducedKeys) && !React.isValidElement(reducedKeys)) ? "" : reducedKeys
}

export const getMonthRange = (date) => {
  const firstDay = dayjs(date).startOf('month').format('YYYY-MM-DD');
  const lastDay = dayjs(date).endOf('month').format('YYYY-MM-DD');
  return { firstDay, lastDay };
};

export function formatFileSize(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export const getNextAvailableWeekdayDate = (
  weekday,
  studentSlots = [],
  reschedulingSlot,
  targetSession
) => {
  // Determine baseDate: today if reschedulingSlot.start_date <= today, else reschedulingSlot.start_date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rescheduleDate = new Date(reschedulingSlot.start_date);
  rescheduleDate.setHours(0, 0, 0, 0);
  const baseDate = (rescheduleDate <= today) ? new Date(today) : new Date(rescheduleDate);

  // Extract hours and minutes from both times
  const [rescheduleHour, rescheduleMin] = new Date(reschedulingSlot.session.start_time)
    .toTimeString()
    .split(':')
    .map(Number);

  const [targetHour, targetMin] = new Date(targetSession.start_time)
    .toTimeString()
    .split(':')
    .map(Number);

  const maxIterations = 100;
  let offset = (weekday - baseDate.getDay() + 7) % 7;
  let iterations = 0;

  while (iterations < maxIterations) {
    const candidate = new Date(baseDate);
    candidate.setDate(baseDate.getDate() + offset);
    candidate.setHours(targetHour, targetMin, 0, 0);
    const candidateDateStr = candidate.toDateString();
    const rescheduleDateStr = baseDate.toDateString();

    const isSameDay = candidateDateStr === rescheduleDateStr;

    // 🔒 Skip if same day but target time is not strictly later than reschedule time
    if (isSameDay) {
      const targetMinutes = targetHour * 60 + targetMin;
      const rescheduleMinutes = (rescheduleDate <= today)
        ? (today.getHours() * 60 + today.getMinutes())  // use current time
        : (rescheduleHour * 60 + rescheduleMin);

      if (targetMinutes <= rescheduleMinutes) {
        offset += 7;
        iterations++;
        continue;
      }
    }

    // ❌ Skip if student already has any slot on this date
    const hasConflict = studentSlots.some(slot => {
      const slotDate = new Date(slot.start_date);
      const slotTime = new Date(slot.session.start_time);

      const combinedSlotDateTime = new Date(slotDate);
      combinedSlotDateTime.setHours(slotTime.getHours(), slotTime.getMinutes(), 0, 0);

      return combinedSlotDateTime.toISOString() === candidate.toISOString();
    });

    if (!hasConflict) {
      return candidate;
    }

    offset += 7;
    iterations++;
  }

  throw new Error("No available weekday found within 100 weeks.");
};


export const getDiscount = (discount, rate, discountType) => {
  return (discountType === "percentage" || !discountType) ? rate - (rate * (discount / 100)) : rate - discount
}
export const getDiscountRate = (discount, rate, discountType) => {
  return (discountType === "percentage" || !discountType) ? (rate * (discount / 100)) : discount
}

export const downloadPdf = (ref, name) => {
  const input = ref.current;

  html2canvas(input, {
    scale: 2, // Increase scale for better quality
    useCORS: true, // Allow cross-origin images
    logging: true, // Enable logging for debugging
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${name}.pdf`); // Save the PDF with a filename
  });
};

export const isValidURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch (e) {
    console.log(str, "is not a valid url", "\n Error:", e);
    return false;
  }
};

export const isUserActive = (user) => {
  return user?.status === "active"
}

export function formatText(raw) {
  if (!raw) return "";

  return raw
    // Add newline BEFORE each numbered bullet (1. text OR 1.text)
    .replace(/(\d+\.)/g, "\n$1 ")
    // Add newline BEFORE dash bullets (- Bullet)
    .replace(/(-\s?)/g, "\n$1")
    // Add newline AFTER period only if letter before and letter after
    .replace(/(?<=[A-Za-z])\.(?=[A-Za-z])/g, ".\n")
    .trim();
}

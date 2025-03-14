import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import _, { initial } from "lodash";
import React from "react";

export const formatDate = (date) => {
  if (!date) return ""
  return dayjs(new Date(date).toISOString().split('T')[0]).format("D MMM, YYYY")
};

export const formatTime = (time) => {
  if (!time) return ""
  return dayjs(time).format("h:mm A")
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
  const groupedData = data.reduce((groups, item) => {
    const monthName = dayjs(item.start_date).format('MMMM'); // Get the full month name
    if (!groups[monthName]) {
      groups[monthName] = []; // Initialize group if not present
    }
    groups[monthName].push(item); // Add the item to the respective group
    return groups;
  }, {});

  // Sort each group by start_date first, then by session.start_time
  Object.keys(groupedData).forEach(month => {
    groupedData[month].sort((a, b) => {
      const dateComparison = dayjs(a?.start_date).unix() - dayjs(b?.start_date).unix();
      if (dateComparison !== 0) {
        return dateComparison;
      }
      return dayjs(a.session?.start_time).unix() - dayjs(b.session?.start_time).unix();
    });
  });

  return groupedData;
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

export const getNextWeekdayDate = (weekDay) => {
  const today = new Date();
  const daysUntilNext = (weekDay - today.getDay() + 7) % 7;
  const nextDate = new Date();
  nextDate.setDate(today.getDate() + daysUntilNext);
  return nextDate;
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
    return false;
  }
};
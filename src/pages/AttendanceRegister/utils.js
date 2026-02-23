// Utility functions for attendance register

export const StatusColors = {
  present: { color: '#52c41a', label: 'P', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  absent: { color: '#ff4d4f', label: 'A', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  leave: { color: '#faad14', label: 'L', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  excused: { color: '#1890ff', label: 'E', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  holiday: { color: '#999', label: 'H', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  no_slot: { color: '#999', label: 'NA' },
  upcoming: { color: '#4E739C', label: 'U' }
};

export const TypeConfigs = {
  regular: { label: "", prefix: "" },
  rescheduled: { label: "R", prefix: " | " },
  additional: { label: "A", prefix: " | " }
}

export function getConfig(status, type, isHoliday) {
  const statusConfig = StatusColors[status] || StatusColors.absent
  const typeConfig = TypeConfigs[type] || TypeConfigs.regular

  const color = isHoliday && status !== 'no_slot' ? 'rgb(249, 115, 22)' : statusConfig.color
  const label = `${statusConfig.label}${typeConfig.prefix}${typeConfig.label}`
  return {
    ...statusConfig,
    color,
    label,
    tooltip: `${isHoliday ? 'Holiday - ' : ''}${label}`
  }
}

/**
 * Calculate attendance statistics for students
 */
export function calculateAttendanceStats(attendanceData, students) {
  const stats = {};

  students.forEach(student => {
    const studentId = student.user_id || student._id;
    const records = student.attendance || {};

    const counts = {
      present: 0,
      absent: 0,
      leave: 0,
      excused: 0,
      holiday: 0
    };

    Object.values(records).forEach(record => {
      if (counts.hasOwnProperty(record?.status)) {
        counts[record?.status]++;
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const percentage = total > 0 ? ((counts.present / total) * 100).toFixed(2) : 0;

    stats[studentId] = {
      ...counts,
      total,
      percentage
    };
  });

  return stats;
}

/**
 * Export table data to CSV
 */
export function exportToCSV(data, filename = 'attendance-register.csv') {
  const csv = [];

  if (data.length === 0) return;
  console.log(data);


  // Extract all date keys (YYYY-MM-DD format) from the data
  const dateKeys = new Set();
  data.forEach(row => {
    Object.keys(row).forEach(key => {
      // Check if key is a date (YYYY-MM-DD format)
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
        dateKeys.add(key);
      }
    });
  });

  // Sort dates
  const sortedDateKeys = Array.from(dateKeys).sort();

  // Add headers
  const headers = ['S.No', 'Student Name', 'Email', 'Admission Number', 'Stats', ...sortedDateKeys];
  csv.push(headers.join(','));

  // Add data rows
  data.forEach(row => {
    const values = [
      row.index,
      row.username,
      row.email,
      row.admissionNumber,
      row.stats,
      ...sortedDateKeys.map(dateKey => {
        const record = row[dateKey];
        if (!record) return '-';
        const status = record?.status || 'no_slot';
        const typeConfig = TypeConfigs[record?.type] || TypeConfigs.regular;
        return StatusColors[status]?.label ? `${StatusColors[status]?.label}${typeConfig.prefix}${typeConfig.label}` : '-';
      })
    ];
    csv.push(values.map(v => `"${v}"`).join(','));
  });

  // Create blob and download
  const csvBlob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(csvBlob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get color configuration for a status
 */
export function getStatusColor(status) {
  return StatusColors[status] || StatusColors.absent;
}

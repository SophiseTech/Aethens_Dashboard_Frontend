// Utility functions for attendance register

export const StatusColors = {
  present: { color: '#52c41a', label: 'P', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  absent: { color: '#ff4d4f', label: 'A', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  leave: { color: '#faad14', label: 'L', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  excused: { color: '#1890ff', label: 'E', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  holiday: { color: '#999', label: 'H', bgColor: 'bg-gray-100', textColor: 'text-gray-700' }
};

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
  
  // Add headers
  const headers = ['S.No', 'Student Name', 'Email', 'Admission Number', ...Object.keys(data[0] || {}).filter(key => !['index', 'studentId', 'username', 'email', 'admissionNumber', 'key'].includes(key))];
  csv.push(headers.join(','));

  // Add data rows
  data.forEach(row => {
    const values = [
      row.index,
      row.username,
      row.email,
      row.admissionNumber,
      ...Object.keys(row).filter(key => !['index', 'studentId', 'username', 'email', 'admissionNumber', 'key'].includes(key)).map(key => {
        const status = row[key];
        return StatusColors[status]?.label || '-';
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

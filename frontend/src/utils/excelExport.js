import * as XLSX from 'xlsx';

/**
 * Exports group assignment data to an Excel file (.xlsx)
 * @param {Object} project - The project/groupTable object (module, title, etc.)
 * @param {Array} groups - The list of groups with their members
 */
export const exportGroupsToExcel = (project, groups) => {
  if (!project || !groups || !groups.length) {
    console.error('No data to export');
    return;
  }

  // Flatten the data for the sheet
  const rows = [];
  
  // Sort groups by group number
  const sortedGroups = [...groups].sort((a, b) => a.groupNumber - b.groupNumber);

  sortedGroups.forEach((group) => {
    const groupName = `Group ${String.fromCharCode(64 + group.groupNumber)}`;
    
    if (group.members && group.members.length > 0) {
      group.members.forEach((member) => {
        rows.push({
          'Group': groupName,
          'Student Name': member.user?.fullName || member.name || '—',
          'Student ID': member.user?.studentId || member.studentId || '—',
          'Email': member.user?.email || member.email || '—',
          'Phone': member.user?.phone || member.phone || '—',
          'Role': member.isLeader ? 'Leader' : 'Member',
          'Join Method': member.joinMethod || '—'
        });
      });
    } else {
      // Add a row for an empty group if necessary, or skip
      rows.push({
        'Group': groupName,
        'Student Name': '(Empty)',
        'Student ID': '—',
        'Email': '—',
        'Phone': '—',
        'Role': '—',
        'Join Method': '—'
      });
    }
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Groups');

  // Adjust column widths
  const wscols = [
    { wch: 10 }, // Group
    { wch: 25 }, // Student Name
    { wch: 15 }, // Student ID
    { wch: 30 }, // Email
    { wch: 15 }, // Phone
    { wch: 10 }, // Role
    { wch: 12 }  // Join Method
  ];
  worksheet['!cols'] = wscols;

  // Generate filename
  const filename = `${project.module}_${project.assignmentTitle.replace(/[^a-z0-9]/gi, '_')}_Groups.xlsx`;

  // Save/Download file
  XLSX.writeFile(workbook, filename);
};

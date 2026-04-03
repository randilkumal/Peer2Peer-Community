import { format } from 'date-fns';

export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  const formatStr = includeTime ? 'MMM dd, yyyy HH:mm' : 'MMM dd, yyyy';
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (str, length = 100) => {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    pending: 'yellow',
    rejected: 'red',
    inactive: 'gray',
    requested: 'blue',
    confirmed: 'green',
    completed: 'purple',
    cancelled: 'red',
    approved: 'green',
  };
  return colors[status] || 'gray';
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
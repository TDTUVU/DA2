import { format } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatDateForInput = (date: string | Date): string => {
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

export const formatDateTime = (dateTimeStr: string): string => {
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    return 'N/A';
  }
}; 
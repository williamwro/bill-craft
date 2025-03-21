
/**
 * Format a number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date as a readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
}

/**
 * Get status text and color for a bill based on due date
 */
export function getBillStatusInfo(dueDate: string, status: 'paid' | 'unpaid'): { 
  statusText: string; 
  statusColor: string;
  badgeColor: string;
} {
  if (status === 'paid') {
    return { 
      statusText: 'Pago', 
      statusColor: 'text-green-600',
      badgeColor: 'bg-green-100 text-green-800'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0);
  
  if (dueDateObj < today) {
    return { 
      statusText: 'Vencido', 
      statusColor: 'text-red-600',
      badgeColor: 'bg-red-100 text-red-800'
    };
  }
  
  const inThreeDays = new Date(today);
  inThreeDays.setDate(today.getDate() + 3);
  
  if (dueDateObj <= inThreeDays) {
    return { 
      statusText: 'Próximo ao vencimento', 
      statusColor: 'text-orange-500',
      badgeColor: 'bg-orange-100 text-orange-800'
    };
  }
  
  return { 
    statusText: 'Em dia', 
    statusColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-800'
  };
}

/**
 * Get category display name and icon
 */
export function getCategoryInfo(category: string): { 
  name: string; 
  icon: string;
  bgColor: string;
} {
  switch (category) {
    case 'utilities':
      return { name: 'Utilidades', icon: '⚡', bgColor: 'bg-yellow-100' };
    case 'rent':
      return { name: 'Aluguel', icon: '🏢', bgColor: 'bg-blue-100' };
    case 'insurance':
      return { name: 'Seguro', icon: '🔒', bgColor: 'bg-green-100' };
    case 'subscription':
      return { name: 'Assinatura', icon: '📱', bgColor: 'bg-purple-100' };
    case 'services':
      return { name: 'Serviços', icon: '🔧', bgColor: 'bg-indigo-100' };
    case 'supplies':
      return { name: 'Suprimentos', icon: '📦', bgColor: 'bg-pink-100' };
    case 'taxes':
      return { name: 'Impostos', icon: '📝', bgColor: 'bg-red-100' };
    case 'other':
    default:
      return { name: 'Outros', icon: '📋', bgColor: 'bg-gray-100' };
  }
}

/**
 * Format a value to Brazilian currency format
 */
export function formatBrazilianCurrency(value: string): string {
  // Remove non-numeric characters except for the last decimal point
  let numericValue = value.replace(/[^\d,]/g, '');
  
  // Ensure only one comma for decimal
  const parts = numericValue.split(',');
  if (parts.length > 2) {
    numericValue = parts[0] + ',' + parts.slice(1).join('');
  }
  
  // Format the value
  let formattedValue = '';
  
  if (numericValue) {
    // Convert to number and format to BRL
    // First replace comma with dot for proper parsing
    const parsedValue = parseFloat(numericValue.replace(',', '.'));
    if (!isNaN(parsedValue)) {
      formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parsedValue);
    }
  } else {
    formattedValue = 'R$ 0,00';
  }
  
  return formattedValue;
}

/**
 * Convert Brazilian currency format to number for storage
 * R$ 1.234,56 -> 1234.56
 */
export function brazilianCurrencyToNumber(value: string): string {
  // Strip currency symbol and separators, replace comma with dot
  return value.replace(/[^\d,]/g, '')
    .replace(/\./g, '')  // Remove thousand separators (dots)
    .replace(',', '.');  // Replace decimal comma with dot
}

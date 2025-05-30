
// Extract start date from trip dates string
export const extractStartDate = (dateString: string): string => {
  try {
    const startDateStr = dateString.split(' - ')[0];
    const year = dateString.split(', ')[1] || new Date().getFullYear().toString();
    const month = startDateStr.split(' ')[0];
    const day = startDateStr.split(' ')[1];
    
    const monthMap: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const monthNum = monthMap[month] || '01';
    const dayNum = day?.padStart(2, '0') || '01';
    
    return `${year}-${monthNum}-${dayNum}`;
  } catch {
    return '';
  }
};

// Extract end date from trip dates string
export const extractEndDate = (dateString: string): string => {
  try {
    const parts = dateString.split(' - ');
    if (parts.length < 2) return extractStartDate(dateString);
    
    const endDateStr = parts[1];
    const year = dateString.split(', ')[1] || new Date().getFullYear().toString();
    const month = endDateStr.split(' ')[0];
    const day = endDateStr.split(' ')[1];
    
    const monthMap: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const monthNum = monthMap[month] || '01';
    const dayNum = day?.padStart(2, '0') || '01';
    
    return `${year}-${monthNum}-${dayNum}`;
  } catch {
    return '';
  }
};

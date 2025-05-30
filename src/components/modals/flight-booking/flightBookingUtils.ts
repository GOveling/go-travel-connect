
export const extractStartDate = (dateRange: string): string => {
  // Expected format: "Dec 15 - Dec 25, 2024" or "Dec 15 - 25, 2024"
  const parts = dateRange.split(' - ');
  if (parts.length !== 2) return '';
  
  const startPart = parts[0].trim(); // "Dec 15"
  const endPart = parts[1].trim(); // "Dec 25, 2024"
  
  // Extract year from end part
  const yearMatch = endPart.match(/(\d{4})/);
  if (!yearMatch) return '';
  const year = yearMatch[1];
  
  // Parse start month and day
  const startMatch = startPart.match(/(\w+)\s+(\d+)/);
  if (!startMatch) return '';
  const [, startMonth, startDay] = startMatch;
  
  // Convert month name to number
  const monthMap: { [key: string]: string } = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const monthNum = monthMap[startMonth];
  if (!monthNum) return '';
  
  // Format as YYYY-MM-DD
  return `${year}-${monthNum}-${startDay.padStart(2, '0')}`;
};

export const extractEndDate = (dateRange: string): string => {
  // Expected format: "Dec 15 - Dec 25, 2024" or "Dec 15 - 25, 2024"
  const parts = dateRange.split(' - ');
  if (parts.length !== 2) return '';
  
  const endPart = parts[1].trim(); // "Dec 25, 2024"
  
  // Remove any trailing commas and extract components
  const cleanEndPart = endPart.replace(/,+$/, ''); // Remove trailing commas
  
  // Extract year
  const yearMatch = cleanEndPart.match(/(\d{4})/);
  if (!yearMatch) return '';
  const year = yearMatch[1];
  
  // Check if it's format "Dec 25, 2024" or just "25, 2024"
  const fullDateMatch = cleanEndPart.match(/(\w+)\s+(\d+),?\s*\d{4}/);
  const dayOnlyMatch = cleanEndPart.match(/^(\d+),?\s*\d{4}$/);
  
  let month: string;
  let day: string;
  
  if (fullDateMatch) {
    // Format: "Dec 25, 2024"
    const [, endMonth, endDay] = fullDateMatch;
    month = endMonth;
    day = endDay;
  } else if (dayOnlyMatch) {
    // Format: "25, 2024" - need to get month from start part
    const startPart = parts[0].trim();
    const startMatch = startPart.match(/(\w+)\s+\d+/);
    if (!startMatch) return '';
    month = startMatch[1];
    day = dayOnlyMatch[1];
  } else {
    return '';
  }
  
  // Convert month name to number
  const monthMap: { [key: string]: string } = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const monthNum = monthMap[month];
  if (!monthNum) return '';
  
  // Format as YYYY-MM-DD (without trailing comma)
  return `${year}-${monthNum}-${day.padStart(2, '0')}`;
};

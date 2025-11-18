export const calculateROI = (launchPrice: number, currentPrice: number): number => {
  if (!launchPrice || launchPrice === 0) return 0;
  return ((currentPrice - launchPrice) / launchPrice) * 100;
};

export const calculateAnnualizedROI = (launchPrice: number, currentPrice: number, launchDate: string): number => {
  if (!launchPrice || launchPrice === 0 || !launchDate) return 0;
  
  const launch = new Date(launchDate);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - launch.getFullYear()) * 12 + (now.getMonth() - launch.getMonth());
  
  if (monthsDiff <= 0) return 0;
  
  const roi = calculateROI(launchPrice, currentPrice);
  return (roi / monthsDiff) * 12; // Annualized
};

export const formatROIDisplay = (roi: number): string => {
  const sign = roi >= 0 ? '+' : '';
  return `${sign}${roi.toFixed(1)}%`;
};

export const getROIStatus = (roi: number): 'positive' | 'negative' | 'neutral' => {
  if (roi > 0) return 'positive';
  if (roi < 0) return 'negative';
  return 'neutral';
};

export const getROICategory = (roi: number): string => {
  if (roi >= 20) return 'Rất tốt';
  if (roi >= 10) return 'Tốt';
  if (roi >= 0) return 'Ổn định';
  return 'Giảm giá';
};
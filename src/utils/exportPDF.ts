import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export interface ExportPDFOptions {
  filename?: string;
  element?: HTMLElement;
  title?: string;
  orientation?: 'portrait' | 'landscape';
}

export const exportToPDF = async (options: ExportPDFOptions = {}) => {
  const {
    filename = 'document.pdf',
    element,
    title = 'Document',
    orientation = 'portrait'
  } = options;

  try {
    toast.loading('Đang tạo file PDF...');

    let targetElement = element;
    if (!targetElement) {
      targetElement = document.body;
    }

    // Capture the element as canvas
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(
      imgData,
      'PNG',
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    );

    pdf.save(filename);
    toast.dismiss();
    toast.success('Đã tải xuống file PDF');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast.dismiss();
    toast.error('Không thể tạo file PDF');
    throw error;
  }
};

export const exportProjectComparison = async (projects: any[]) => {
  try {
    toast.loading('Đang tạo báo cáo so sánh...');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    pdf.setFontSize(20);
    pdf.text('Báo cáo so sánh dự án', 15, 20);

    // Add date
    pdf.setFontSize(10);
    pdf.text(`Ngày: ${new Date().toLocaleDateString('vi-VN')}`, 15, 28);

    let yPosition = 40;

    projects.forEach((project, index) => {
      if (index > 0 && yPosition > 170) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text(`${index + 1}. ${project.name}`, 15, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.text(`Vị trí: ${project.location}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Chủ đầu tư: ${project.developer}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Giá: ${project.priceRange}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Điểm pháp lý: ${project.legalScore}/10`, 20, yPosition);
      yPosition += 10;
    });

    pdf.save(`so-sanh-du-an-${Date.now()}.pdf`);
    toast.dismiss();
    toast.success('Đã tải xuống báo cáo');
  } catch (error) {
    console.error('Error exporting comparison:', error);
    toast.dismiss();
    toast.error('Không thể tạo báo cáo');
    throw error;
  }
};

export const exportPortfolioReport = async (portfolio: any[], stats: any) => {
  try {
    toast.loading('Đang tạo báo cáo danh mục...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Title
    pdf.setFontSize(20);
    pdf.text('Báo cáo Danh mục Đầu tư', 15, 20);

    // Date
    pdf.setFontSize(10);
    pdf.text(`Ngày: ${new Date().toLocaleDateString('vi-VN')}`, 15, 28);

    // Stats
    pdf.setFontSize(12);
    let y = 40;
    pdf.text(`Tổng đầu tư: ${stats.totalInvestment.toLocaleString('vi-VN')} VNĐ`, 15, y);
    y += 8;
    pdf.text(`Giá trị hiện tại: ${stats.totalValue.toLocaleString('vi-VN')} VNĐ`, 15, y);
    y += 8;
    pdf.text(`ROI: ${stats.totalROI.toFixed(2)}%`, 15, y);
    y += 15;

    // Portfolio items
    pdf.setFontSize(14);
    pdf.text('Chi tiết dự án:', 15, y);
    y += 10;

    portfolio.forEach((item, index) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(11);
      pdf.text(`${index + 1}. ${item.project_name}`, 15, y);
      y += 6;

      pdf.setFontSize(9);
      pdf.text(`  Giá mua: ${item.purchase_price.toLocaleString('vi-VN')} VNĐ`, 20, y);
      y += 5;
      pdf.text(`  Số lượng: ${item.quantity}`, 20, y);
      y += 5;
      pdf.text(`  Ngày mua: ${new Date(item.purchase_date).toLocaleDateString('vi-VN')}`, 20, y);
      y += 5;
      if (item.roi_percentage) {
        pdf.text(`  ROI: ${item.roi_percentage.toFixed(2)}%`, 20, y);
        y += 5;
      }
      y += 3;
    });

    pdf.save(`danh-muc-dau-tu-${Date.now()}.pdf`);
    toast.dismiss();
    toast.success('Đã tải xuống báo cáo');
  } catch (error) {
    console.error('Error exporting portfolio:', error);
    toast.dismiss();
    toast.error('Không thể tạo báo cáo');
    throw error;
  }
};

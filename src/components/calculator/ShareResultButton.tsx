import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareResultButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  title?: string;
}

export const ShareResultButton = ({ targetRef, title = "Kết quả tính toán" }: ShareResultButtonProps) => {
  const [loading, setLoading] = useState(false);

  const generateImage = async (action: 'download' | 'share') => {
    if (!targetRef.current) return;
    setLoading(true);

    try {
      // Add watermark temporarily
      const watermark = document.createElement('div');
      watermark.innerHTML = 'Realprofit.vn';
      watermark.style.position = 'absolute';
      watermark.style.bottom = '20px';
      watermark.style.right = '20px';
      watermark.style.opacity = '0.5';
      watermark.style.fontSize = '24px';
      watermark.style.fontWeight = 'bold';
      watermark.style.color = '#000';
      watermark.style.pointerEvents = 'none';
      watermark.style.zIndex = '9999';
      
      // Make sure target has relative positioning for absolute watermark
      const originalPosition = targetRef.current.style.position;
      targetRef.current.style.position = 'relative';
      targetRef.current.appendChild(watermark);

      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
      });

      // Clean up
      targetRef.current.removeChild(watermark);
      targetRef.current.style.position = originalPosition;

      const image = canvas.toDataURL('image/png');

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = image;
        link.download = `realprofit-calculator-${Date.now()}.png`;
        link.click();
        toast.success('Đã tải xuống hình ảnh');
      } else if (action === 'share') {
        if (navigator.share) {
          const blob = await (await fetch(image)).blob();
          const file = new File([blob], 'result.png', { type: 'image/png' });
          await navigator.share({
            title: title,
            text: 'Kết quả tính toán từ Realprofit.vn',
            files: [file],
          });
        } else {
           // Fallback to download if share API not supported (e.g. desktop)
           const link = document.createElement('a');
           link.href = image;
           link.download = `realprofit-calculator-${Date.now()}.png`;
           link.click();
           toast.success('Trình duyệt không hỗ trợ chia sẻ trực tiếp, đã tải ảnh về máy.');
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Có lỗi xảy ra khi tạo hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          Chia sẻ kết quả
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => generateImage('download')} className="cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Tải ảnh về máy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generateImage('share')} className="cursor-pointer">
          <Share2 className="w-4 h-4 mr-2" />
          Chia sẻ ngay
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
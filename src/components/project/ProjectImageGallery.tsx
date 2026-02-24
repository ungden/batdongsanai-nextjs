"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProjectImageGalleryProps {
  gallery?: string[];
  projectName: string;
}

const ProjectImageGallery = ({ gallery = [], projectName }: ProjectImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Return null if no gallery provided
  if (!gallery || gallery.length === 0) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <div className="relative h-[500px] w-full overflow-hidden rounded-xl">
        {/* Main Image with Dark Overlay */}
        <div className="relative h-full w-full">
          <img
            src={gallery[currentImageIndex]}
            alt={`${projectName} - Hình ảnh ${currentImageIndex + 1} của dự án`}
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Dark gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Navigation Arrows */}
          {gallery.length > 1 && (
            <>
              <Button
                onClick={prevImage}
                size="icon"
                variant="outline"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={nextImage}
                size="icon"
                variant="outline"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Expand Button */}
          <Button
            onClick={() => setShowLightbox(true)}
            size="icon"
            variant="outline"
            className="absolute top-4 right-4 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            aria-label="Mở xem ảnh to hơn"
          >
            <Expand className="h-4 w-4" />
          </Button>

          {/* Image Counter */}
          {gallery.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {currentImageIndex + 1} / {gallery.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {gallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {gallery.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? "border-white shadow-lg"
                    : "border-white/30 hover:border-white/60"
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1} của ${projectName}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-2">
          <div className="relative h-full w-full">
            <img
              src={gallery[currentImageIndex]}
              alt={`${projectName} - Hình ${currentImageIndex + 1}`}
              className="h-full w-full object-contain"
            />
            
            {gallery.length > 1 && (
              <>
                <Button
                  onClick={prevImage}
                  size="icon"
                  variant="outline"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={nextImage}
                  size="icon"
                  variant="outline"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 text-foreground px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              {currentImageIndex + 1} / {gallery.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectImageGallery;
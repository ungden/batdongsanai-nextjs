"use client";
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Project } from '@/types/project';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { formatCurrency } from '@/utils/formatCurrency';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';

// Thay thế bằng API Key thực tế của bạn
// Lưu ý: Cần kích hoạt Billing trên Google Cloud Console để maps hoạt động
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE"; 

interface GoogleMapViewerProps {
  projects: Project[];
  className?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Tọa độ trung tâm mặc định (TP.HCM)
const defaultCenter = {
  lat: 10.7769,
  lng: 106.7009
};

// Hàm giả lập tọa độ cho dự án (Vì data tĩnh chưa có lat/lng)
// Trong thực tế, database cần cột lat/lng
const getProjectCoordinates = (project: Project) => {
  // Fake coordinates based on district to spread them out
  const baseLat = 10.7769;
  const baseLng = 106.7009;
  
  // Hash simple để tạo vị trí cố định cho mỗi dự án
  const hash = project.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
  const randomLat = (hash % 100) / 1000; 
  const randomLng = ((hash >> 2) % 100) / 1000;

  return {
    lat: baseLat + randomLat,
    lng: baseLng + randomLng
  };
};

export default function GoogleMapViewer({ projects, className }: GoogleMapViewerProps) {
  const navigate = useRouter();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Memoize markers to prevent re-rendering
  const markers = useMemo(() => projects.map(project => ({
    ...project,
    position: getProjectCoordinates(project)
  })), [projects]);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-muted/20 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Đang tải bản đồ...</p>
          <p className="text-xs text-muted-foreground mt-1">(Cần API Key hợp lệ)</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-sm border border-border ${className}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        {markers.map((project) => (
          <Marker
            key={project.id}
            position={project.position}
            onClick={() => setSelectedProject(project)}
            title={project.name}
          />
        ))}

        {selectedProject && (
          <InfoWindow
            position={getProjectCoordinates(selectedProject)}
            onCloseClick={() => setSelectedProject(null)}
          >
            <Card className="w-[280px] border-0 shadow-none p-0">
              <div className="relative h-32 w-full rounded-t-lg overflow-hidden">
                <img loading="lazy" decoding="async" 
                  src={selectedProject.image} 
                  alt={selectedProject.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-white/90 text-black hover:bg-white">
                  {selectedProject.priceRange}
                </Badge>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1 line-clamp-1">{selectedProject.name}</h3>
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="truncate">{selectedProject.location}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs font-bold text-primary">
                    {formatCurrency(selectedProject.pricePerSqm)}/m²
                  </span>
                  <Button size="sm" className="h-7 text-xs" onClick={() => navigate.push(`/projects/${selectedProject.id}`)}>
                    Chi tiết <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Warning Overlay if no API Key (for demo purposes) */}
      {GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE" && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg z-50 pointer-events-none">
          ⚠️ <strong>Lưu ý Developer:</strong> Bạn cần thay thế <code>GOOGLE_MAPS_API_KEY</code> trong 
          <code>src/components/map/GoogleMapViewer.tsx</code> bằng key thực tế để bản đồ hoạt động.
        </div>
      )}
    </div>
  );
}
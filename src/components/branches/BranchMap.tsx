import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Branch } from "./BranchManager";

interface BranchMapProps {
  branches: Branch[];
  selectedBranchId: string | null;
  onMapClick?: (lat: number, lng: number) => void;
}

export const BranchMap = ({ branches, selectedBranchId, onMapClick }: BranchMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const ymapsMapRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=ru_RU';
    script.async = true;
    script.onload = initMap;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (ymapsMapRef.current && branches.length > 0) {
      updateMap();
    }
  }, [branches, selectedBranchId]);

  const initMap = () => {
    if (!window.ymaps || !mapRef.current) return;

    window.ymaps.ready(() => {
      const map = new window.ymaps.Map(mapRef.current!, {
        center: [45.0355, 38.9753],
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
      });

      ymapsMapRef.current = map;

      if (onMapClick) {
        map.events.add('click', (e: any) => {
          const coords = e.get('coords');
          onMapClick(coords[0], coords[1]);
        });
      }

      updateMap();
    });
  };

  const updateMap = () => {
    if (!ymapsMapRef.current || !window.ymaps) return;

    const map = ymapsMapRef.current;
    map.geoObjects.removeAll();

    branches.forEach((branch) => {
      const placemark = new window.ymaps.Placemark(
        [branch.latitude, branch.longitude],
        {
          balloonContentHeader: branch.name,
          balloonContentBody: `
            <div style="padding: 10px;">
              <p><strong>${branch.address}</strong></p>
              <p>📞 ${branch.phone}</p>
              <p>👤 ${branch.manager}</p>
              ${branch.workingHours ? `<p>🕒 ${branch.workingHours}</p>` : ''}
              ${branch.employeeCount ? `<p>👥 Сотрудников: ${branch.employeeCount}</p>` : ''}
            </div>
          `,
          balloonContentFooter: branch.description || '',
        },
        {
          preset: branch.isActive 
            ? (selectedBranchId === branch.id ? 'islands#redIcon' : 'islands#blueIcon')
            : 'islands#grayIcon',
          iconColor: branch.isActive 
            ? (selectedBranchId === branch.id ? '#ff0000' : '#1e88e5')
            : '#757575'
        }
      );

      map.geoObjects.add(placemark);
    });

    if (selectedBranchId) {
      const selectedBranch = branches.find(b => b.id === selectedBranchId);
      if (selectedBranch) {
        map.setCenter([selectedBranch.latitude, selectedBranch.longitude], 15, {
          duration: 500
        });
      }
    }
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="Map" size={20} className="mr-2 text-blue-600" />
            Карта филиалов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef} 
            className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200"
          />
        </CardContent>
      </Card>

      {selectedBranch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Icon name="Info" size={20} className="mr-2 text-blue-600" />
                Информация о филиале
              </span>
              <Badge variant={selectedBranch.isActive ? "default" : "secondary"}>
                {selectedBranch.isActive ? 'Активен' : 'Неактивен'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold text-xl mb-2">{selectedBranch.name}</h3>
              {selectedBranch.description && (
                <p className="text-gray-600 mb-3">{selectedBranch.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Icon name="MapPin" size={16} className="mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Адрес</p>
                    <p className="text-gray-600">{selectedBranch.city}, {selectedBranch.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Icon name="Phone" size={16} className="mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Телефон</p>
                    <p className="text-gray-600">{selectedBranch.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Icon name="Mail" size={16} className="mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{selectedBranch.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Icon name="User" size={16} className="mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Управляющий</p>
                    <p className="text-gray-600">{selectedBranch.manager}</p>
                  </div>
                </div>

                {selectedBranch.workingHours && (
                  <div className="flex items-start gap-2">
                    <Icon name="Clock" size={16} className="mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">Часы работы</p>
                      <p className="text-gray-600">{selectedBranch.workingHours}</p>
                    </div>
                  </div>
                )}

                {selectedBranch.employeeCount !== undefined && (
                  <div className="flex items-start gap-2">
                    <Icon name="Users" size={16} className="mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium">Сотрудников</p>
                      <p className="text-gray-600">{selectedBranch.employeeCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500">
                Координаты: {selectedBranch.latitude.toFixed(6)}, {selectedBranch.longitude.toFixed(6)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

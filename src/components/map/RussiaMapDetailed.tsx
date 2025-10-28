import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BranchModal } from './BranchModal';
import { Branch } from './RussiaMap';
import Icon from '@/components/ui/icon';

const branches: Branch[] = [
  { id: '1', city: 'Краснодар', address: 'ул. Красная, д. 122', phone: '+7 (861) 234-56-78', email: 'krasnodar@ab-kassa.ru', employees: 28, description: 'Региональный центр Южного федерального округа.', images: [], x: 30, y: 73 },
  { id: '2', city: 'Сочи', address: 'Курортный проспект, д. 75', phone: '+7 (862) 345-67-89', email: 'sochi@ab-kassa.ru', employees: 18, description: 'Филиал в курортной зоне.', images: [], x: 27.5, y: 75.5 },
  { id: '3', city: 'п. Лазаревское', address: 'ул. Победы, д. 153', phone: '+7 (862) 456-78-90', email: 'lazarevskoye@ab-kassa.ru', employees: 12, description: 'Обслуживает курортную зону.', images: [], x: 28, y: 74.8 },
  { id: '4', city: 'Геленджик', address: 'ул. Луначарского, д. 166', phone: '+7 (861) 567-89-01', email: 'gelendzhik@ab-kassa.ru', employees: 15, description: 'Курортная зона Геленджика.', images: [], x: 28, y: 73.5 },
  { id: '5', city: 'Анапа', address: 'ул. Крымская, д. 99', phone: '+7 (861) 678-90-12', email: 'anapa@ab-kassa.ru', employees: 14, description: 'Семейные курорты и санатории.', images: [], x: 26.5, y: 72.5 },
  { id: '6', city: 'Новороссийск', address: 'проспект Ленина, д. 7', phone: '+7 (861) 789-01-23', email: 'novoross@ab-kassa.ru', employees: 20, description: 'Портовый город.', images: [], x: 27, y: 73 },
  { id: '7', city: 'Ейск', address: 'ул. Свердлова, д. 88', phone: '+7 (861) 890-12-34', email: 'eysk@ab-kassa.ru', employees: 10, description: 'Азовское море.', images: [], x: 31.5, y: 70 },
  { id: '8', city: 'Туапсе', address: 'ул. Сочинская, д. 4', phone: '+7 (861) 901-23-45', email: 'tuapse@ab-kassa.ru', employees: 13, description: 'Портовый и курортный город.', images: [], x: 28.5, y: 74.2 },
  { id: '9', city: 'Ростов-на-Дону', address: 'Большая Садовая, д. 47', phone: '+7 (863) 123-45-67', email: 'rostov@ab-kassa.ru', employees: 35, description: 'Региональный центр Южного региона.', images: [], x: 32, y: 67.5 },
  { id: '10', city: 'Москва', address: 'ул. Тверская, д. 15', phone: '+7 (495) 123-45-67', email: 'moscow@ab-kassa.ru', employees: 45, description: 'Главный офис компании.', images: ['https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/d13c6ebf-e510-4f18-84e3-eb85e6ef7e97.jpg', 'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/513df264-576d-44b5-9013-d96b5a53a72d.jpg'], x: 26.5, y: 50.5 },
  { id: '11', city: 'Воронеж', address: 'проспект Революции, д. 38', phone: '+7 (473) 234-56-78', email: 'voronezh@ab-kassa.ru', employees: 22, description: 'Центрально-Черноземный регион.', images: [], x: 29, y: 59.5 },
  { id: '12', city: 'Липецк', address: 'ул. Ленина, д. 25', phone: '+7 (474) 345-67-89', email: 'lipetsk@ab-kassa.ru', employees: 16, description: 'Промышленные предприятия.', images: [], x: 29.5, y: 57 },
  { id: '13', city: 'Нижний Новгород', address: 'ул. Большая Покровская, д. 15', phone: '+7 (831) 456-78-90', email: 'nnov@ab-kassa.ru', employees: 27, description: 'Приволжский округ.', images: [], x: 34, y: 51 },
  { id: '14', city: 'Санкт-Петербург', address: 'Невский проспект, д. 28', phone: '+7 (812) 987-65-43', email: 'spb@ab-kassa.ru', employees: 32, description: 'Северо-Западный регион.', images: ['https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/d13c6ebf-e510-4f18-84e3-eb85e6ef7e97.jpg', 'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/a003f4d7-cc70-4ff3-8983-a84f909d2e23.jpg'], x: 22, y: 36 },
  { id: '15', city: 'Самара', address: 'ул. Куйбышева, д. 92', phone: '+7 (846) 567-89-01', email: 'samara@ab-kassa.ru', employees: 24, description: 'Поволжский регион.', images: [], x: 38, y: 58 },
  { id: '16', city: 'Новосибирск', address: 'Красный проспект, д. 35', phone: '+7 (383) 678-90-12', email: 'novosibirsk@ab-kassa.ru', employees: 30, description: 'Сибирский федеральный округ.', images: [], x: 69, y: 51 },
  { id: '17', city: 'Волгоград', address: 'проспект Ленина, д. 10', phone: '+7 (844) 789-01-23', email: 'volgograd@ab-kassa.ru', employees: 19, description: 'Волгоградская область.', images: [], x: 34.5, y: 66 },
  { id: '18', city: 'Пермь', address: 'ул. Ленина, д. 45', phone: '+7 (342) 890-12-34', email: 'perm@ab-kassa.ru', employees: 21, description: 'Уральский регион.', images: [], x: 44, y: 44.5 },
  { id: '19', city: 'Челябинск', address: 'ул. Кирова, д. 104', phone: '+7 (351) 901-23-45', email: 'chelyabinsk@ab-kassa.ru', employees: 23, description: 'Южный Урал.', images: [], x: 49, y: 53 },
  { id: '20', city: 'Саратов', address: 'проспект Кирова, д. 27', phone: '+7 (845) 012-34-56', email: 'saratov@ab-kassa.ru', employees: 17, description: 'Саратовская область.', images: [], x: 36, y: 61 },
  { id: '21', city: 'Красноярск', address: 'проспект Мира, д. 88', phone: '+7 (391) 123-45-67', email: 'krasnoyarsk@ab-kassa.ru', employees: 25, description: 'Восточная Сибирь.', images: [], x: 78, y: 47 },
  { id: '22', city: 'Екатеринбург', address: 'ул. Вайнера, д. 9А', phone: '+7 (343) 234-56-78', email: 'ekaterinburg@ab-kassa.ru', employees: 33, description: 'Уральский округ.', images: [], x: 48, y: 49.5 },
  { id: '23', city: 'Казань', address: 'ул. Баумана, д. 58', phone: '+7 (843) 345-67-89', email: 'kazan@ab-kassa.ru', employees: 26, description: 'Республика Татарстан.', images: [], x: 38.5, y: 51 },
  { id: '24', city: 'Уфа', address: 'ул. Ленина, д. 63', phone: '+7 (347) 456-78-90', email: 'ufa@ab-kassa.ru', employees: 20, description: 'Республика Башкортостан.', images: [], x: 44.5, y: 54 }
];

const federalDistricts = [
  { name: 'Северо-Западный', color: '#9CA3AF', branches: ['Санкт-Петербург'] },
  { name: 'Центральный', color: '#FCA5A5', branches: ['Москва', 'Воронеж', 'Липецк'] },
  { name: 'Приволжский', color: '#FDE047', branches: ['Нижний Новгород', 'Самара', 'Саратов', 'Казань', 'Уфа'] },
  { name: 'Южный', color: '#FEF08A', branches: ['Краснодар', 'Сочи', 'Анапа', 'Новороссийск', 'Геленджик', 'Туапсе', 'п. Лазаревское', 'Ейск', 'Ростов-на-Дону', 'Волгоград'] },
  { name: 'Уральский', color: '#FED7AA', branches: ['Екатеринбург', 'Пермь', 'Челябинск'] },
  { name: 'Сибирский', color: '#86EFAC', branches: ['Новосибирск', 'Красноярск'] },
  { name: 'Дальневосточный', color: '#FCD34D', branches: [] }
];

export const RussiaMapDetailed = () => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);

  const krasnodar = branches[0];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-6">Филиальная сеть по России</h3>
        
        <div className="relative w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200" style={{ paddingBottom: '50%' }}>
          <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full">
            
            <path d="M 10,30 L 15,20 L 22,18 L 28,20 L 30,28 L 28,36 L 22,38 L 15,36 L 10,30 Z" fill="#9CA3AF" stroke="#374151" strokeWidth="0.2" opacity="0.8" />
            
            <path d="M 20,40 L 28,36 L 35,38 L 38,45 L 35,55 L 30,60 L 24,58 L 20,50 Z" fill="#FCA5A5" stroke="#DC2626" strokeWidth="0.2" opacity="0.8" />
            
            <path d="M 32,38 L 40,36 L 50,40 L 54,50 L 50,60 L 44,62 L 38,58 L 35,50 L 38,45 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.2" opacity="0.8" />
            
            <path d="M 24,62 L 30,60 L 38,65 L 40,72 L 36,78 L 28,80 L 20,76 L 18,68 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="0.2" opacity="0.8" />
            
            <path d="M 44,38 L 52,36 L 58,42 L 56,54 L 50,58 L 44,54 L 44,45 Z" fill="#FED7AA" stroke="#EA580C" strokeWidth="0.2" opacity="0.8" />
            
            <path d="M 58,38 L 72,36 L 85,40 L 88,50 L 84,58 L 74,60 L 64,56 L 58,48 Z" fill="#86EFAC" stroke="#16A34A" strokeWidth="0.2" opacity="0.8" />
            
            <path d="M 84,30 L 92,25 L 98,30 L 98,45 L 94,55 L 88,56 L 84,50 L 85,40 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="0.2" opacity="0.8" />

            {branches.filter(b => b.id !== '1').map(branch => (
              <line key={`line-${branch.id}`} x1={krasnodar.x} y1={krasnodar.y} x2={branch.x} y2={branch.y} stroke="white" strokeWidth="0.1" opacity="0.25" strokeDasharray="0.3,0.3" />
            ))}

            {branches.map((branch) => {
              const isHovered = hoveredBranch === branch.id;
              const isKrasnodar = branch.id === '1';
              
              return (
                <g key={branch.id}>
                  {isKrasnodar && (
                    <circle cx={branch.x} cy={branch.y} r="1.2" fill="none" stroke="#DC2626" strokeWidth="0.15" opacity="0.5">
                      <animate attributeName="r" from="0.6" to="2" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  
                  <circle
                    cx={branch.x}
                    cy={branch.y}
                    r={isKrasnodar ? "0.7" : isHovered ? "0.6" : "0.45"}
                    fill={isKrasnodar ? "#DC2626" : isHovered ? "#2563EB" : "#1E40AF"}
                    stroke="white"
                    strokeWidth="0.15"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredBranch(branch.id)}
                    onMouseLeave={() => setHoveredBranch(null)}
                    onClick={() => setSelectedBranch(branch)}
                  />
                  
                  <text
                    x={branch.x}
                    y={branch.y - 1.2}
                    fontSize="1.2"
                    fill={isKrasnodar ? "#991B1B" : "#1E3A8A"}
                    fontWeight={isKrasnodar ? "bold" : isHovered ? "600" : "500"}
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                    style={{ textShadow: '0 0 3px white, 0 0 3px white' }}
                  >
                    {branch.city}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {federalDistricts.map((district) => (
            <div key={district.name} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-gray-400" style={{ backgroundColor: district.color, opacity: 0.8 }}></div>
              <span className="text-xs text-gray-700">{district.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Головной офис</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-900 rounded-full"></div>
            <span>Филиалы ({branches.length})</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Статистика по федеральным округам</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {federalDistricts.map((district) => {
            const districtBranches = branches.filter(b => district.branches.includes(b.city));
            const totalEmployees = districtBranches.reduce((sum, b) => sum + b.employees, 0);
            
            if (districtBranches.length === 0) return null;
            
            return (
              <div key={district.name} className="p-4 rounded-lg border-2 hover:shadow-md transition-shadow" style={{ borderColor: district.color, backgroundColor: `${district.color}15` }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-4 h-4 rounded mt-1 flex-shrink-0" style={{ backgroundColor: district.color }}></div>
                  <h4 className="font-semibold text-gray-900">{district.name} ФО</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Филиалов:</span>
                    <span className="font-semibold">{districtBranches.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Сотрудников:</span>
                    <span className="font-semibold">{totalEmployees}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">{districtBranches.map(b => b.city).join(', ')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Все филиалы ({branches.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const district = federalDistricts.find(d => d.branches.includes(branch.city));
            
            return (
              <div
                key={branch.id}
                className="p-4 border-2 rounded-lg hover:shadow-md cursor-pointer transition-all duration-200 bg-white"
                style={{ borderColor: district?.color || '#e5e7eb' }}
                onMouseEnter={() => setHoveredBranch(branch.id)}
                onMouseLeave={() => setHoveredBranch(null)}
                onClick={() => setSelectedBranch(branch)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg text-blue-900">{branch.city}</h4>
                  {branch.id === '1' && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">HQ</span>}
                </div>
                {district && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: district.color }}></div>
                    <span className="text-xs text-gray-500">{district.name} ФО</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 mb-3">{branch.description}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Icon name="MapPin" size={14} />
                    <span className="truncate">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Icon name="Users" size={14} />
                    <span>{branch.employees} сотрудников</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <BranchModal branch={selectedBranch} isOpen={!!selectedBranch} onClose={() => setSelectedBranch(null)} />
    </div>
  );
};

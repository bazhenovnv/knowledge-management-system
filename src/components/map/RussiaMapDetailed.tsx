import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BranchModal } from './BranchModal';
import { Branch } from './RussiaMap';
import Icon from '@/components/ui/icon';

const branches: Branch[] = [
  {
    id: '1',
    city: 'Краснодар',
    address: 'ул. Красная, д. 122',
    phone: '+7 (861) 234-56-78',
    email: 'krasnodar@ab-kassa.ru',
    employees: 28,
    description: 'Региональный центр Южного федерального округа.',
    images: [],
    x: 42.5,
    y: 72.5
  },
  {
    id: '2',
    city: 'Сочи',
    address: 'Курортный проспект, д. 75',
    phone: '+7 (862) 345-67-89',
    email: 'sochi@ab-kassa.ru',
    employees: 18,
    description: 'Филиал в курортной зоне.',
    images: [],
    x: 39,
    y: 75
  },
  {
    id: '3',
    city: 'п. Лазаревское',
    address: 'ул. Победы, д. 153',
    phone: '+7 (862) 456-78-90',
    email: 'lazarevskoye@ab-kassa.ru',
    employees: 12,
    description: 'Обслуживает курортную зону.',
    images: [],
    x: 39.5,
    y: 74.2
  },
  {
    id: '4',
    city: 'Геленджик',
    address: 'ул. Луначарского, д. 166',
    phone: '+7 (861) 567-89-01',
    email: 'gelendzhik@ab-kassa.ru',
    employees: 15,
    description: 'Курортная зона Геленджика.',
    images: [],
    x: 38,
    y: 72.8
  },
  {
    id: '5',
    city: 'Анапа',
    address: 'ул. Крымская, д. 99',
    phone: '+7 (861) 678-90-12',
    email: 'anapa@ab-kassa.ru',
    employees: 14,
    description: 'Семейные курорты и санатории.',
    images: [],
    x: 37,
    y: 72
  },
  {
    id: '6',
    city: 'Новороссийск',
    address: 'проспект Ленина, д. 7',
    phone: '+7 (861) 789-01-23',
    email: 'novoross@ab-kassa.ru',
    employees: 20,
    description: 'Портовый город.',
    images: [],
    x: 37.8,
    y: 72.5
  },
  {
    id: '7',
    city: 'Ейск',
    address: 'ул. Свердлова, д. 88',
    phone: '+7 (861) 890-12-34',
    email: 'eysk@ab-kassa.ru',
    employees: 10,
    description: 'Азовское море.',
    images: [],
    x: 38.2,
    y: 70
  },
  {
    id: '8',
    city: 'Туапсе',
    address: 'ул. Сочинская, д. 4',
    phone: '+7 (861) 901-23-45',
    email: 'tuapse@ab-kassa.ru',
    employees: 13,
    description: 'Портовый и курортный город.',
    images: [],
    x: 39.2,
    y: 73.8
  },
  {
    id: '9',
    city: 'Ростов-на-Дону',
    address: 'Большая Садовая, д. 47',
    phone: '+7 (863) 123-45-67',
    email: 'rostov@ab-kassa.ru',
    employees: 35,
    description: 'Региональный центр Южного региона.',
    images: [],
    x: 39.5,
    y: 67
  },
  {
    id: '10',
    city: 'Москва',
    address: 'ул. Тверская, д. 15',
    phone: '+7 (495) 123-45-67',
    email: 'moscow@ab-kassa.ru',
    employees: 45,
    description: 'Главный офис компании.',
    images: [
      'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/d13c6ebf-e510-4f18-84e3-eb85e6ef7e97.jpg',
      'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/513df264-576d-44b5-9013-d96b5a53a72d.jpg'
    ],
    x: 37.5,
    y: 49
  },
  {
    id: '11',
    city: 'Воронеж',
    address: 'проспект Революции, д. 38',
    phone: '+7 (473) 234-56-78',
    email: 'voronezh@ab-kassa.ru',
    employees: 22,
    description: 'Центрально-Черноземный регион.',
    images: [],
    x: 39.2,
    y: 59
  },
  {
    id: '12',
    city: 'Липецк',
    address: 'ул. Ленина, д. 25',
    phone: '+7 (474) 345-67-89',
    email: 'lipetsk@ab-kassa.ru',
    employees: 16,
    description: 'Промышленные предприятия.',
    images: [],
    x: 39.6,
    y: 56.5
  },
  {
    id: '13',
    city: 'Нижний Новгород',
    address: 'ул. Большая Покровская, д. 15',
    phone: '+7 (831) 456-78-90',
    email: 'nnov@ab-kassa.ru',
    employees: 27,
    description: 'Приволжский округ.',
    images: [],
    x: 44,
    y: 50.5
  },
  {
    id: '14',
    city: 'Санкт-Петербург',
    address: 'Невский проспект, д. 28',
    phone: '+7 (812) 987-65-43',
    email: 'spb@ab-kassa.ru',
    employees: 32,
    description: 'Северо-Западный регион.',
    images: [
      'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/d13c6ebf-e510-4f18-84e3-eb85e6ef7e97.jpg',
      'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/a003f4d7-cc70-4ff3-8983-a84f909d2e23.jpg'
    ],
    x: 30.3,
    y: 36
  },
  {
    id: '15',
    city: 'Самара',
    address: 'ул. Куйбышева, д. 92',
    phone: '+7 (846) 567-89-01',
    email: 'samara@ab-kassa.ru',
    employees: 24,
    description: 'Поволжский регион.',
    images: [],
    x: 50.1,
    y: 58
  },
  {
    id: '16',
    city: 'Новосибирск',
    address: 'Красный проспект, д. 35',
    phone: '+7 (383) 678-90-12',
    email: 'novosibirsk@ab-kassa.ru',
    employees: 30,
    description: 'Сибирский федеральный округ.',
    images: [],
    x: 82.9,
    y: 51
  },
  {
    id: '17',
    city: 'Волгоград',
    address: 'проспект Ленина, д. 10',
    phone: '+7 (844) 789-01-23',
    email: 'volgograd@ab-kassa.ru',
    employees: 19,
    description: 'Волгоградская область.',
    images: [],
    x: 44.5,
    y: 66
  },
  {
    id: '18',
    city: 'Пермь',
    address: 'ул. Ленина, д. 45',
    phone: '+7 (342) 890-12-34',
    email: 'perm@ab-kassa.ru',
    employees: 21,
    description: 'Уральский регион.',
    images: [],
    x: 56.2,
    y: 44
  },
  {
    id: '19',
    city: 'Челябинск',
    address: 'ул. Кирова, д. 104',
    phone: '+7 (351) 901-23-45',
    email: 'chelyabinsk@ab-kassa.ru',
    employees: 23,
    description: 'Южный Урал.',
    images: [],
    x: 61.4,
    y: 52.5
  },
  {
    id: '20',
    city: 'Саратов',
    address: 'проспект Кирова, д. 27',
    phone: '+7 (845) 012-34-56',
    email: 'saratov@ab-kassa.ru',
    employees: 17,
    description: 'Саратовская область.',
    images: [],
    x: 46.0,
    y: 60.5
  },
  {
    id: '21',
    city: 'Красноярск',
    address: 'проспект Мира, д. 88',
    phone: '+7 (391) 123-45-67',
    email: 'krasnoyarsk@ab-kassa.ru',
    employees: 25,
    description: 'Восточная Сибирь.',
    images: [],
    x: 92.8,
    y: 46.5
  },
  {
    id: '22',
    city: 'Екатеринбург',
    address: 'ул. Вайнера, д. 9А',
    phone: '+7 (343) 234-56-78',
    email: 'ekaterinburg@ab-kassa.ru',
    employees: 33,
    description: 'Уральский округ.',
    images: [],
    x: 60.6,
    y: 49
  },
  {
    id: '23',
    city: 'Казань',
    address: 'ул. Баумана, д. 58',
    phone: '+7 (843) 345-67-89',
    email: 'kazan@ab-kassa.ru',
    employees: 26,
    description: 'Республика Татарстан.',
    images: [],
    x: 49.1,
    y: 50.5
  },
  {
    id: '24',
    city: 'Уфа',
    address: 'ул. Ленина, д. 63',
    phone: '+7 (347) 456-78-90',
    email: 'ufa@ab-kassa.ru',
    employees: 20,
    description: 'Республика Башкортостан.',
    images: [],
    x: 55.9,
    y: 53.5
  }
];

interface RussiaMapDetailedProps {
  userRole?: string;
}

export const RussiaMapDetailed = ({ userRole }: RussiaMapDetailedProps) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const krasnodar = branches[0];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-6">Филиальная сеть по России</h3>
        
        {/* Карта */}
        <div className="relative w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
          >
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 0.3 }} />
              </linearGradient>
            </defs>

            {/* Упрощенный контур России */}
            <path
              d="M 25,35 L 35,28 L 45,25 L 55,28 L 65,30 L 75,32 L 85,35 L 95,40 L 98,50 L 95,60 L 90,68 L 85,72 L 75,75 L 65,73 L 55,70 L 45,68 L 40,75 L 38,80 L 35,78 L 32,72 L 30,65 L 28,55 L 25,45 Z"
              fill="url(#mapGradient)"
              stroke="#1e40af"
              strokeWidth="0.3"
              opacity="0.6"
            />

            {/* Линии от Краснодара ко всем городам */}
            {branches.filter(b => b.id !== '1').map(branch => (
              <line
                key={`line-${branch.id}`}
                x1={krasnodar.x}
                y1={krasnodar.y}
                x2={branch.x}
                y2={branch.y}
                stroke="white"
                strokeWidth="0.15"
                opacity="0.4"
                strokeDasharray="0.5,0.5"
              />
            ))}

            {/* Точки городов */}
            {branches.map((branch) => {
              const isHovered = hoveredBranch === branch.id;
              const isKrasnodar = branch.id === '1';
              
              return (
                <g key={branch.id}>
                  {/* Пульсация для Краснодара */}
                  {isKrasnodar && (
                    <circle
                      cx={branch.x}
                      cy={branch.y}
                      r="2"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="0.2"
                      opacity="0.6"
                    >
                      <animate
                        attributeName="r"
                        from="1"
                        to="3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.8"
                        to="0"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  
                  {/* Точка города */}
                  <circle
                    cx={branch.x}
                    cy={branch.y}
                    r={isKrasnodar ? "1.2" : isHovered ? "1" : "0.7"}
                    fill={isKrasnodar ? "#ef4444" : isHovered ? "#3b82f6" : "#1e40af"}
                    stroke="white"
                    strokeWidth="0.2"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredBranch(branch.id)}
                    onMouseLeave={() => setHoveredBranch(null)}
                    onClick={() => setSelectedBranch(branch)}
                  />
                  
                  {/* Название города */}
                  <text
                    x={branch.x}
                    y={branch.y - 1.5}
                    fontSize="1.8"
                    fill={isKrasnodar ? "#ef4444" : "#1e3a8a"}
                    fontWeight={isKrasnodar ? "bold" : isHovered ? "600" : "500"}
                    textAnchor="middle"
                    className="cursor-pointer select-none"
                    style={{ 
                      pointerEvents: 'none',
                      textShadow: '0 0 2px white, 0 0 2px white'
                    }}
                  >
                    {branch.city}
                  </text>
                  
                  {/* Количество сотрудников */}
                  <text
                    x={branch.x}
                    y={branch.y + 2.2}
                    fontSize="1.3"
                    fill="#64748b"
                    textAnchor="middle"
                    className="select-none"
                    style={{ 
                      pointerEvents: 'none',
                      textShadow: '0 0 2px white'
                    }}
                  >
                    {branch.employees} чел
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Легенда */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Головной офис (Краснодар)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
            <span>Филиалы</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-white opacity-40"></div>
            <span>Связь с центром</span>
          </div>
        </div>
      </Card>

      {/* Интерактивный список филиалов */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Список филиалов ({branches.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="p-4 border rounded-lg hover:shadow-md hover:border-blue-400 cursor-pointer transition-all duration-200 bg-white"
              onMouseEnter={() => setHoveredBranch(branch.id)}
              onMouseLeave={() => setHoveredBranch(null)}
              onClick={() => setSelectedBranch(branch)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-lg text-blue-900">{branch.city}</h4>
                {branch.id === '1' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    HQ
                  </span>
                )}
              </div>
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
                <div className="flex items-center gap-2 text-gray-500">
                  <Icon name="Phone" size={14} />
                  <span>{branch.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Модальное окно */}
      <BranchModal
        branch={selectedBranch}
        isOpen={!!selectedBranch}
        onClose={() => setSelectedBranch(null)}
        userRole={userRole}
        onEdit={(branch) => {
          console.log('Editing branch:', branch);
          // TODO: Implement edit functionality
        }}
        onDelete={(branch) => {
          console.log('Deleting branch:', branch);
          // TODO: Implement delete functionality
        }}
      />
    </div>
  );
};
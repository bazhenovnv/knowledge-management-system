import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BranchModal } from './BranchModal';

export interface Branch {
  id: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  employees: number;
  description: string;
  images: string[];
  x: number;
  y: number;
}

const branches: Branch[] = [
  {
    id: '1',
    city: 'Москва',
    address: 'ул. Тверская, д. 15',
    phone: '+7 (495) 123-45-67',
    email: 'moscow@ab-kassa.ru',
    employees: 45,
    description: 'Главный офис компании. Центр управления всей филиальной сетью, отдел разработки и стратегического планирования.',
    images: [
      'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/d13c6ebf-e510-4f18-84e3-eb85e6ef7e97.jpg',
      'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/513df264-576d-44b5-9013-d96b5a53a72d.jpg'
    ],
    x: 55.7558,
    y: 37.6173
  },
  {
    id: '2',
    city: 'Санкт-Петербург',
    address: 'Невский проспект, д. 28',
    phone: '+7 (812) 987-65-43',
    email: 'spb@ab-kassa.ru',
    employees: 32,
    description: 'Крупнейший филиал в Северо-Западном регионе. Обслуживает клиентов Ленинградской области и соседних регионов.',
    images: [
      'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/d13c6ebf-e510-4f18-84e3-eb85e6ef7e97.jpg',
      'https://cdn.poehali.dev/projects/3e7167fb-cf22-49a0-9384-995d309795e1/files/a003f4d7-cc70-4ff3-8983-a84f909d2e23.jpg'
    ],
    x: 59.9343,
    y: 30.3351
  },
  {
    id: '3',
    city: 'Краснодар',
    address: 'ул. Красная, д. 122',
    phone: '+7 (861) 234-56-78',
    email: 'krasnodar@ab-kassa.ru',
    employees: 28,
    description: 'Региональный центр Южного федерального округа. Координирует работу филиалов в Краснодарском крае.',
    images: [],
    x: 45.0355,
    y: 38.9753
  },
  {
    id: '4',
    city: 'Сочи',
    address: 'Курортный проспект, д. 75',
    phone: '+7 (862) 345-67-89',
    email: 'sochi@ab-kassa.ru',
    employees: 18,
    description: 'Филиал в курортной зоне, специализируется на обслуживании гостиничного и ресторанного бизнеса.',
    images: [],
    x: 43.6028,
    y: 39.7342
  },
  {
    id: '5',
    city: 'Лазаревское',
    address: 'ул. Победы, д. 153',
    phone: '+7 (862) 456-78-90',
    email: 'lazarevskoye@ab-kassa.ru',
    employees: 12,
    description: 'Обслуживает курортную зону Большого Сочи, работа с малым и средним бизнесом.',
    images: [],
    x: 43.9094,
    y: 39.3314
  },
  {
    id: '6',
    city: 'Геленджик',
    address: 'ул. Луначарского, д. 166',
    phone: '+7 (861) 567-89-01',
    email: 'gelendzhik@ab-kassa.ru',
    employees: 15,
    description: 'Обслуживает курортную зону Геленджика и прилегающих районов.',
    images: [],
    x: 44.5619,
    y: 38.0769
  },
  {
    id: '7',
    city: 'Анапа',
    address: 'ул. Крымская, д. 99',
    phone: '+7 (861) 678-90-12',
    email: 'anapa@ab-kassa.ru',
    employees: 14,
    description: 'Специализация на семейных курортах, детских лагерях и санаториях.',
    images: [],
    x: 44.8952,
    y: 37.3165
  },
  {
    id: '8',
    city: 'Новороссийск',
    address: 'проспект Ленина, д. 7',
    phone: '+7 (861) 789-01-23',
    email: 'novoross@ab-kassa.ru',
    employees: 20,
    description: 'Крупный филиал портового города, работа с логистическими и торговыми компаниями.',
    images: [],
    x: 44.7242,
    y: 37.7686
  },
  {
    id: '9',
    city: 'Ейск',
    address: 'ул. Свердлова, д. 88',
    phone: '+7 (861) 890-12-34',
    email: 'eysk@ab-kassa.ru',
    employees: 10,
    description: 'Обслуживает северную часть Краснодарского края и курортную зону Азовского моря.',
    images: [],
    x: 46.7108,
    y: 38.2747
  },
  {
    id: '10',
    city: 'Туапсе',
    address: 'ул. Сочинская, д. 4',
    phone: '+7 (861) 901-23-45',
    email: 'tuapse@ab-kassa.ru',
    employees: 13,
    description: 'Филиал в крупном портовом и курортном городе на побережье Черного моря.',
    images: [],
    x: 44.0978,
    y: 39.0742
  },
  {
    id: '11',
    city: 'Ростов-на-Дону',
    address: 'Большая Садовая, д. 47',
    phone: '+7 (863) 123-45-67',
    email: 'rostov@ab-kassa.ru',
    employees: 35,
    description: 'Региональный центр Южного региона, крупный филиал с полным спектром услуг.',
    images: [],
    x: 47.2357,
    y: 39.7015
  },
  {
    id: '12',
    city: 'Воронеж',
    address: 'проспект Революции, д. 38',
    phone: '+7 (473) 234-56-78',
    email: 'voronezh@ab-kassa.ru',
    employees: 22,
    description: 'Обслуживает Центрально-Черноземный регион, активно развивающийся филиал.',
    images: [],
    x: 51.6605,
    y: 39.2005
  },
  {
    id: '13',
    city: 'Липецк',
    address: 'ул. Ленина, д. 25',
    phone: '+7 (474) 345-67-89',
    email: 'lipetsk@ab-kassa.ru',
    employees: 16,
    description: 'Работа с промышленными предприятиями и торговыми сетями региона.',
    images: [],
    x: 52.6097,
    y: 39.5708
  },
  {
    id: '14',
    city: 'Нижний Новгород',
    address: 'ул. Большая Покровская, д. 15',
    phone: '+7 (831) 456-78-90',
    email: 'nnov@ab-kassa.ru',
    employees: 27,
    description: 'Крупный филиал Приволжского округа, обслуживает весь Нижегородский регион.',
    images: [],
    x: 56.2965,
    y: 43.9361
  },
  {
    id: '15',
    city: 'Самара',
    address: 'ул. Куйбышева, д. 92',
    phone: '+7 (846) 567-89-01',
    email: 'samara@ab-kassa.ru',
    employees: 24,
    description: 'Важный филиал Поволжского региона, работа с крупным и средним бизнесом.',
    images: [],
    x: 53.1952,
    y: 50.1069
  },
  {
    id: '16',
    city: 'Новосибирск',
    address: 'Красный проспект, д. 35',
    phone: '+7 (383) 678-90-12',
    email: 'novosibirsk@ab-kassa.ru',
    employees: 30,
    description: 'Крупнейший филиал в Сибирском федеральном округе, региональный центр.',
    images: [],
    x: 55.0084,
    y: 82.9357
  },
  {
    id: '17',
    city: 'Волгоград',
    address: 'проспект Ленина, д. 10',
    phone: '+7 (844) 789-01-23',
    email: 'volgograd@ab-kassa.ru',
    employees: 19,
    description: 'Обслуживает Волгоградскую область и южные регионы Поволжья.',
    images: [],
    x: 48.7080,
    y: 44.5133
  },
  {
    id: '18',
    city: 'Пермь',
    address: 'ул. Ленина, д. 45',
    phone: '+7 (342) 890-12-34',
    email: 'perm@ab-kassa.ru',
    employees: 21,
    description: 'Филиал Уральского региона, обслуживает Пермский край и соседние области.',
    images: [],
    x: 58.0105,
    y: 56.2502
  },
  {
    id: '19',
    city: 'Челябинск',
    address: 'ул. Кирова, д. 104',
    phone: '+7 (351) 901-23-45',
    email: 'chelyabinsk@ab-kassa.ru',
    employees: 23,
    description: 'Крупный филиал Южного Урала, работа с промышленными и торговыми компаниями.',
    images: [],
    x: 55.1644,
    y: 61.4368
  },
  {
    id: '20',
    city: 'Саратов',
    address: 'проспект Кирова, д. 27',
    phone: '+7 (845) 012-34-56',
    email: 'saratov@ab-kassa.ru',
    employees: 17,
    description: 'Обслуживает Саратовскую область, развитие малого и среднего бизнеса.',
    images: [],
    x: 51.5924,
    y: 46.0348
  },
  {
    id: '21',
    city: 'Красноярск',
    address: 'проспект Мира, д. 88',
    phone: '+7 (391) 123-45-67',
    email: 'krasnoyarsk@ab-kassa.ru',
    employees: 25,
    description: 'Региональный центр Восточной Сибири, координация работы филиалов округа.',
    images: [],
    x: 56.0153,
    y: 92.8932
  },
  {
    id: '22',
    city: 'Екатеринбург',
    address: 'ул. Вайнера, д. 9А',
    phone: '+7 (343) 234-56-78',
    email: 'ekaterinburg@ab-kassa.ru',
    employees: 33,
    description: 'Крупнейший филиал Уральского округа, полный спектр услуг для всех отраслей.',
    images: [],
    x: 56.8389,
    y: 60.6057
  },
  {
    id: '23',
    city: 'Казань',
    address: 'ул. Баумана, д. 58',
    phone: '+7 (843) 345-67-89',
    email: 'kazan@ab-kassa.ru',
    employees: 26,
    description: 'Региональный центр Татарстана, обслуживание республики и соседних регионов.',
    images: [],
    x: 55.7887,
    y: 49.1221
  },
  {
    id: '24',
    city: 'Уфа',
    address: 'ул. Ленина, д. 63',
    phone: '+7 (347) 456-78-90',
    email: 'ufa@ab-kassa.ru',
    employees: 20,
    description: 'Филиал республики Башкортостан, работа с разными отраслями экономики.',
    images: [],
    x: 54.7388,
    y: 55.9721
  },
  {
    id: '25',
    city: 'Омск',
    address: 'ул. Ленина, д. 18',
    phone: '+7 (381) 567-89-01',
    email: 'omsk@ab-kassa.ru',
    employees: 18,
    description: 'Филиал Западной Сибири, обслуживает Омскую область и прилегающие территории.',
    images: [],
    x: 54.9885,
    y: 73.3242
  },
  {
    id: '26',
    city: 'Симферополь',
    address: 'ул. Пушкина, д. 12',
    phone: '+7 (365) 678-90-12',
    email: 'simferopol@ab-kassa.ru',
    employees: 16,
    description: 'Центральный филиал Республики Крым, координация всех филиалов полуострова.',
    images: [],
    x: 44.9521,
    y: 34.1024
  },
  {
    id: '27',
    city: 'Пятигорск',
    address: 'проспект Кирова, д. 56',
    phone: '+7 (879) 789-01-23',
    email: 'pyatigorsk@ab-kassa.ru',
    employees: 14,
    description: 'Филиал Северо-Кавказского региона, курортная и санаторная специализация.',
    images: [],
    x: 44.0486,
    y: 43.0594
  },
  {
    id: '28',
    city: 'Астрахань',
    address: 'ул. Советская, д. 15',
    phone: '+7 (851) 890-12-34',
    email: 'astrakhan@ab-kassa.ru',
    employees: 15,
    description: 'Филиал Нижнего Поволжья, обслуживание торговых и логистических компаний.',
    images: [],
    x: 46.3497,
    y: 48.0408
  }
];

// Простая конвертация координат в SVG позиции
const coordsToSVG = (lat: number, lon: number) => {
  // Грубая проекция для России
  const x = ((lon - 20) / 160) * 800 + 50;
  const y = ((85 - lat) / 50) * 400 + 50;
  return { x, y };
};

export const RussiaMap = () => {
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  return (
    <>
      <Card className="p-6 bg-white">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
          География присутствия компании
        </h3>
        <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
          <svg
            viewBox="0 0 900 500"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Фон карты России (упрощенный контур) */}
            <rect x="0" y="0" width="900" height="500" fill="#f0f4f8" />
            
            {/* Упрощенный контур России */}
            <path
              d="M 50 150 L 150 120 L 250 100 L 350 110 L 450 120 L 550 130 L 650 140 L 750 150 L 820 160 L 850 180 L 850 250 L 820 280 L 750 300 L 650 320 L 550 330 L 450 340 L 350 350 L 250 340 L 150 320 L 100 280 L 50 220 Z"
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* Точки городов */}
            {branches.map((branch) => {
              const pos = coordsToSVG(branch.x, branch.y);
              const isHovered = hoveredBranch === branch.id;
              
              return (
                <g key={branch.id}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isHovered ? 8 : 6}
                    fill={isHovered ? '#ef4444' : '#3b82f6'}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredBranch(branch.id)}
                    onMouseLeave={() => setHoveredBranch(null)}
                    onClick={() => setSelectedBranch(branch)}
                  />
                  
                  {/* Подсказка при наведении */}
                  {isHovered && (
                    <g>
                      <rect
                        x={pos.x + 12}
                        y={pos.y - 20}
                        width={branch.city.length * 8 + 16}
                        height="30"
                        fill="rgba(0, 0, 0, 0.9)"
                        rx="4"
                      />
                      <text
                        x={pos.x + 20}
                        y={pos.y - 2}
                        fill="white"
                        fontSize="14"
                        fontWeight="600"
                      >
                        {branch.city}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Наведите курсор на город для просмотра названия</p>
          <p>Нажмите на город для подробной информации о филиале</p>
        </div>
      </Card>

      {/* Модальное окно с информацией о филиале */}
      {selectedBranch && (
        <BranchModal
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </>
  );
};
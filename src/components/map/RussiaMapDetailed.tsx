import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BranchModal } from './BranchModal';
import { Branch } from './RussiaMap';

const branches: Branch[] = [
  {
    id: '1',
    city: 'Краснодар',
    address: 'ул. Красная, д. 122',
    phone: '+7 (861) 234-56-78',
    email: 'krasnodar@ab-kassa.ru',
    employees: 28,
    description: 'Региональный центр Южного федерального округа. Координирует работу филиалов в Краснодарском крае.',
    images: [],
    x: 85,
    y: 580
  },
  {
    id: '2',
    city: 'Сочи',
    address: 'Курортный проспект, д. 75',
    phone: '+7 (862) 345-67-89',
    email: 'sochi@ab-kassa.ru',
    employees: 18,
    description: 'Филиал в курортной зоне, специализируется на обслуживании гостиничного и ресторанного бизнеса.',
    images: [],
    x: 62,
    y: 605
  },
  {
    id: '3',
    city: 'п. Лазаревское',
    address: 'ул. Победы, д. 153',
    phone: '+7 (862) 456-78-90',
    email: 'lazarevskoye@ab-kassa.ru',
    employees: 12,
    description: 'Обслуживает курортную зону Большого Сочи, работа с малым и средним бизнесом.',
    images: [],
    x: 68,
    y: 600
  },
  {
    id: '4',
    city: 'Геленджик',
    address: 'ул. Луначарского, д. 166',
    phone: '+7 (861) 567-89-01',
    email: 'gelendzhik@ab-kassa.ru',
    employees: 15,
    description: 'Обслуживает курортную зону Геленджика и прилегающих районов.',
    images: [],
    x: 72,
    y: 587
  },
  {
    id: '5',
    city: 'Анапа',
    address: 'ул. Крымская, д. 99',
    phone: '+7 (861) 678-90-12',
    email: 'anapa@ab-kassa.ru',
    employees: 14,
    description: 'Специализация на семейных курортах, детских лагерях и санаториях.',
    images: [],
    x: 58,
    y: 578
  },
  {
    id: '6',
    city: 'Новороссийск',
    address: 'проспект Ленина, д. 7',
    phone: '+7 (861) 789-01-23',
    email: 'novoross@ab-kassa.ru',
    employees: 20,
    description: 'Крупный филиал портового города, работа с логистическими и торговыми компаниями.',
    images: [],
    x: 66,
    y: 582
  },
  {
    id: '7',
    city: 'Ейск',
    address: 'ул. Свердлова, д. 88',
    phone: '+7 (861) 890-12-34',
    email: 'eysk@ab-kassa.ru',
    employees: 10,
    description: 'Обслуживает северную часть Краснодарского края и курортную зону Азовского моря.',
    images: [],
    x: 90,
    y: 560
  },
  {
    id: '8',
    city: 'Туапсе',
    address: 'ул. Сочинская, д. 4',
    phone: '+7 (861) 901-23-45',
    email: 'tuapse@ab-kassa.ru',
    employees: 13,
    description: 'Филиал в крупном портовом и курортном городе на побережье Черного моря.',
    images: [],
    x: 70,
    y: 595
  },
  {
    id: '9',
    city: 'Ростов-на-Дону',
    address: 'Большая Садовая, д. 47',
    phone: '+7 (863) 123-45-67',
    email: 'rostov@ab-kassa.ru',
    employees: 35,
    description: 'Региональный центр Южного региона, крупный филиал с полным спектром услуг.',
    images: [],
    x: 105,
    y: 540
  },
  {
    id: '10',
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
    x: 175,
    y: 395
  },
  {
    id: '11',
    city: 'Воронеж',
    address: 'проспект Революции, д. 38',
    phone: '+7 (473) 234-56-78',
    email: 'voronezh@ab-kassa.ru',
    employees: 22,
    description: 'Обслуживает Центрально-Черноземный регион, активно развивающийся филиал.',
    images: [],
    x: 138,
    y: 475
  },
  {
    id: '12',
    city: 'Липецк',
    address: 'ул. Ленина, д. 25',
    phone: '+7 (474) 345-67-89',
    email: 'lipetsk@ab-kassa.ru',
    employees: 16,
    description: 'Работа с промышленными предприятиями и торговыми сетями региона.',
    images: [],
    x: 152,
    y: 455
  },
  {
    id: '13',
    city: 'Нижний Новгород',
    address: 'ул. Большая Покровская, д. 15',
    phone: '+7 (831) 456-78-90',
    email: 'nnov@ab-kassa.ru',
    employees: 27,
    description: 'Крупный филиал Приволжского округа, обслуживает весь Нижегородский регион.',
    images: [],
    x: 215,
    y: 405
  },
  {
    id: '14',
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
    x: 138,
    y: 290
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
    x: 260,
    y: 465
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
    x: 526,
    y: 410
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
    x: 195,
    y: 530
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
    x: 310,
    y: 355
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
    x: 330,
    y: 420
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
    x: 225,
    y: 485
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
    x: 600,
    y: 375
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
    x: 330,
    y: 395
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
    x: 245,
    y: 405
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
    x: 285,
    y: 420
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
    x: 440,
    y: 410
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
    x: 20,
    y: 582
  },
  {
    id: '27',
    city: 'Ставрополь',
    address: 'ул. Ленина, д. 421',
    phone: '+7 (865) 234-56-78',
    email: 'stavropol@ab-kassa.ru',
    employees: 19,
    description: 'Региональный центр Ставропольского края, обслуживает весь регион и соседние области.',
    images: [],
    x: 125,
    y: 575
  },
  {
    id: '28',
    city: 'Пятигорск',
    address: 'проспект Кирова, д. 56',
    phone: '+7 (879) 789-01-23',
    email: 'pyatigorsk@ab-kassa.ru',
    employees: 14,
    description: 'Филиал Северо-Кавказского региона, курортная и санаторная специализация.',
    images: [],
    x: 120,
    y: 598
  },
  {
    id: '29',
    city: 'Астрахань',
    address: 'ул. Советская, д. 15',
    phone: '+7 (851) 890-12-34',
    email: 'astrakhan@ab-kassa.ru',
    employees: 15,
    description: 'Филиал Нижнего Поволжья, обслуживание торговых и логистических компаний.',
    images: [],
    x: 220,
    y: 555
  }
];

export const RussiaMapDetailed = () => {
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  return (
    <>
      <Card className="p-6 bg-white">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
          География присутствия компании
        </h3>
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="relative">
              <img 
                src="https://cdn.poehali.dev/files/09e296f9-0ea7-494c-ac2a-56df17ce31d8.jpg" 
                alt="Карта России"
                className="w-full h-auto"
              />
              
              {/* Интерактивные маркеры городов */}
              <svg
                viewBox="0 0 700 800"
                className="absolute top-0 left-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
              >
                {branches.map((branch) => {
                  const isHovered = hoveredBranch === branch.id;
                  
                  return (
                    <g key={branch.id} style={{ pointerEvents: 'auto' }}>
                      <circle
                        cx={branch.x}
                        cy={branch.y}
                        r={isHovered ? 10 : 7}
                        fill={isHovered ? '#ef4444' : '#3b82f6'}
                        stroke="white"
                        strokeWidth="2.5"
                        className="cursor-pointer transition-all duration-200 drop-shadow-lg"
                        onMouseEnter={() => setHoveredBranch(branch.id)}
                        onMouseLeave={() => setHoveredBranch(null)}
                        onClick={() => setSelectedBranch(branch)}
                      />
                      
                      {/* Пульсирующий эффект для активной точки */}
                      {isHovered && (
                        <circle
                          cx={branch.x}
                          cy={branch.y}
                          r={14}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-ping"
                        />
                      )}
                      
                      {/* Подсказка при наведении */}
                      {isHovered && (
                        <g>
                          <rect
                            x={branch.x + 12}
                            y={branch.y - 22}
                            width={branch.city.length * 7.5 + 16}
                            height="30"
                            fill="rgba(0, 0, 0, 0.95)"
                            rx="5"
                            className="drop-shadow-xl"
                          />
                          <text
                            x={branch.x + 20}
                            y={branch.y - 4}
                            fill="white"
                            fontSize="14"
                            fontWeight="700"
                            className="select-none"
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
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="font-medium">📍 {branches.length} филиалов по всей России</p>
          <p className="mt-1">Наведите курсор на синюю точку для просмотра города</p>
          <p>Нажмите на точку для подробной информации о филиале</p>
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
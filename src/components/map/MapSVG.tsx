import { Branch } from './RussiaMap';

interface MapSVGProps {
  branches: Branch[];
  krasnodar: Branch;
  hoveredBranch: string | null;
  onBranchHover: (id: string | null) => void;
  onBranchClick: (branch: Branch) => void;
}

export const MapSVG = ({
  branches,
  krasnodar,
  hoveredBranch,
  onBranchHover,
  onBranchClick
}: MapSVGProps) => {
  return (
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

        <path
          d="M 25,35 L 35,28 L 45,25 L 55,28 L 65,30 L 75,32 L 85,35 L 95,40 L 98,50 L 95,60 L 90,68 L 85,72 L 75,75 L 65,73 L 55,70 L 45,68 L 40,75 L 38,80 L 35,78 L 32,72 L 30,65 L 28,55 L 25,45 Z"
          fill="url(#mapGradient)"
          stroke="#1e40af"
          strokeWidth="0.3"
          opacity="0.6"
        />

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

        {branches.map((branch) => {
          const isHovered = hoveredBranch === branch.id;
          const isKrasnodar = branch.id === '1';
          
          return (
            <g key={branch.id}>
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
              
              <circle
                cx={branch.x}
                cy={branch.y}
                r={isKrasnodar ? "1.2" : isHovered ? "1" : "0.7"}
                fill={isKrasnodar ? "#ef4444" : isHovered ? "#3b82f6" : "#1e40af"}
                stroke="white"
                strokeWidth="0.2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => onBranchHover(branch.id)}
                onMouseLeave={() => onBranchHover(null)}
                onClick={() => onBranchClick(branch)}
              />
              
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
  );
};

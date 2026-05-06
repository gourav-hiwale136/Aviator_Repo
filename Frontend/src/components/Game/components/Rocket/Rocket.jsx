// const Rocket = ({ x, y, crashed }) => {
//   return (
//     <g transform={`translate(${x},${y})`} style={{ transition: crashed ? "none" : "transform 0.05s linear" }}>
//       {!crashed ? (
//         <>
//           {/* Flame */}
//           <ellipse cx="0" cy="22" rx="6" ry="10" fill="url(#flameGrad)" opacity="0.9">
//             <animate attributeName="ry" values="10;14;9;13;10" dur="0.3s" repeatCount="indefinite" />
//           </ellipse>
//           <defs>
//             <radialGradient id="flameGrad" cx="50%" cy="30%">
//               <stop offset="0%" stopColor="#fff7a0" />
//               <stop offset="40%" stopColor="#ff8800" />
//               <stop offset="100%" stopColor="transparent" />
//             </radialGradient>
//           </defs>
//           {/* Body */}
//           <ellipse cx="0" cy="0" rx="10" ry="18" fill="#e8eaf6" />
//           <path d="M-10,-2 L-16,10 L-10,8 Z" fill="#ef5350" />
//           <path d="M10,-2 L16,10 L10,8 Z" fill="#ef5350" />
//           <ellipse cx="0" cy="-8" rx="8" ry="10" fill="#42a5f5" opacity="0.8" />
//           <circle cx="0" cy="-8" r="4" fill="#e3f2fd" opacity="0.6" />
//           <ellipse cx="0" cy="6" rx="4" ry="5" fill="#b0bec5" />
//         </>
//       ) : (
//         <>
//           {[0,60,120,180,240,300].map((angle, i) => (
//             <g key={i} transform={`rotate(${angle})`}>
//               <ellipse cx="0" cy="-15" rx="3" ry="8" fill={["#ff5252","#ffab40","#fff176","#69f0ae","#40c4ff","#ea80fc"][i]} opacity="0.9">
//                 <animate attributeName="cy" values="-15;-30;-15" dur="0.4s" repeatCount="indefinite" />
//               </ellipse>
//             </g>
//           ))}
//           <circle cx="0" cy="0" r="6" fill="#ff5252" opacity="0.8" />
//         </>
//       )}
//     </g>
//   );
// }
// export default Rocket;


const Rocket = ({ x, y, angle = 0, crashed = false }) => {
  if (crashed) {
    return (
      <g transform={`translate(${x},${y})`}>
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <g key={i} transform={`rotate(${a})`}>
            <ellipse
              cx="0"
              cy="-14"
              rx="3"
              ry="8"
              fill={["#ff1744", "#ff5252", "#ff8a65", "#ffd54f", "#ff6e40", "#ff4081"][i]}
              opacity="0.95"
            >
              <animate
                attributeName="cy"
                values="-14;-28;-14"
                dur="0.35s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
        ))}
        <circle cx="0" cy="0" r="7" fill="#ff1744" opacity="0.9" />
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <defs>
        <filter id="rocketGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* flame */}
      <path
        d="M -18 0 C -26 -4, -30 0, -26 4 C -23 2, -21 1, -18 0 Z"
        fill="#ff335c"
        opacity="0.9"
        filter="url(#rocketGlow)"
      >
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1 1;1.15 0.9;1 1"
          dur="0.22s"
          repeatCount="indefinite"
        />
      </path>

      {/* body */}
      <g filter="url(#rocketGlow)">
        <path
          d="M -14 -6 L 10 -6 L 18 0 L 10 6 L -14 6 L -8 0 Z"
          fill="#ff003c"
        />
        {/* top fin */}
        <path d="M -2 -6 L 6 -14 L 8 -6 Z" fill="#ff003c" />
        {/* bottom fin */}
        <path d="M -2 6 L 6 14 L 8 6 Z" fill="#ff003c" />
        {/* wing */}
        <path d="M -2 2 L 6 10 L -6 5 Z" fill="#ff003c" opacity="0.95" />
        {/* cockpit line */}
        <path d="M 0 -2 L 7 -2" stroke="#0a0a0a" strokeWidth="1.2" />
        <path d="M 2 0 L 8 0" stroke="#0a0a0a" strokeWidth="1.2" />
        {/* propeller */}
        <line x1="18" y1="-9" x2="18" y2="9" stroke="#ff003c" strokeWidth="1.8" />
        <line x1="13" y1="-5" x2="23" y2="5" stroke="#ff003c" strokeWidth="1.6" />
      </g>
    </g>
  );
};

export default Rocket;
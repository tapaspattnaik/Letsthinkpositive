import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: '/drawing' },
  title: 'Positive Drawing — Meditative Art for Calm & Focus',
  description: 'Discover zentangle, ZenDoodle, mandala, and other meditative drawing styles. No talent needed — just a pen, paper, and a few quiet minutes.',
}

/* ─── SVG Samples ────────────────────────────────────────────────────────── */

function ZentangleSVG() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Tile border */}
      <rect x="8" y="8" width="204" height="204" rx="4" fill="white" stroke="#1A6B6B" strokeWidth="2.5"/>
      <rect x="16" y="16" width="188" height="188" rx="2" fill="none" stroke="#1A6B6B" strokeWidth="0.8" strokeDasharray="3 2"/>
      {/* Dividing curves — string */}
      <path d="M16,110 Q80,75 110,110 Q140,145 204,110" stroke="#1A6B6B" strokeWidth="1.5" fill="none"/>
      <path d="M110,16 Q80,80 110,110 Q140,140 110,204" stroke="#1A6B6B" strokeWidth="1.5" fill="none"/>
      {/* TOP-LEFT: Printemps — spirals on stems */}
      {[[38,45],[55,35],[48,60],[65,50],[42,70]].map(([cx,cy],i) => (
        <g key={i}>
          <line x1={cx} y1={cy+14} x2={cx} y2={cy+6} stroke="#2D9B8A" strokeWidth="1.2"/>
          <circle cx={cx} cy={cy} r="5" fill="none" stroke="#2D9B8A" strokeWidth="1.2"/>
          <circle cx={cx} cy={cy} r="2.5" fill="#E8A020" opacity="0.7"/>
        </g>
      ))}
      {/* TOP-RIGHT: Hollibaugh — overlapping lines */}
      {[130,142,154,166,178].map((x,i) => (
        <line key={i} x1={x} y1={20} x2={x-18} y2={100} stroke="#1A6B6B" strokeWidth="1.4" opacity={0.6+i*0.08}/>
      ))}
      {[22,36,50,64,78,92].map((y,i) => (
        <line key={i} x1={118} y1={y} x2={210} y2={y+8} stroke="#E8A020" strokeWidth="1" opacity="0.5"/>
      ))}
      {/* BOTTOM-LEFT: Knightsbridge — checkerboard */}
      {Array.from({length:5}, (_,row) =>
        Array.from({length:4}, (_,col) => (
          (row+col)%2===0
            ? <rect key={`${row}-${col}`} x={18+col*19} y={116+row*17} width="17" height="15" fill="#2D9B8A" opacity="0.25"/>
            : <rect key={`${row}-${col}`} x={18+col*19} y={116+row*17} width="17" height="15" fill="#1A6B6B" opacity="0.45"/>
        ))
      )}
      {/* BOTTOM-RIGHT: Waves (Mooka) */}
      {[0,1,2,3,4].map(i => (
        <path key={i}
          d={`M${120+i*4},${120+i*12} Q${140+i*2},${112+i*12} ${155+i*3},${128+i*12} Q${170+i*2},${144+i*12} ${190+i*4},${130+i*12}`}
          stroke="#E8A020" strokeWidth="1.5" fill="none" opacity={0.5+i*0.1}/>
      ))}
      {[0,1,2,3].map(i => (
        <circle key={i} cx={130+i*18} cy={160+i*8} r={3+i} fill="none" stroke="#1A6B6B" strokeWidth="1" opacity="0.6"/>
      ))}
    </svg>
  )
}

function ZenDoodleSVG() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Organic blob shape */}
      <path d="M110,18 C145,15 180,35 195,70 C212,110 200,155 168,178 C140,198 80,205 48,185 C18,165 10,130 16,98 C24,58 60,22 110,18Z"
        fill="#EEF7F6" stroke="#1A6B6B" strokeWidth="2"/>
      {/* Organic dividing lines */}
      <path d="M60,110 C85,85 130,125 165,105" stroke="#1A6B6B" strokeWidth="1.5" fill="none"/>
      <path d="M100,40 C90,80 120,100 105,165" stroke="#1A6B6B" strokeWidth="1.5" fill="none"/>
      {/* Section 1 – dots */}
      {[[55,65],[68,52],[45,78],[72,75],[58,88]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={3+i%2} fill="#2D9B8A" opacity="0.6"/>
      ))}
      {/* Section 2 – small triangles */}
      {[[120,45],[138,55],[128,68],[148,45],[155,65]].map(([x,y],i)=>(
        <polygon key={i} points={`${x},${y-7} ${x-6},${y+5} ${x+6},${y+5}`}
          fill="none" stroke="#E8A020" strokeWidth="1.2" opacity="0.8"/>
      ))}
      {/* Section 3 – crosshatch */}
      {[0,1,2,3,4].map(i=>(
        <g key={i}>
          <line x1={35+i*10} y1={120+i*2} x2={45+i*10} y2={160-i*2} stroke="#1A6B6B" strokeWidth="1" opacity="0.5"/>
          <line x1={35+i*10} y1={160-i*2} x2={45+i*10} y2={120+i*2} stroke="#1A6B6B" strokeWidth="1" opacity="0.5"/>
        </g>
      ))}
      {/* Section 4 – petals */}
      {[[145,140],[162,128],[155,155],[170,148],[145,165]].map(([cx,cy],i)=>(
        <ellipse key={i} cx={cx} cy={cy} rx="7" ry="4"
          transform={`rotate(${i*36} ${cx} ${cy})`}
          fill="#E8A020" opacity="0.35" stroke="#E8A020" strokeWidth="0.8"/>
      ))}
      {/* Center dots */}
      {[[155,142]].map(([cx,cy])=>(
        <circle key="c" cx={cx} cy={cy} r="3.5" fill="#1A6B6B" opacity="0.7"/>
      ))}
    </svg>
  )
}

function MandalaSVG() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="220" height="220" fill="white"/>
      {/* Concentric rings */}
      {[95,80,65,50,35,20].map((r,i)=>(
        <circle key={i} cx="110" cy="110" r={r} stroke={i%2===0?'#1A6B6B':'#E8A020'} strokeWidth={i===0?2:1} opacity={0.4+i*0.1} fill="none"/>
      ))}
      {/* 8 petals outer */}
      {Array.from({length:8},(_,i)=>{
        const a = (i*45*Math.PI)/180
        const x = 110+75*Math.sin(a), y = 110-75*Math.cos(a)
        return <ellipse key={i} cx={(110+x)/2} cy={(110+y)/2} rx="10" ry="20"
          transform={`rotate(${i*45} ${(110+x)/2} ${(110+y)/2})`}
          fill="#2D9B8A" opacity="0.2" stroke="#2D9B8A" strokeWidth="1"/>
      })}
      {/* 8 petals inner */}
      {Array.from({length:8},(_,i)=>{
        const a = (i*45+22.5)*Math.PI/180
        const x = 110+52*Math.sin(a), y = 110-52*Math.cos(a)
        return <ellipse key={i} cx={(110+x)/2} cy={(110+y)/2} rx="7" ry="15"
          transform={`rotate(${i*45+22.5} ${(110+x)/2} ${(110+y)/2})`}
          fill="#E8A020" opacity="0.25" stroke="#E8A020" strokeWidth="1"/>
      })}
      {/* Spoke lines */}
      {Array.from({length:8},(_,i)=>{
        const a = (i*45*Math.PI)/180
        return <line key={i} x1="110" y1="110"
          x2={110+90*Math.sin(a)} y2={110-90*Math.cos(a)}
          stroke="#1A6B6B" strokeWidth="0.8" opacity="0.3"/>
      })}
      {/* Mid ring dots */}
      {Array.from({length:16},(_,i)=>{
        const a = (i*22.5*Math.PI)/180
        return <circle key={i} cx={110+62*Math.sin(a)} cy={110-62*Math.cos(a)}
          r={i%2===0?3:1.8} fill={i%2===0?'#E8A020':'#2D9B8A'} opacity="0.7"/>
      })}
      {/* Inner ring dots */}
      {Array.from({length:8},(_,i)=>{
        const a = (i*45*Math.PI)/180
        return <circle key={i} cx={110+35*Math.sin(a)} cy={110-35*Math.cos(a)}
          r="2.5" fill="#1A6B6B" opacity="0.6"/>
      })}
      {/* Centre flower */}
      {Array.from({length:6},(_,i)=>{
        const a = (i*60*Math.PI)/180
        return <ellipse key={i} cx={110+10*Math.sin(a)} cy={110-10*Math.cos(a)}
          rx="5" ry="9" transform={`rotate(${i*60} ${110+10*Math.sin(a)} ${110-10*Math.cos(a)})`}
          fill="#E8A020" opacity="0.5"/>
      })}
      <circle cx="110" cy="110" r="5" fill="#1A6B6B" opacity="0.8"/>
      <circle cx="110" cy="110" r="2" fill="#E8A020"/>
    </svg>
  )
}

function GeometricSVG() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="220" height="220" fill="#EEF7F6"/>
      {/* Hexagonal grid */}
      {(() => {
        const R = 22, h = R*Math.sqrt(3)/2
        const hexPath = (cx:number,cy:number,filled:boolean,i:number) => {
          const pts = Array.from({length:6},(_,k)=>{
            const a = (k*60-30)*Math.PI/180
            return `${cx+R*Math.cos(a)},${cy+R*Math.sin(a)}`
          }).join(' ')
          const fills = ['#2D9B8A','#1A6B6B','#E8A020','#A8D8D0','#F5C96A']
          return <polygon key={`${cx}-${cy}`} points={pts}
            fill={filled ? fills[i%fills.length] : 'none'}
            stroke="#1A6B6B" strokeWidth="1.2"
            opacity={filled ? 0.35 : 0.5}/>
        }
        const shapes = []
        for(let row=0; row<5; row++) {
          for(let col=0; col<5; col++) {
            const cx = 22 + col*(R*1.5) + (row%2)*R*0.75
            const cy = 24 + row*h
            shapes.push(hexPath(cx+8,cy+8,(row+col)%3===0,row*5+col))
          }
        }
        return shapes
      })()}
      {/* Diamond overlay */}
      {[[110,30],[170,90],[110,150],[50,90]].map(([x,y],i)=>(
        <polygon key={i} points={`${x},${y-18} ${x+18},${y} ${x},${y+18} ${x-18},${y}`}
          fill="none" stroke="#E8A020" strokeWidth="1.5" opacity="0.6"/>
      ))}
      {/* Centre star */}
      {Array.from({length:8},(_,i)=>{
        const a = (i*45*Math.PI)/180
        const r1=18,r2=9
        const x1=110+r1*Math.cos(a), y1=110+r1*Math.sin(a)
        const a2=(i*45+22.5)*Math.PI/180
        const x2=110+r2*Math.cos(a2), y2=110+r2*Math.sin(a2)
        return i<7 ? null : <polygon key="star"
          points={Array.from({length:8},(_,j)=>{
            const ang1=(j*45)*Math.PI/180, ang2=(j*45+22.5)*Math.PI/180
            return `${110+r1*Math.cos(ang1)},${110+r1*Math.sin(ang1)} ${110+r2*Math.cos(ang2)},${110+r2*Math.sin(ang2)}`
          }).join(' ')}
          fill="#E8A020" opacity="0.5" stroke="#E8A020" strokeWidth="1"/>
      })}
      <circle cx="110" cy="110" r="22" fill="none" stroke="#1A6B6B" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="110" cy="110" r="8" fill="#1A6B6B" opacity="0.4"/>
    </svg>
  )
}

function NatureDoodleSVG() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="220" height="220" fill="white"/>
      {/* Large leaf */}
      <path d="M110,195 Q50,150 45,100 Q40,45 110,22 Q180,45 175,100 Q170,150 110,195Z"
        fill="#EEF7F6" stroke="#1A6B6B" strokeWidth="2"/>
      {/* Leaf midrib */}
      <line x1="110" y1="25" x2="110" y2="192" stroke="#1A6B6B" strokeWidth="1.8"/>
      {/* Veins */}
      {[-40,-28,-15,0,15,28,40].map((offset,i)=>{
        const y=60+i*19
        return <g key={i}>
          <path d={`M110,${y} Q${110+offset*0.6},${y-10} ${110+offset},${y-5}`} stroke="#2D9B8A" strokeWidth="1" opacity="0.7" fill="none"/>
          <path d={`M110,${y} Q${110-offset*0.6},${y-10} ${110-offset},${y-5}`} stroke="#2D9B8A" strokeWidth="1" opacity="0.7" fill="none"/>
        </g>
      })}
      {/* Small flowers on stem */}
      {[[78,60],[142,75],[68,115],[152,120],[88,160],[132,155]].map(([cx,cy],i)=>(
        <g key={i}>
          {Array.from({length:5},(_,j)=>{
            const a=(j*72*Math.PI)/180
            return <ellipse key={j} cx={cx+8*Math.cos(a)} cy={cy+8*Math.sin(a)}
              rx="4" ry="6" transform={`rotate(${j*72} ${cx+8*Math.cos(a)} ${cy+8*Math.sin(a)})`}
              fill="#E8A020" opacity="0.4" stroke="#E8A020" strokeWidth="0.8"/>
          })}
          <circle cx={cx} cy={cy} r="3.5" fill="#1A6B6B" opacity="0.7"/>
        </g>
      ))}
      {/* Small dots along veins */}
      {[[88,80],[132,80],[78,100],[142,100],[85,135],[135,135]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="2" fill="#2D9B8A" opacity="0.5"/>
      ))}
    </svg>
  )
}

function FlowArtSVG() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="220" height="220" fill="white"/>
      {/* Topographic-style contours */}
      {[
        "M20,110 C40,60 80,40 110,35 C140,30 180,55 200,110 C180,165 140,190 110,185 C80,180 40,160 20,110Z",
        "M35,110 C55,70 85,55 110,50 C135,45 165,68 185,110 C165,152 135,167 110,162 C85,157 55,150 35,110Z",
        "M52,110 C68,78 90,68 110,65 C130,62 152,78 168,110 C152,142 130,152 110,148 C90,144 68,142 52,110Z",
        "M70,110 C82,88 96,82 110,80 C124,78 138,88 150,110 C138,132 124,138 110,136 C96,134 82,132 70,110Z",
        "M88,110 C96,96 102,92 110,92 C118,92 124,96 132,110 C124,124 118,128 110,128 C102,128 96,124 88,110Z",
      ].map((d,i)=>(
        <path key={i} d={d} stroke={i%2===0?'#1A6B6B':'#2D9B8A'}
          strokeWidth={1.5-i*0.2} opacity={0.35+i*0.13} fill={i===4?'#E8A020':i%2===0?'#EEF7F6':'none'}
          fillOpacity={i===4?0.3:i%2===0?0.1:0}/>
      ))}
      {/* Flowing curves overlaid */}
      {[
        "M10,50 C60,30 100,70 140,40 C170,18 200,60 215,80",
        "M5,90  C50,75 95,115 140,85 C175,60 205,95 218,115",
        "M10,160 C55,140 100,180 150,150 C180,130 205,160 215,175",
      ].map((d,i)=>(
        <path key={i} d={d} stroke="#E8A020" strokeWidth="1.5" opacity={0.35+i*0.15} fill="none" strokeDasharray={i===1?'':''}/>
      ))}
      {/* Small accent dots */}
      {[[40,40],[80,70],[160,55],[180,160],[60,175],[110,110]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i===5?6:3} fill={i%2===0?'#E8A020':'#2D9B8A'} opacity="0.55"/>
      ))}
    </svg>
  )
}

function IslamicGeometricSVG() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="220" height="220" fill="#EEF7F6"/>
      {/* 8-pointed star grid pattern */}
      {([[110,110],[110,0],[110,220],[0,110],[220,110],[0,0],[220,0],[0,220],[220,220]] as [number,number][]).map(([cx,cy],idx)=>{
        const r=55, pts=Array.from({length:16},(_,i)=>{
          const a=i*22.5*Math.PI/180
          const rad = i%2===0 ? r : r*0.41
          return `${cx+rad*Math.cos(a-Math.PI/2)},${cy+rad*Math.sin(a-Math.PI/2)}`
        }).join(' ')
        return <polygon key={idx} points={pts}
          fill={idx===0?'#2D9B8A':'#1A6B6B'} opacity={idx===0?0.2:0.12}
          stroke="#1A6B6B" strokeWidth="1"/>
      })}
      {/* Connecting lines */}
      {[0,45,90,135].map(deg=>(
        <line key={deg}
          x1={110+110*Math.cos(deg*Math.PI/180)} y1={110+110*Math.sin(deg*Math.PI/180)}
          x2={110-110*Math.cos(deg*Math.PI/180)} y2={110-110*Math.sin(deg*Math.PI/180)}
          stroke="#E8A020" strokeWidth="0.8" opacity="0.4"/>
      ))}
      {/* Centre detail */}
      <circle cx="110" cy="110" r="22" fill="none" stroke="#E8A020" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="110" cy="110" r="14" fill="#E8A020" opacity="0.2" stroke="#E8A020" strokeWidth="1"/>
      {Array.from({length:8},(_,i)=>{
        const a=i*45*Math.PI/180
        return <line key={i} x1={110+14*Math.cos(a)} y1={110+14*Math.sin(a)}
          x2={110+22*Math.cos(a)} y2={110+22*Math.sin(a)}
          stroke="#1A6B6B" strokeWidth="1.5" opacity="0.6"/>
      })}
      <circle cx="110" cy="110" r="5" fill="#1A6B6B" opacity="0.7"/>
    </svg>
  )
}

function BrushLetteringSVG() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="220" height="220" fill="white"/>
      {/* Baseline rules */}
      <line x1="20" y1="170" x2="200" y2="170" stroke="#A8D8D0" strokeWidth="0.8" strokeDasharray="4 3"/>
      <line x1="20" y1="145" x2="200" y2="145" stroke="#A8D8D0" strokeWidth="0.5" strokeDasharray="4 3"/>
      <line x1="20" y1="90" x2="200" y2="90" stroke="#A8D8D0" strokeWidth="0.5" strokeDasharray="4 3"/>
      {/* Stylised word "Calm" in brush script */}
      {/* C */}
      <path d="M30,125 C22,110 22,95 28,85 C34,75 48,72 58,80" stroke="#1A6B6B" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M30,125 C22,140 24,155 32,162 C40,168 52,165 60,158" stroke="#1A6B6B" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* a */}
      <path d="M72,115 C70,105 75,95 85,95 C95,95 100,104 98,115 C96,126 86,130 80,128 C74,126 70,120 72,115Z" stroke="#2D9B8A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <line x1="98" y1="95" x2="100" y2="130" stroke="#2D9B8A" strokeWidth="2.5" strokeLinecap="round"/>
      {/* l */}
      <path d="M112,75 C113,100 112,120 113,130" stroke="#1A6B6B" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M113,130 C114,138 118,142 124,140" stroke="#1A6B6B" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* m */}
      <path d="M130,110 L131,130" stroke="#E8A020" strokeWidth="3" strokeLinecap="round"/>
      <path d="M130,110 C133,100 142,97 148,103 L149,130" stroke="#E8A020" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M148,104 C152,97 162,97 166,104 L167,130" stroke="#E8A020" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Decorative flourish */}
      <path d="M25,65 C50,55 80,58 110,52 C140,46 175,55 200,50" stroke="#E8A020" strokeWidth="1" opacity="0.4" fill="none" strokeDasharray="3 2"/>
      <path d="M20,185 C60,178 120,182 200,178" stroke="#2D9B8A" strokeWidth="1.2" opacity="0.4" fill="none"/>
      {/* Small stars */}
      {[[45,42],[160,40],[190,80],[35,195],[185,195]].map(([x,y],i)=>(
        <text key={i} x={x} y={y} fontSize="12" fill="#E8A020" opacity="0.5" textAnchor="middle">✦</text>
      ))}
    </svg>
  )
}

function ContourSVG() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="220" height="220" fill="white"/>
      {/* A simple hand outline — blind contour style (wobbly, continuous line) */}
      <path d="
        M85,195 C80,185 78,175 80,160
        C82,145 84,135 83,125
        L82,90 C82,82 88,76 94,78 C100,80 102,88 102,96
        L103,65 C103,57 109,52 115,54 C121,56 122,64 122,72
        L122,55 C122,47 128,43 134,45 C140,47 141,56 140,64
        L140,60 C140,52 146,49 151,52 C157,55 157,65 155,76
        L153,98 C158,90 165,88 168,93 C172,99 168,108 160,116
        L148,130 C146,140 145,155 144,165 C143,178 140,188 135,195
        Z"
        stroke="#1A6B6B" strokeWidth="2" fill="#EEF7F6" strokeLinejoin="round" strokeLinecap="round"/>
      {/* Finger creases — contour detail lines */}
      <path d="M96,96 C99,93 104,93 105,96" stroke="#2D9B8A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M119,72 C122,69 126,70 127,73" stroke="#2D9B8A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M138,64 C140,61 143,62 144,65" stroke="#2D9B8A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M152,75 C153,72 156,73 157,76" stroke="#2D9B8A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Palm line */}
      <path d="M87,140 C100,133 120,135 135,142" stroke="#E8A020" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Life line */}
      <path d="M95,155 C105,145 115,148 118,158" stroke="#E8A020" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5"/>
      {/* Shading dots */}
      {[[92,110],[112,115],[130,115],[105,135],[125,132]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.5" fill="#1A6B6B" opacity="0.3"/>
      ))}
    </svg>
  )
}

/* ─── Category Data ──────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    id: 'zentangle',
    title: 'Zentangle',
    emoji: '🔲',
    tagline: 'Structured calm, one stroke at a time.',
    description: 'Zentangle is a trademarked method invented by Rick Roberts and Maria Thomas. You draw on a small 3.5" square tile, using repetitive structured patterns called "tangles". Each tangle has a name — Printemps, Hollibaugh, Knightsbridge — and a step-by-step instruction. The result looks complex, but every stroke is simple and deliberate. There is no erasing. There are no mistakes.',
    benefits: ['Reduces anxiety and racing thoughts', 'Requires no artistic experience', 'Produces consistently beautiful results', 'Mindful focus on each individual stroke'],
    materials: ['Sakura Micron pen (01 or 05)', '3.5" Zentangle tiles (or cut watercolour paper)', 'Pencil for shading'],
    howToStart: 'Draw a border. Add a "string" (a light pencil line dividing your tile into sections). Fill each section with a different tangle pattern — one stroke at a time. Shade lightly to add depth.',
    difficulty: 'Beginner',
    timeNeeded: '15–30 min',
    svg: <ZentangleSVG />,
    accent: 'border-teal-mid',
    badgeColor: 'bg-teal-ghost text-teal-deep',
  },
  {
    id: 'zendoodle',
    title: 'ZenDoodle',
    emoji: '✏️',
    tagline: 'Free-form flow with no rules.',
    description: 'ZenDoodle is the free-spirited cousin of Zentangle. There are no tiles, no strings, no official tangle names. You simply begin drawing — organic shapes, flowing lines, patterns that feel good — and keep filling in space. It is spontaneous, intuitive, and deeply calming. What starts as a single circle or squiggle expands into something you couldn\'t have planned.',
    benefits: ['Complete creative freedom', 'Great for releasing mental clutter', 'Works on any paper with any pen', 'Encouraging for people who "can\'t draw"'],
    materials: ['Any pen (gel pen, ballpoint, or fineliner)', 'Any paper, notebook, or margin of a page', 'Optional: coloured pens or watercolour'],
    howToStart: 'Draw any shape — a circle, a blob, a triangle. Divide it into sections with organic lines. Fill each section with a pattern that feels natural. Expand outward until the page feels full.',
    difficulty: 'All Levels',
    timeNeeded: '10–60 min',
    svg: <ZenDoodleSVG />,
    accent: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
  },
  {
    id: 'mandala',
    title: 'Mandala Art',
    emoji: '🪷',
    tagline: 'Sacred circles, infinite calm.',
    description: 'Mandala means "circle" in Sanskrit, and mandala art has been used for thousands of years in Buddhist and Hindu traditions as a tool for meditation and focus. You work outward from a central point, creating symmetrical layers of petals, dots, and geometric shapes. The repetitive, symmetrical nature activates a deep meditative state. Many practitioners report that drawing mandalas is more calming than traditional meditation.',
    benefits: ['Deep meditative focus through symmetry', 'Rich cultural and spiritual history', 'Endlessly customisable in size and complexity', 'The process IS the meditation'],
    materials: ['Compass and ruler (or mandala stencil set)', 'Fine-liner pens (0.05–0.3)', 'Coloured pencils or watercolour for filling'],
    howToStart: 'Draw concentric circles at equal intervals. Add 8 equally spaced guide lines. Start from the centre and work outward, repeating the same shapes in each segment. Keep each ring consistent.',
    difficulty: 'Beginner–Intermediate',
    timeNeeded: '30–90 min',
    svg: <MandalaSVG />,
    accent: 'border-amber/50',
    badgeColor: 'bg-amber/15 text-amber',
  },
  {
    id: 'geometric',
    title: 'Geometric Patterns',
    emoji: '🔷',
    tagline: 'Precision, pattern, and peace.',
    description: 'Geometric drawing uses mathematical precision — hexagons, diamonds, triangles, and grids — to create intricate patterns. Inspired by Islamic art, Celtic knotwork, and modern design, geometric drawing satisfies the analytical mind while engaging the creative one. The exactness is the meditation: counting, measuring, repeating. Every line serves the whole.',
    benefits: ['Satisfying for detail-oriented minds', 'Links to ancient mathematical traditions', 'Scales from simple to jaw-droppingly complex', 'Particularly effective for perfectionist anxiety'],
    materials: ['Ruler and compass', 'Dot-grid paper (isometric or square)', 'Technical drawing pens', 'Coloured markers or pencils'],
    howToStart: 'Start with dot-grid paper. Connect dots to form a hexagonal or square grid. Choose one unit (a single hexagon or diamond) and fill it with a pattern. Mirror and repeat across the grid.',
    difficulty: 'Beginner–Advanced',
    timeNeeded: '20–120 min',
    svg: <GeometricSVG />,
    accent: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
  },
  {
    id: 'nature',
    title: 'Nature Doodling',
    emoji: '🍃',
    tagline: 'The art of noticing the natural world.',
    description: 'Nature doodling means drawing what you see — or imagine — in the natural world: leaves with detailed veins, flowers with layered petals, feathers with delicate barbs, shells with spiralling chambers. It is observational art that slows you down and makes you genuinely look. You don\'t have to go outside to practise it — a single leaf on your desk is enough.',
    benefits: ['Deepens connection to the natural world', 'Trains observation and attention to detail', 'Seasonal subjects provide endless variety', 'Very peaceful and grounding'],
    materials: ['Fine-liner pens (0.1–0.5)', 'Sketchbook or watercolour paper', 'Watercolour or pencils for colour', 'A leaf, flower, or shell to observe'],
    howToStart: 'Pick up a single leaf. Look at it. Draw its outline, then add the midrib, then branch each vein. Add tiny patterns in the spaces between. Look more than you draw.',
    difficulty: 'All Levels',
    timeNeeded: '15–45 min',
    svg: <NatureDoodleSVG />,
    accent: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
  },
  {
    id: 'flow',
    title: 'Abstract Flow Art',
    emoji: '🌊',
    tagline: 'Let the lines lead — wherever they go.',
    description: 'Abstract flow art has no subject — only movement. It is inspired by topographic maps, ink in water, and the way rivers carve valleys. You draw flowing, organic contour lines that respond to each other, creating depth and landscape from pure line. It is arguably the most meditative of all drawing styles because there is nothing to get "right" — only flow to follow.',
    benefits: ['Zero pressure — no correct outcome', 'Deeply intuitive and emotionally expressive', 'Stunning results with minimal skill', 'Excellent for processing strong emotions'],
    materials: ['Any pen', 'Any paper', 'Watercolour wash (optional, adds depth)'],
    howToStart: 'Draw a simple organic shape in the centre. Draw a line that follows its outline, a short distance outside it. Keep adding lines that follow the previous one, like ripples in a pond. Fill the page.',
    difficulty: 'All Levels',
    timeNeeded: '15–45 min',
    svg: <FlowArtSVG />,
    accent: 'border-amber/40',
    badgeColor: 'bg-amber/15 text-amber',
  },
  {
    id: 'islamic',
    title: 'Islamic Geometric Art',
    emoji: '🕌',
    tagline: 'Where mathematics becomes devotion.',
    description: 'Islamic geometric art is one of the most sophisticated and mathematically precise art traditions in the world. It flourished from the 8th century onward, covering mosques, manuscripts, and palaces from Andalusia to Central Asia. All patterns are built from three shapes: the circle, the triangle, and the square — and their infinite, interlocking combinations. Drawing these patterns is both a mathematical and spiritual act.',
    benefits: ['Rich historical and cultural depth', 'Highly structured — reduces decision fatigue', 'Results are consistently stunning', 'Teaches the beauty of mathematical order'],
    materials: ['Compass and ruler (essential)', 'Fine-liner pens', 'Coloured pencils or ink for filling', 'Isometric or blank paper'],
    howToStart: 'Draw a circle. Inscribe a regular hexagon inside it. Connect every other vertex to create a Star of David, then extend the lines. The pattern will reveal itself.',
    difficulty: 'Intermediate',
    timeNeeded: '45–120 min',
    svg: <IslamicGeometricSVG />,
    accent: 'border-teal-mid',
    badgeColor: 'bg-teal-ghost text-teal-deep',
  },
  {
    id: 'lettering',
    title: 'Brush Lettering',
    emoji: '✒️',
    tagline: 'Words made beautiful — slowly.',
    description: 'Brush lettering is the practice of writing words in a flowing, calligraphic style using a brush pen or pointed nib. The key technique: thick strokes on the downstroke, thin strokes on the upstroke. It transforms everyday words — calm, hope, breathe — into visual affirmations. The deliberate, repetitive nature of practising letterforms is profoundly meditative, and the result is something you can keep.',
    benefits: ['Turns positive words into art', 'Handwriting itself is meditative', 'Great for creating cards, journals, and wall art', 'Builds focus through deliberate slow practice'],
    materials: ['Tombow Dual Brush Pen or Pentel Sign brush pen', 'Rhodia or Clairefontaine smooth paper', 'Ruling pencil for guide lines', 'Optional: watercolour for backgrounds'],
    howToStart: 'Practice the "u" shape. Down-stroke: press hard. Up-stroke: lift lightly. Once that feels natural, connect it into letters. Start with "calm", "love", "breathe". Say the word as you write it.',
    difficulty: 'Beginner',
    timeNeeded: '15–30 min per session',
    svg: <BrushLetteringSVG />,
    accent: 'border-amber/50',
    badgeColor: 'bg-amber/15 text-amber',
  },
  {
    id: 'contour',
    title: 'Contour & Blind Drawing',
    emoji: '👁️',
    tagline: 'Draw what you see, not what you think.',
    description: 'Contour drawing means drawing only the edges of what you see — no shading, no fill, just line. Blind contour drawing takes this further: you look only at your subject, never at the paper. The results are wonderfully imperfect and surprisingly insightful. It trains your eye to truly observe rather than to draw what your brain assumes is there. Artists use it as a daily warm-up. Mindfulness practitioners use it as presence training.',
    benefits: ['Trains genuine observation over assumption', 'Imperfection is the point — removes pressure', 'Works your hand-eye connection deeply', 'Each drawing is unique and personal'],
    materials: ['Any pen or pencil (no erasing allowed)', 'Sketchbook', 'Any subject — your hand, a shoe, a mug'],
    howToStart: 'Place your pen on the paper. Look at your subject — your hand works perfectly. Move your pen only as your eyes move along the edge of what you see. Do not look at the paper. Accept the result with joy.',
    difficulty: 'All Levels',
    timeNeeded: '5–20 min',
    svg: <ContourSVG />,
    accent: 'border-teal-light',
    badgeColor: 'bg-teal-ghost text-teal-deep',
  },
]

const STARTER_KIT = [
  { icon: '🖊️', item: 'Micron 01 Fine-liner', why: 'Clean, consistent lines — the workhorse pen for any meditative drawing style.' },
  { icon: '📓', item: 'Dot-grid notebook (A5)', why: 'The subtle dot grid helps with spacing and symmetry without dominating the page.' },
  { icon: '🖌️', item: 'Tombow Dual Brush Pen (black)', why: 'For brush lettering and adding soft shading to zentangle or mandala work.' },
  { icon: '📐', item: 'Compass + ruler', why: 'Essential for mandalas, geometric patterns, and Islamic art.' },
  { icon: '🎨', item: 'Watercolour set (small, 12 colours)', why: 'A light wash transforms any pen drawing into something luminous.' },
]

export default function DrawingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white relative overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.10)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
              <span className="w-6 h-0.5 bg-amber rounded" /> Positive Drawing
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
              Draw your way <em className="italic text-amber-soft">to calm.</em>
            </h1>
            <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[500px] mb-6">
              Meditative drawing is one of the most accessible and powerful tools for reducing anxiety,
              building focus, and accessing a quiet, creative part of yourself. No talent required.
              Just a pen, paper, and a few minutes.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a href="#categories"
                className="inline-flex items-center gap-2 bg-amber text-charcoal px-7 py-3 rounded-full font-semibold text-[0.92rem] no-underline hover:bg-amber-soft transition-colors">
                Explore Styles ↓
              </a>
              <a href="#starter-kit"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3 rounded-full font-medium text-[0.92rem] no-underline hover:bg-white/10 transition-colors">
                Starter Kit
              </a>
            </div>
          </div>
          {/* Mini gallery preview */}
          <div className="hidden md:grid grid-cols-3 gap-3 flex-shrink-0">
            {[<ZentangleSVG key="z"/>, <MandalaSVG key="m"/>, <GeometricSVG key="g"/>,
              <NatureDoodleSVG key="n"/>, <FlowArtSVG key="f"/>, <IslamicGeometricSVG key="i"/>].map((svg, i) => (
              <div key={i} className="w-[80px] h-[80px] bg-white rounded-[14px] p-1.5 shadow-sm overflow-hidden">
                {svg}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="bg-ivory py-14 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { icon: '🧠', title: 'Quiets the mind',  text: 'Repetitive mark-making slows brainwave activity, reducing cortisol and anxiety in as little as 10 minutes.' },
              { icon: '🎯', title: 'Builds focus',      text: 'Each stroke requires gentle, complete attention — the same quality as meditation, but with a visible result.' },
              { icon: '✨', title: 'No talent needed',  text: 'Every style here is built from simple, repeatable marks. The process is the point, not the product.' },
              { icon: '💛', title: 'Something to keep', text: 'Unlike meditation, you finish with a drawing — a tangible, beautiful record of your quiet time.' },
            ].map(b => (
              <div key={b.title} className="bg-white rounded-[20px] border border-teal-light p-6">
                <span className="text-[2rem] block mb-3">{b.icon}</span>
                <h3 className="font-body font-bold text-[0.95rem] text-teal-deep mb-2">{b.title}</h3>
                <p className="text-[0.85rem] text-text-light leading-[1.7]">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <div id="categories" className="max-w-6xl mx-auto py-14 px-[5%]">
        <div className="flex items-center gap-3 text-teal-mid text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-3 section-label">
          9 Styles to Explore
        </div>
        <h2 className="font-display text-[clamp(1.9rem,3vw,2.6rem)] text-charcoal leading-snug mb-12">
          Find the style that <em className="italic text-teal-deep">speaks to you.</em>
        </h2>

        <div className="space-y-16">
          {CATEGORIES.map((cat, idx) => (
            <div key={cat.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-start ${idx % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}>
              {/* SVG Sample */}
              <div className={`[direction:ltr] bg-white rounded-[28px] border-2 ${cat.accent} p-6 shadow-sm`}>
                <div className="w-full aspect-square max-w-[320px] mx-auto">
                  {cat.svg}
                </div>
                <p className="text-center text-[0.75rem] text-text-xlight mt-3 italic">
                  Sample illustration — {cat.title}
                </p>
              </div>

              {/* Text */}
              <div className="[direction:ltr]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[2rem]">{cat.emoji}</span>
                  <span className={`text-[0.7rem] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full ${cat.badgeColor}`}>
                    {cat.difficulty} · {cat.timeNeeded}
                  </span>
                </div>
                <h3 className="font-display text-[1.8rem] text-charcoal font-semibold mb-1">{cat.title}</h3>
                <p className="font-display italic text-teal-mid text-[1rem] mb-4">{cat.tagline}</p>
                <p className="text-text-mid text-[0.95rem] leading-[1.85] mb-6">{cat.description}</p>

                {/* Benefits */}
                <div className="mb-5">
                  <p className="text-[0.78rem] font-bold text-charcoal uppercase tracking-wider mb-2">Why it helps</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {cat.benefits.map(b => (
                      <div key={b} className="flex items-start gap-2 text-[0.85rem] text-text-mid">
                        <span className="text-teal-mid flex-shrink-0 mt-0.5">✓</span> {b}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div className="mb-5">
                  <p className="text-[0.78rem] font-bold text-charcoal uppercase tracking-wider mb-2">What you need</p>
                  <div className="flex gap-2 flex-wrap">
                    {cat.materials.map(m => (
                      <span key={m} className="text-[0.78rem] bg-teal-ghost text-teal-deep px-3 py-1 rounded-full border border-teal-light">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* How to start */}
                <div className="bg-amber-pale border border-amber/25 rounded-[16px] px-5 py-4">
                  <p className="text-[0.78rem] font-bold text-amber uppercase tracking-wider mb-1.5">How to begin</p>
                  <p className="text-[0.88rem] text-text-mid leading-[1.7]">{cat.howToStart}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Starter Kit */}
      <section id="starter-kit" className="bg-gradient-to-br from-teal-deep to-teal-dark py-16 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-3">Starter Kit</div>
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-semibold mb-2">
            Five things to buy once. <em className="italic text-amber-soft">Use forever.</em>
          </h2>
          <p className="text-white/65 text-[0.95rem] mb-10 max-w-[520px]">
            You don't need much. This small collection covers every style on this page.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STARTER_KIT.map(k => (
              <div key={k.item} className="bg-white/8 border border-white/15 rounded-[20px] p-5">
                <span className="text-[2rem] block mb-3">{k.icon}</span>
                <p className="font-semibold text-[0.9rem] mb-2">{k.item}</p>
                <p className="text-white/60 text-[0.8rem] leading-[1.65]">{k.why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily practice nudge */}
      <section className="bg-ivory py-16 px-[5%]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-[3.5rem] mb-4">✏️</div>
          <h2 className="font-display text-[1.8rem] text-charcoal font-semibold mb-4">
            Start with five minutes.
          </h2>
          <p className="text-text-mid text-[1rem] leading-[1.85] mb-6 max-w-[520px] mx-auto">
            You don't need a special time or a perfect mood. Open a notebook to a blank page.
            Draw a border. Begin inside it. The calm will follow the mark — it always does.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/journal"
              className="inline-flex items-center gap-2 bg-teal-deep text-white px-7 py-3 rounded-full font-semibold text-[0.92rem] no-underline hover:bg-teal-dark transition-colors">
              Open Your Journal →
            </Link>
            <Link href="/challenges"
              className="inline-flex items-center gap-2 border border-teal-light text-text-mid px-7 py-3 rounded-full font-medium text-[0.92rem] no-underline hover:border-teal-mid hover:text-teal-deep transition-colors">
              Drawing Challenge
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

import { motion } from 'framer-motion';

export default function GiraffeLegoIllustration() {
  return (
    <div className="relative w-full h-full min-h-[440px] flex items-center justify-center select-none overflow-hidden">
      {/* Warm Ambient Lamp Lighting Halo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '120%',
          height: '120%',
          top: '-10%',
          left: '-10%',
          background: `
            radial-gradient(circle at 48% 28%, rgba(254, 215, 170, 0.22) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 72%),
            radial-gradient(ellipse at 50% 80%, rgba(156, 78, 110, 0.12) 0%, transparent 60%)
          `,
        }}
      />

      {/* Floating gentle light motes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-200/40 blur-[0.5px]"
            style={{
              width: `${(i % 3) * 1.5 + 2}px`,
              height: `${(i % 3) * 1.5 + 2}px`,
              left: `${(i * 17 + 8) % 88}%`,
              top: `${(i * 23 + 12) % 80}%`,
            }}
            animate={{
              y: [0, -18, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 3.5 + (i % 3) * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Main SVG Scene Canvas */}
      <svg
        viewBox="0 0 640 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[560px] drop-shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="lampGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="rugGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#25212c" />
            <stop offset="50%" stopColor="#30293a" />
            <stop offset="100%" stopColor="#25212c" />
          </linearGradient>

          {/* Character 1 (Companion) Navy Hoodie Gradients */}
          <linearGradient id="companionSweater" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#383d5c" />
            <stop offset="100%" stopColor="#23263b" />
          </linearGradient>

          {/* Character 2 (Gayathri) Mauve/Dusty Rose Gradients */}
          <linearGradient id="gayathriSweater" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b3587e" />
            <stop offset="100%" stopColor="#873f5e" />
          </linearGradient>

          {/* LEGO Giraffe Yellow Plastic Gradient */}
          <linearGradient id="legoYellow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="legoBrown" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#5a2307" />
          </linearGradient>

          {/* Drop Shadow Filter */}
          <filter id="brickShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* ─── 1. Background Indoor Architecture & Hanging Lamp ─── */}
        {/* Soft back wall divider line */}
        <line x1="40" y1="360" x2="600" y2="360" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

        {/* Cozy Circular Braided Rug */}
        <ellipse cx="320" cy="425" rx="270" ry="85" fill="url(#rugGradient)" />
        <ellipse cx="320" cy="425" rx="260" ry="80" stroke="rgba(244, 114, 182, 0.12)" strokeWidth="1" strokeDasharray="4 4" />
        <ellipse cx="320" cy="425" rx="210" ry="62" stroke="rgba(251, 191, 36, 0.1)" strokeWidth="1" strokeDasharray="6 4" />

        {/* Hanging Pendant Lamp from ceiling */}
        <line x1="320" y1="0" x2="320" y2="90" stroke="#71717a" strokeWidth="1.5" />
        <path d="M300 90 Q320 70 340 90 L335 102 H305 Z" fill="#3f3f46" stroke="#52525b" strokeWidth="1" />
        <circle cx="320" cy="104" r="5" fill="#fef08a" />
        {/* Lamp light cone */}
        <polygon points="320,105 210,340 430,340" fill="url(#lampGlow)" opacity="0.45" />

        {/* ─── 2. GIRAFFE LEGO MODEL (Centerpiece) ─── */}
        <g id="lego-giraffe" filter="url(#brickShadow)">
          {/* LEGO Legs (4 yellow pillar brick columns with dark brown hooves) */}
          {/* Back Left Leg */}
          <rect x="290" y="325" width="12" height="42" rx="2" fill="url(#legoYellow)" />
          <rect x="290" y="360" width="12" height="10" rx="1.5" fill="url(#legoBrown)" />
          {/* Front Left Leg */}
          <rect x="306" y="335" width="13" height="42" rx="2" fill="url(#legoYellow)" />
          <rect x="306" y="370" width="13" height="10" rx="1.5" fill="url(#legoBrown)" />
          {/* Back Right Leg */}
          <rect x="330" y="325" width="12" height="42" rx="2" fill="url(#legoYellow)" />
          <rect x="330" y="360" width="12" height="10" rx="1.5" fill="url(#legoBrown)" />
          {/* Front Right Leg */}
          <rect x="345" y="335" width="13" height="42" rx="2" fill="url(#legoYellow)" />
          <rect x="345" y="370" width="13" height="10" rx="1.5" fill="url(#legoBrown)" />

          {/* Giraffe Body Bricks (layer of interlocking yellow & brown spot bricks) */}
          <rect x="282" y="300" width="76" height="32" rx="3" fill="url(#legoYellow)" stroke="#b45309" strokeWidth="0.8" />
          {/* Brown spot bricks on body */}
          <rect x="295" y="306" width="16" height="12" rx="1.5" fill="url(#legoBrown)" />
          <rect x="325" y="312" width="18" height="12" rx="1.5" fill="url(#legoBrown)" />
          {/* Tiny tail */}
          <path d="M282 314 Q272 322 274 336" stroke="#b45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="274" cy="336" r="2.5" fill="#78350f" />

          {/* Giraffe Long Neck (Stepped articulated LEGO bricks rising upward) */}
          {/* Neck base */}
          <rect x="334" y="272" width="22" height="30" rx="2" fill="url(#legoYellow)" stroke="#b45309" strokeWidth="0.7" />
          <rect x="336" y="278" width="10" height="8" rx="1" fill="url(#legoBrown)" />

          {/* Neck middle */}
          <rect x="336" y="238" width="20" height="36" rx="2" fill="url(#legoYellow)" stroke="#b45309" strokeWidth="0.7" />
          <rect x="342" y="246" width="10" height="9" rx="1" fill="url(#legoBrown)" />

          {/* Neck upper */}
          <rect x="338" y="202" width="19" height="38" rx="2" fill="url(#legoYellow)" stroke="#b45309" strokeWidth="0.7" />
          <rect x="339" y="212" width="9" height="8" rx="1" fill="url(#legoBrown)" />

          {/* LEGO Giraffe Head & Muzzle */}
          <rect x="336" y="174" width="30" height="28" rx="3" fill="url(#legoYellow)" stroke="#b45309" strokeWidth="0.8" />
          {/* Giraffe Muzzle / Snout brick */}
          <rect x="362" y="184" width="16" height="16" rx="2" fill="#fed7aa" stroke="#d97706" strokeWidth="0.7" />
          <circle cx="372" cy="191" r="1.5" fill="#78350f" />
          {/* Cute Giraffe Eye brick stud */}
          <circle cx="355" cy="184" r="3" fill="#1e1b4b" />
          <circle cx="356" cy="183" r="1" fill="#ffffff" />
          {/* Giraffe Ears */}
          <polygon points="340,174 332,166 339,168" fill="#d97706" />
          {/* Giraffe Ossicones (Horns with studs on top) */}
          <rect x="345" y="160" width="3.5" height="15" rx="1" fill="url(#legoBrown)" />
          <circle cx="347" cy="159" r="3" fill="#78350f" />
          <rect x="353" y="160" width="3.5" height="15" rx="1" fill="url(#legoBrown)" />
          <circle cx="355" cy="159" r="3" fill="#78350f" />

          {/* Characteristic LEGO Cylindrical Studs on top surfaces */}
          {[
            [286, 297], [298, 297], [310, 297], [322, 297], [334, 297], [346, 297],
            [338, 269], [348, 269],
            [340, 235], [350, 235],
            [342, 199], [350, 199],
            [364, 181], [372, 181],
          ].map(([sx, sy], idx) => (
            <ellipse key={idx} cx={sx} cy={sy} rx="3.5" ry="1.8" fill="#fde68a" stroke="#d97706" strokeWidth="0.5" />
          ))}
        </g>

        {/* ─── 3. TWO CHARACTERS SITTING TOGETHER ─── */}

        {/* --- CHARACTER 1 (COMPANION, LEFT) --- */}
        {/* Canonical matching design: dark hair, slate-navy hoodie/sweater (#262a42) */}
        <g id="character-companion">
          {/* Shadow under body */}
          <ellipse cx="195" cy="425" rx="55" ry="18" fill="rgba(0,0,0,0.35)" />

          {/* Legs folded casually on rug */}
          <path d="M150 395 Q190 435 240 405 Q225 385 190 380 Z" fill="#181824" />

          {/* Torso / Slate-Navy Sweater */}
          <path
            d="M165 295 C150 340 145 390 190 395 C230 395 240 350 235 295 C215 285 185 285 165 295 Z"
            fill="url(#companionSweater)"
            stroke="#1e2133"
            strokeWidth="0.8"
          />

          {/* Neck */}
          <rect x="193" y="275" width="16" height="15" rx="3" fill="#e8b999" />

          {/* Head & Face */}
          <circle cx="201" cy="250" r="28" fill="#f3c9aa" />

          {/* Dark Hair (neat, short casual companion hair) */}
          <path
            d="M172 250 C170 220 190 215 220 218 C232 225 235 242 233 255 C226 242 220 235 200 234 C185 234 176 244 172 250 Z"
            fill="#1c1917"
          />

          {/* Profile Eye & Gentle Smile towards the giraffe and Gayathri */}
          <circle cx="218" cy="248" r="2.2" fill="#1f2937" />
          <path d="M216 260 Q222 264 227 259" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Left Arm resting comfortably */}
          <path d="M165 305 Q150 350 175 375" stroke="url(#companionSweater)" strokeWidth="18" strokeLinecap="round" fill="none" />

          {/* Right Arm extended, holding an amber LEGO brick toward the giraffe */}
          <path d="M225 315 Q255 330 278 335" stroke="url(#companionSweater)" strokeWidth="16" strokeLinecap="round" fill="none" />
          {/* Hand */}
          <circle cx="282" cy="336" r="6" fill="#f3c9aa" />

          {/* LEGO piece held in hand ready to add */}
          <g filter="url(#brickShadow)">
            <rect x="282" y="328" width="14" height="10" rx="1.5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.7" />
            <ellipse cx="286" cy="327" rx="2" ry="1" fill="#fde68a" />
            <ellipse cx="292" cy="327" rx="2" ry="1" fill="#fde68a" />
          </g>
        </g>

        {/* --- CHARACTER 2 (GAYATHRI, RIGHT) --- */}
        {/* Canonical matching design: dark hair with soft waves, warm dusty rose/mauve sweater (#9c4e6e), stylish glasses */}
        <g id="character-gayathri">
          {/* Shadow under body */}
          <ellipse cx="445" cy="425" rx="55" ry="18" fill="rgba(0,0,0,0.35)" />

          {/* Sitting folded cross-legged on rug */}
          <path d="M400 405 Q445 435 488 395 Q455 380 415 385 Z" fill="#2d1b27" />

          {/* Torso / Dusty Rose Mauve Sweater */}
          <path
            d="M405 298 C398 345 408 395 450 395 C490 390 488 340 472 298 C452 288 425 288 405 298 Z"
            fill="url(#gayathriSweater)"
            stroke="#6b2b48"
            strokeWidth="0.8"
          />

          {/* Neck */}
          <rect x="430" y="278" width="15" height="14" rx="3" fill="#e8b999" />

          {/* Head & Face */}
          <circle cx="438" cy="252" r="26" fill="#f3c9aa" />

          {/* Dark Soft Wavy Hair */}
          <path
            d="M410 255 C408 218 435 214 464 218 C476 226 478 248 474 268 C470 282 462 295 460 305 C456 295 458 275 452 250 C445 235 430 235 418 242 C412 248 410 255 410 255 Z"
            fill="#1c1917"
          />
          {/* Soft hair strand on side */}
          <path d="M412 250 Q405 268 408 285" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Gayathri's Stylish Glasses ("people with glasses are hot") */}
          <g id="gayathri-glasses">
            <circle cx="425" cy="252" r="6.5" stroke="#fbcfe8" strokeWidth="1.2" fill="rgba(255,255,255,0.15)" />
            <circle cx="440" cy="252" r="6.5" stroke="#fbcfe8" strokeWidth="1.2" fill="rgba(255,255,255,0.15)" />
            <line x1="431.5" y1="252" x2="433.5" y2="252" stroke="#fbcfe8" strokeWidth="1.2" />
            <line x1="418.5" y1="250" x2="413" y2="248" stroke="#fbcfe8" strokeWidth="1" />
          </g>

          {/* Eye behind glasses & warm joyful smile */}
          <circle cx="425" cy="252" r="2" fill="#1f2937" />
          <path d="M422 264 Q429 270 436 265" stroke="#9a3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Left Arm reaching gracefully toward giraffe neck */}
          <path d="M410 318 Q382 320 366 265" stroke="url(#gayathriSweater)" strokeWidth="15" strokeLinecap="round" fill="none" />
          {/* Hand delicately placing/adjusting the giraffe head */}
          <circle cx="365" cy="260" r="5.5" fill="#f3c9aa" />

          {/* Right Arm resting relaxed beside knee */}
          <path d="M472 315 Q485 355 465 378" stroke="url(#gayathriSweater)" strokeWidth="15" strokeLinecap="round" fill="none" />
        </g>

        {/* ─── 4. SCATTERED LEGO BRICKS & EASTER EGGS ON THE RUG ─── */}

        {/* Cluster of colorful bricks around the giraffe */}
        <g id="scattered-bricks" filter="url(#brickShadow)">
          {/* Teal 2x2 brick */}
          <rect x="250" y="380" width="16" height="10" rx="1.5" fill="#0d9488" stroke="#115e59" strokeWidth="0.5" />
          <ellipse cx="254" cy="379" rx="2" ry="1" fill="#5eead4" />
          <ellipse cx="262" cy="379" rx="2" ry="1" fill="#5eead4" />

          {/* Coral Pink 2x4 brick */}
          <rect x="365" y="392" width="24" height="10" rx="1.5" fill="#f43f5e" stroke="#be123c" strokeWidth="0.5" />
          <ellipse cx="370" cy="391" rx="2" ry="1" fill="#fda4af" />
          <ellipse cx="377" cy="391" rx="2" ry="1" fill="#fda4af" />
          <ellipse cx="384" cy="391" rx="2" ry="1" fill="#fda4af" />

          {/* Orange brick */}
          <rect x="310" y="415" width="18" height="9" rx="1.5" fill="#ea580c" stroke="#c2410c" strokeWidth="0.5" />
          <ellipse cx="315" cy="414" rx="2" ry="1" fill="#fdba74" />
          <ellipse cx="323" cy="414" rx="2" ry="1" fill="#fdba74" />

          {/* White 2x2 brick */}
          <rect x="272" y="405" width="14" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
          <ellipse cx="276" cy="404" rx="2" ry="1" fill="#ffffff" />
          <ellipse cx="282" cy="404" rx="2" ry="1" fill="#ffffff" />

          {/* ✦ EASTER EGG 1: Golden-Beige LEGO brick engraved with "paalakova" */}
          <g id="brick-paalakova">
            <rect x="230" y="405" width="28" height="11" rx="1.5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.6" />
            <ellipse cx="235" cy="404" rx="2" ry="1" fill="#ffffff" />
            <ellipse cx="243" cy="404" rx="2" ry="1" fill="#ffffff" />
            <ellipse cx="251" cy="404" rx="2" ry="1" fill="#ffffff" />
            <text x="244" y="413.5" fill="#92400e" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              paalakova
            </text>
          </g>

          {/* ✦ EASTER EGG 2: Sweet tin / brick box labeled "boppatlu" */}
          <g id="snack-boppatlu">
            <rect x="395" y="410" width="30" height="12" rx="2" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.7" />
            <ellipse cx="410" cy="410" rx="15" ry="3" fill="#ffedd5" />
            <text x="410" y="419" fill="#9a3412" fontSize="5.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              boppatlu
            </text>
          </g>

          {/* ✦ EASTER EGG 3: Cute little LEGO/wooden dog figurine beside them */}
          <g id="lego-dog" transform="translate(375, 362) scale(0.85)">
            <ellipse cx="14" cy="22" rx="16" ry="6" fill="rgba(0,0,0,0.3)" />
            {/* Dog body */}
            <rect x="4" y="8" width="16" height="10" rx="2" fill="#d97706" />
            {/* Dog legs */}
            <rect x="5" y="18" width="3" height="5" fill="#b45309" />
            <rect x="15" y="18" width="3" height="5" fill="#b45309" />
            {/* Dog head & floppy ear */}
            <rect x="18" y="3" width="9" height="9" rx="2" fill="#d97706" />
            <rect x="25" y="6" width="5" height="5" rx="1" fill="#fed7aa" />
            <polygon points="20,3 17,7 21,7" fill="#78350f" />
            <circle cx="24" cy="6" r="1" fill="#1e1b4b" />
            {/* Wagging tail */}
            <line x1="4" y1="10" x2="0" y2="6" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
            <text x="14" y="27" fill="rgba(254,240,138,0.7)" fontSize="4.5" fontFamily="monospace" textAnchor="middle">
              ✦ pup
            </text>
          </g>

          {/* ✦ EASTER EGG 4: Tiny retro TV on edge of floor labeled "tv pillakai" */}
          <g id="tv-pillakai" transform="translate(110, 395) scale(0.9)">
            <rect x="0" y="0" width="24" height="18" rx="3" fill="#27272a" stroke="#52525b" strokeWidth="0.8" />
            <rect x="2" y="2" width="14" height="12" rx="1.5" fill="#3f3f46" />
            <line x1="7" y1="0" x2="4" y2="-4" stroke="#71717a" strokeWidth="1" />
            <line x1="9" y1="0" x2="12" y2="-4" stroke="#71717a" strokeWidth="1" />
            <text x="9" y="10" fill="#a1a1aa" fontSize="3.5" fontFamily="sans-serif" textAnchor="middle">
              tv pillakai
            </text>
          </g>

          {/* ✦ EASTER EGG 5: Tiny keychain tag labeled "daddie ka baddie" */}
          <g id="tag-daddie-baddie" transform="translate(485, 412) rotate(-8)">
            <rect x="0" y="0" width="34" height="11" rx="3" fill="#f43f5e" stroke="#fda4af" strokeWidth="0.6" opacity="0.9" />
            <circle cx="4" cy="5.5" r="1.5" fill="#ffffff" />
            <text x="18" y="7.5" fill="#ffffff" fontSize="4.5" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
              daddie ka baddie
            </text>
          </g>
        </g>

        {/* ─── 5. HANDWRITTEN POLAROID / STICKY NOTES ─── */}
        {/* Note 1: "lowkey elegant soul, baddie in a nutshell." */}
        <g transform="translate(70, 140) rotate(-4)" className="cursor-default">
          <rect x="0" y="0" width="135" height="60" rx="6" fill="#fefce8" stroke="#fde047" strokeWidth="0.8" filter="url(#brickShadow)" />
          {/* Washi tape pin */}
          <rect x="45" y="-5" width="38" height="11" rx="1" fill="rgba(244,114,182,0.4)" transform="rotate(3)" />
          <text x="10" y="20" fill="#713f12" fontSize="7" fontFamily="sans-serif" letterSpacing="0.08em" fontWeight="bold">
            GAYATHRI
          </text>
          <text x="10" y="34" fill="#1c1917" fontSize="8" fontFamily="'Caveat', cursive, serif" fontStyle="italic">
            lowkey elegant soul,
          </text>
          <text x="10" y="47" fill="#1c1917" fontSize="8" fontFamily="'Caveat', cursive, serif" fontStyle="italic">
            baddie in a nutshell.
          </text>
        </g>

        {/* Note 2: "a weirdo but im real tho" */}
        <g transform="translate(470, 130) rotate(5)" className="cursor-default">
          <rect x="0" y="0" width="128" height="52" rx="6" fill="#fff1f2" stroke="#fecdd3" strokeWidth="0.8" filter="url(#brickShadow)" />
          {/* Washi tape pin */}
          <rect x="42" y="-5" width="34" height="10" rx="1" fill="rgba(251,191,36,0.4)" transform="rotate(-2)" />
          <text x="10" y="24" fill="#9f1239" fontSize="8.5" fontFamily="'Caveat', cursive, serif" fontStyle="italic">
            "a weirdo but im real tho"
          </text>
          <text x="10" y="40" fill="#881337" fontSize="6.5" fontFamily="monospace" letterSpacing="0.05em">
            [ low iron, high lore ]
          </text>
        </g>
      </svg>
    </div>
  );
}

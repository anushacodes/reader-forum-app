import { DogSvg } from './Logo.jsx'

/**
 * Handcrafted vector illustrated icons matching the Dogear logo art style:
 * Clean black ink line-art (2.5px stroke), white fill, rounded caps, friendly character expressions.
 */

export function DogIcon({ className = 'h-full w-full' }) {
  return (
    <DogSvg className={`object-contain ${className}`} />
  )
}

export function GirlIcon({ className = 'h-full w-full' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Girl icon"
    >
      {/* Hair Buns / Tails */}
      <circle cx="13" cy="25" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="51" cy="25" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 25C13 29 16 31 18 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 25C51 29 48 31 46 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Head / Face */}
      <path
        d="M18 28C18 19 23 13 32 13C41 13 46 19 46 28C46 41 40 51 32 51C24 51 18 41 18 28Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Hair Bangs Fringe */}
      <path
        d="M18 26C21 28 26 29 32 24C37 29 43 28 46 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Eyeballs with sparkle glint */}
      <circle cx="26" cy="33" r="2.8" fill="currentColor" />
      <circle cx="27" cy="32" r="0.9" fill="#ffffff" />
      <circle cx="38" cy="33" r="2.8" fill="currentColor" />
      <circle cx="39" cy="32" r="0.9" fill="#ffffff" />

      {/* Cute little button nose */}
      <circle cx="32" cy="37" r="1.2" fill="currentColor" />

      {/* Sweet Smile */}
      <path
        d="M28 41C29.5 44 34.5 44 36 41"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Cheeks */}
      <path d="M21 38Q23 39 24 38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M40 38Q41 39 43 38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function BoyIcon({ className = 'h-full w-full' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Boy icon"
    >
      {/* Ears */}
      <circle cx="16" cy="34" r="4" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="48" cy="34" r="4" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />

      {/* Head */}
      <path
        d="M17 32C17 43 23 51 32 51C41 51 47 43 47 32C47 22 41 18 32 18C23 18 17 22 17 32Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Tousled Doodle Hair on Top */}
      <path
        d="M15 29C15 20 20 12 30 11C36 10 44 12 48 20C50 25 48 30 46 29C44 23 40 18 33 18C26 18 20 22 18 30Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Hair spikes / tufts */}
      <path d="M26 11C28 7 33 8 35 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 11C37 6 42 8 44 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* Eyebrows */}
      <path d="M23 27C25 25 28 26 29 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 27C36 26 39 25 41 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Eyes with sparkle glint */}
      <circle cx="26" cy="33" r="2.8" fill="currentColor" />
      <circle cx="27" cy="32" r="0.9" fill="#ffffff" />
      <circle cx="38" cy="33" r="2.8" fill="currentColor" />
      <circle cx="39" cy="32" r="0.9" fill="#ffffff" />

      {/* Nose */}
      <path d="M31 36L32 38L33 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Smile */}
      <path
        d="M27 42C29 45 35 45 37 42"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FlowerIcon({ className = 'h-full w-full' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Flower icon"
    >
      {/* 8 Rounded Petals Radiating Around Center */}
      <circle cx="32" cy="13" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="45.5" cy="18.5" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="51" cy="32" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="45.5" cy="45.5" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="51" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="18.5" cy="45.5" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="13" cy="32" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="18.5" cy="18.5" r="7" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />

      {/* Big Friendly Center Flower Face */}
      <circle cx="32" cy="32" r="14" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />

      {/* Happy Eyes */}
      <circle cx="27" cy="30" r="2.2" fill="currentColor" />
      <circle cx="27.6" cy="29.3" r="0.7" fill="#ffffff" />
      <circle cx="37" cy="30" r="2.2" fill="currentColor" />
      <circle cx="37.6" cy="29.3" r="0.7" fill="#ffffff" />

      {/* Cheerful Open Smile */}
      <path
        d="M27 34C28 38 36 38 37 34"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Little Cheek Blushes */}
      <circle cx="23.5" cy="33.5" r="1.3" fill="currentColor" opacity="0.3" />
      <circle cx="40.5" cy="33.5" r="1.3" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function BooksIcon({ className = 'h-full w-full' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Books icon"
    >
      {/* Bottom Book */}
      <rect x="12" y="44" width="40" height="9" rx="1.5" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <line x1="18" y1="44" x2="18" y2="53" stroke="currentColor" strokeWidth="2" />
      <line x1="24" y1="48.5" x2="46" y2="48.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Middle Book */}
      <rect x="15" y="32" width="36" height="9" rx="1.5" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <line x1="21" y1="32" x2="21" y2="41" stroke="currentColor" strokeWidth="2" />
      <line x1="27" y1="36.5" x2="45" y2="36.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Top Book with Dogeared Bookmark */}
      <rect x="17" y="20" width="31" height="9" rx="1.5" fill="#ffffff" stroke="currentColor" strokeWidth="2.5" />
      <line x1="23" y1="20" x2="23" y2="29" stroke="currentColor" strokeWidth="2" />

      {/* Hanging Bookmark Ribbon */}
      <path
        d="M37 20V36L40.5 33L44 36V20"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Cute Reading Glasses Perched on Top */}
      <circle cx="28" cy="14" r="4.5" fill="#ffffff" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="39" cy="14" r="4.5" fill="#ffffff" stroke="currentColor" strokeWidth="2.2" />
      <path d="M32.5 14H34.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M23.5 13L20 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M43.5 13L47 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function CoffeeIcon({ className = 'h-full w-full' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Coffee cup icon"
    >
      {/* Saucer / Plate */}
      <path
        d="M13 52C13 50.5 21 49 32 49C43 49 51 50.5 51 52C51 53.5 43 55 32 55C21 55 13 53.5 13 52Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Cup Handle */}
      <path
        d="M44 26C52 26 53 41 43 41"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Mug Body */}
      <path
        d="M18 22H46L43 43C42.5 47 38 49 32 49C26 49 21.5 47 21 43L18 22Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Cute face on the mug */}
      <circle cx="28" cy="32" r="1.8" fill="currentColor" />
      <circle cx="36" cy="32" r="1.8" fill="currentColor" />
      <path d="M30 36C31 38 33 38 34 36" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* Swirling Warm Steam */}
      <path
        d="M26 16C24 13 28 10 26 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M33 17C31 14 35 11 33 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M40 16C38 13 42 10 40 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CatIcon({ className = 'h-full w-full' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cat icon"
    >
      {/* Ears */}
      <path
        d="M17 26L13 11L27 18"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M47 26L51 11L37 18"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Inner Ear Tuft */}
      <path d="M17 19L16 15L22 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M47 19L48 15L42 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* Head */}
      <path
        d="M15 32C15 44 22 52 32 52C42 52 49 44 49 32C49 22 43 18 32 18C21 18 15 22 15 32Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Eyes with sparkle glint */}
      <circle cx="25" cy="33" r="2.8" fill="currentColor" />
      <circle cx="26" cy="32" r="0.9" fill="#ffffff" />
      <circle cx="39" cy="33" r="2.8" fill="currentColor" />
      <circle cx="40" cy="32" r="0.9" fill="#ffffff" />

      {/* Little nose */}
      <polygon points="32,38 30.5,36 33.5,36" fill="currentColor" />

      {/* Cat Mouth (w-shape) */}
      <path
        d="M28 41C29.5 43 32 42.5 32 40C32 42.5 34.5 43 36 41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Whiskers */}
      <line x1="10" y1="36" x2="20" y2="38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9" y1="42" x2="20" y2="41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="54" y1="36" x2="44" y2="38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="55" y1="42" x2="44" y2="41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Universal Avatar Component: Renders the appropriate line-art icon by id
 */
export function AvatarIcon({ id = 'dog', className = 'h-full w-full' }) {
  switch (id) {
    case 'girl':
      return <GirlIcon className={className} />
    case 'boy':
      return <BoyIcon className={className} />
    case 'flower':
      return <FlowerIcon className={className} />
    case 'books':
      return <BooksIcon className={className} />
    case 'coffee':
      return <CoffeeIcon className={className} />
    case 'cat':
      return <CatIcon className={className} />
    case 'dog':
    default:
      return <DogIcon className={className} />
  }
}

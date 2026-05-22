import type { Difficulty } from "../types";

export default function DifficultyAvatar({ id }: { id: Difficulty }) {
  const p = {
    width: 44, height: 44, viewBox: "0 0 44 44",
    fill: "none", stroke: "currentColor", strokeWidth: 1.3,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "apprentice":
      return (
        <svg {...p}>
          <circle cx="22" cy="16" r="6.5" />
          <path d="M9 41 C 9 32, 15 27, 22 27 C 29 27, 35 32, 35 41" />
        </svg>
      );
    case "journeyman":
      return (
        <svg {...p}>
          <circle cx="22" cy="18" r="6.5" />
          <path d="M9 41 C 9 32, 15 28, 22 28 C 29 28, 35 32, 35 41" />
          <path d="M13 14 L 31 14 L 28 10 Q 22 8 16 10 Z" strokeWidth="1.2" />
        </svg>
      );
    case "adept":
      return (
        <svg {...p}>
          <circle cx="22" cy="16" r="6.5" />
          <path d="M9 41 C 9 32, 15 27, 22 27 C 29 27, 35 32, 35 41" />
          <circle cx="25" cy="16" r="2.2" strokeWidth="1.1" />
          <path d="M27 18 Q 30 21 30 25" strokeWidth="0.9" />
          <path d="M15 33 L 22 38 L 29 33" strokeWidth="1" />
        </svg>
      );
    case "sovereign":
      return (
        <svg {...p}>
          <path d="M12 11 L 15 5 L 19 11 L 22 4 L 25 11 L 29 5 L 32 11 L 32 14 L 12 14 Z" />
          <circle cx="15" cy="5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="22" cy="4" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="29" cy="5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="22" cy="22" r="6" />
          <path d="M9 42 C 9 34, 15 30, 22 30 C 29 30, 35 34, 35 42" />
        </svg>
      );
    default:
      return null;
  }
}

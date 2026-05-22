import type { Mode } from "../types";

export default function ModeIcon({ id }: { id: Mode }) {
  const p = {
    width: 32, height: 32, viewBox: "0 0 32 32",
    fill: "none", stroke: "currentColor", strokeWidth: 1.4,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "historical":
      return (
        <svg {...p}>
          <line x1="6" y1="4" x2="26" y2="4" strokeWidth="2.4" />
          <line x1="7.5" y1="7" x2="24.5" y2="7" />
          <line x1="10" y1="9" x2="10" y2="25" />
          <line x1="14" y1="9" x2="14" y2="25" />
          <line x1="18" y1="9" x2="18" y2="25" />
          <line x1="22" y1="9" x2="22" y2="25" />
          <line x1="7.5" y1="25" x2="24.5" y2="25" />
          <line x1="5" y1="28" x2="27" y2="28" strokeWidth="2.4" />
        </svg>
      );
    case "fiction":
      return (
        <svg {...p}>
          <path d="M4 8 C 8 7, 12 7, 16 9 L 16 25 C 12 23, 8 23, 4 24 Z" />
          <path d="M28 8 C 24 7, 20 7, 16 9 L 16 25 C 20 23, 24 23, 28 24 Z" />
          <line x1="7" y1="12" x2="13" y2="13" />
          <line x1="7" y1="16" x2="13" y2="17" />
          <line x1="19" y1="13" x2="25" y2="12" />
          <line x1="19" y1="17" x2="25" y2="16" />
        </svg>
      );
    case "live":
      return (
        <svg {...p}>
          <polyline points="3,17 8,17 11,9 15,24 18,12 21,17 27,17" strokeWidth="1.7" />
          <circle cx="27" cy="17" r="2.4" fill="currentColor" stroke="none" />
          <circle cx="27" cy="17" r="5" strokeWidth="0.8" opacity="0.4" />
        </svg>
      );
    default:
      return null;
  }
}

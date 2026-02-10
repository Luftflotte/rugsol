export const GRADES = {
  A: { min: 80, color: "#22c55e", label: "Safe" },
  B: { min: 60, color: "#84cc16", label: "Caution" },
  C: { min: 40, color: "#eab308", label: "Risky" },
  D: { min: 20, color: "#f97316", label: "High Risk" },
  F: { min: 0, color: "#ef4444", label: "Likely Scam" },
} as const;

export type Grade = keyof typeof GRADES;

export const PUMP_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";

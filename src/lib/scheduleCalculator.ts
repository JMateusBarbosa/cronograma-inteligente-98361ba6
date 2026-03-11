import { addDays, getDay, startOfDay, format } from "date-fns";

// ── Types ──────────────────────────────────────────────────────────
export interface ModuleInput {
  name: string;
  hours: number;
}

export interface ScheduleResult {
  module: string;
  hours: number;
  startDate: Date;
  endDate: Date;
  classDaysUsed: number;
  holidaysImpacted: Date[];
}

export type ProfileKey =
  | "seg_qua"
  | "ter_qui"
  | "sabado"
  | "sexta"
  | "seg_a_qui";

// ── Profile mapping from display string ────────────────────────────
const PROFILE_MAP: Record<string, ProfileKey> = {
  "Segunda e Quarta (1h por dia)": "seg_qua",
  "Terça e Quinta (1h por dia)": "ter_qui",
  "Sábado (2h)": "sabado",
  "Sexta-feira (2h)": "sexta",
  "Segunda a Quinta (1h por dia)": "seg_a_qui",
};

export function profileKeyFromLabel(label: string): ProfileKey {
  return PROFILE_MAP[label] ?? "seg_qua";
}

// ── Brazilian holidays (cached) ────────────────────────────────────
const holidayCache = new Map<number, Set<string>>();

function easterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function dateKey(d: Date): string {
  return format(startOfDay(d), "yyyy-MM-dd");
}

function getHolidaySetForYear(year: number): Set<string> {
  if (holidayCache.has(year)) return holidayCache.get(year)!;

  const easter = easterDate(year);
  const dates: Date[] = [
    new Date(year, 0, 1),   // Ano Novo
    new Date(year, 3, 21),  // Tiradentes
    new Date(year, 4, 1),   // Dia do Trabalho
    new Date(year, 8, 7),   // Independência
    new Date(year, 9, 12),  // Nossa Sra. Aparecida
    new Date(year, 10, 2),  // Finados
    new Date(year, 10, 15), // Proclamação da República
    new Date(year, 11, 25), // Natal
    addDays(easter, -47),   // Carnaval (segunda)
    addDays(easter, -46),   // Carnaval (terça)
    addDays(easter, -2),    // Sexta-feira Santa
    addDays(easter, 60),    // Corpus Christi
  ];

  const set = new Set(dates.map(dateKey));
  holidayCache.set(year, set);
  return set;
}

function buildHolidaySet(startYear: number, endYear: number): Set<string> {
  const merged = new Set<string>();
  for (let y = startYear; y <= endYear; y++) {
    for (const key of getHolidaySetForYear(y)) {
      merged.add(key);
    }
  }
  return merged;
}

// ── Helper functions (O(1) lookup) ─────────────────────────────────
function isHoliday(date: Date, holidays: Set<string>): boolean {
  return holidays.has(dateKey(date));
}

function isClassDay(date: Date, profile: ProfileKey): boolean {
  const day = getDay(date);
  switch (profile) {
    case "seg_qua":   return day === 1 || day === 3;
    case "ter_qui":   return day === 2 || day === 4;
    case "seg_a_qui": return day >= 1 && day <= 4;
    case "sexta":     return day === 5;
    case "sabado":    return day === 6;
    default:          return false;
  }
}

function hoursPerDay(profile: ProfileKey): number {
  return profile === "sabado" || profile === "sexta" ? 2 : 1;
}

// ── Core engine ────────────────────────────────────────────────────
function findFirstClassDay(start: Date, profile: ProfileKey, holidays: Set<string>): Date {
  let current = startOfDay(start);
  for (let i = 0; i < 365; i++) {
    if (!isHoliday(current, holidays) && isClassDay(current, profile)) return current;
    current = addDays(current, 1);
  }
  return current;
}

function calculateModuleEnd(
  start: Date,
  totalHours: number,
  profile: ProfileKey,
  holidays: Set<string>
): { endDate: Date; classDaysUsed: number; holidaysImpacted: Date[] } {
  let current = startOfDay(start);
  let accumulated = 0;
  let classDaysUsed = 0;
  const holidaysImpacted: Date[] = [];

  for (let i = 0; i < 3650; i++) {
    if (isHoliday(current, holidays)) {
      if (isClassDay(current, profile)) holidaysImpacted.push(new Date(current));
      current = addDays(current, 1);
      continue;
    }
    if (isClassDay(current, profile)) {
      accumulated += hoursPerDay(profile);
      classDaysUsed++;
      if (accumulated >= totalHours) return { endDate: current, classDaysUsed, holidaysImpacted };
    }
    current = addDays(current, 1);
  }
  return { endDate: current, classDaysUsed, holidaysImpacted };
}

function nextClassDay(afterDate: Date, profile: ProfileKey, holidays: Set<string>): Date {
  let current = addDays(afterDate, 1);
  for (let i = 0; i < 365; i++) {
    if (!isHoliday(current, holidays) && isClassDay(current, profile)) return current;
    current = addDays(current, 1);
  }
  return current;
}

// ── Main function ──────────────────────────────────────────────────
export function calcularCronograma(
  dataInicio: Date,
  profileLabel: string,
  modules: ModuleInput[]
): ScheduleResult[] {
  const profile = profileKeyFromLabel(profileLabel);
  const startYear = dataInicio.getFullYear();
  const holidays = buildHolidaySet(startYear, startYear + 3);

  let currentDate = findFirstClassDay(dataInicio, profile, holidays);
  const results: ScheduleResult[] = [];

  for (const mod of modules) {
    if (mod.hours <= 0 || !mod.name.trim()) continue;

    const { endDate, classDaysUsed, holidaysImpacted } = calculateModuleEnd(
      currentDate, mod.hours, profile, holidays
    );

    results.push({
      module: mod.name,
      hours: mod.hours,
      startDate: currentDate,
      endDate,
      classDaysUsed,
      holidaysImpacted,
    });

    currentDate = nextClassDay(endDate, profile, holidays);
  }

  return results;
}

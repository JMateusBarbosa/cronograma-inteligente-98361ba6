import { addDays, getDay, startOfDay, format, parseISO } from "date-fns";

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

export interface ProfileConfig {
  label: string;
  daysOfWeek: number[];
  hoursPerDay: number;
}

export interface HolidayConfig {
  date: string;
  isRecurring?: boolean | null;
  month?: number | null;
  day?: number | null;
}

// ── Profile mapping from display string ────────────────────────────
const PROFILE_MAP: Record<string, ProfileKey> = {
  "Segunda e Quarta (1h por dia)": "seg_qua",
  "Terça e Quinta (1h por dia)": "ter_qui",
  "Sábado (2h)": "sabado",
  "Sexta-feira (2h)": "sexta",
  "Segunda a Quinta (1h por dia)": "seg_a_qui",
};

const DEFAULT_PROFILES: Record<ProfileKey, ProfileConfig> = {
  seg_qua: {
    label: "Segunda e Quarta (1h por dia)",
    daysOfWeek: [1, 3],
    hoursPerDay: 1,
  },
  ter_qui: {
    label: "Terça e Quinta (1h por dia)",
    daysOfWeek: [2, 4],
    hoursPerDay: 1,
  },
  sabado: {
    label: "Sábado (2h)",
    daysOfWeek: [6],
    hoursPerDay: 2,
  },
  sexta: {
    label: "Sexta-feira (2h)",
    daysOfWeek: [5],
    hoursPerDay: 2,
  },
  seg_a_qui: {
    label: "Segunda a Quinta (1h por dia)",
    daysOfWeek: [1, 2, 3, 4],
    hoursPerDay: 1,
  },
};

export function profileKeyFromLabel(label: string): ProfileKey {
  return PROFILE_MAP[label] ?? "seg_qua";
}

function profileFromLabel(label: string): ProfileConfig {
  return DEFAULT_PROFILES[profileKeyFromLabel(label)];
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
    new Date(year, 0, 1),
    new Date(year, 3, 21),
    new Date(year, 4, 1),
    new Date(year, 8, 7),
    new Date(year, 9, 12),
    new Date(year, 10, 2),
    new Date(year, 10, 15),
    new Date(year, 11, 25),
    addDays(easter, -47),
    addDays(easter, -46),
    addDays(easter, -2),
    addDays(easter, 60),
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

function mergeCustomHolidays(
  holidays: Set<string>,
  customHolidays: HolidayConfig[] | undefined,
  startYear: number,
  endYear: number
): Set<string> {
  if (!customHolidays || customHolidays.length === 0) return holidays;

  const merged = new Set(holidays);

  customHolidays.forEach((holiday) => {
    if (holiday.isRecurring && holiday.month && holiday.day) {
      for (let year = startYear; year <= endYear; year++) {
        merged.add(
          dateKey(new Date(year, holiday.month - 1, holiday.day))
        );
      }
      return;
    }

    if (holiday.date) {
      merged.add(dateKey(parseISO(holiday.date)));
    }
  });

  return merged;
}

function isHoliday(date: Date, holidays: Set<string>): boolean {
  return holidays.has(dateKey(date));
}

function isClassDay(date: Date, daysOfWeek: number[]): boolean {
  return daysOfWeek.includes(getDay(date));
}

function findFirstClassDay(start: Date, profile: ProfileConfig, holidays: Set<string>): Date {
  let current = startOfDay(start);
  for (let i = 0; i < 365; i++) {
    if (!isHoliday(current, holidays) && isClassDay(current, profile.daysOfWeek)) return current;
    current = addDays(current, 1);
  }
  return current;
}

function calculateModuleEnd(
  start: Date,
  totalHours: number,
  profile: ProfileConfig,
  holidays: Set<string>
): { endDate: Date; classDaysUsed: number; holidaysImpacted: Date[] } {
  let current = startOfDay(start);
  let accumulated = 0;
  let classDaysUsed = 0;
  const holidaysImpacted: Date[] = [];

  for (let i = 0; i < 3650; i++) {
    if (isHoliday(current, holidays)) {
      if (isClassDay(current, profile.daysOfWeek)) holidaysImpacted.push(new Date(current));
      current = addDays(current, 1);
      continue;
    }

    if (isClassDay(current, profile.daysOfWeek)) {
      accumulated += profile.hoursPerDay;
      classDaysUsed++;
      if (accumulated >= totalHours) return { endDate: current, classDaysUsed, holidaysImpacted };
    }
    current = addDays(current, 1);
  }

  return { endDate: current, classDaysUsed, holidaysImpacted };
}

function nextClassDay(afterDate: Date, profile: ProfileConfig, holidays: Set<string>): Date {
  let current = addDays(afterDate, 1);
  for (let i = 0; i < 365; i++) {
    if (!isHoliday(current, holidays) && isClassDay(current, profile.daysOfWeek)) return current;
    current = addDays(current, 1);
  }
  return current;
}

export function calcularCronograma(
  dataInicio: Date,
  profileLabel: string,
  modules: ModuleInput[],
  customHolidays?: HolidayConfig[],
  customProfile?: Omit<ProfileConfig, "label">
): ScheduleResult[] {
  const profile = customProfile
    ? { ...customProfile, label: profileLabel }
    : profileFromLabel(profileLabel);

  const startYear = dataInicio.getFullYear();
  const endYear = startYear + 3;

  const brazilianHolidays = buildHolidaySet(startYear, endYear);
  const holidays = mergeCustomHolidays(
    brazilianHolidays,
    customHolidays,
    startYear,
    endYear
  );

  let currentDate = findFirstClassDay(dataInicio, profile, holidays);
  const results: ScheduleResult[] = [];

  for (const mod of modules) {
    if (mod.hours <= 0 || !mod.name.trim()) continue;

    const { endDate, classDaysUsed, holidaysImpacted } = calculateModuleEnd(
      currentDate,
      mod.hours,
      profile,
      holidays
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

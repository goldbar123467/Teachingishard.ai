import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateSchoolYear,
  getSchoolYearProgress,
  getSemester,
  getQuarter,
  formatSchoolDate,
  SCHOOL_YEAR_CONFIG,
  MONTH_NAMES,
  MONTH_ABBREV,
  type SchoolYear,
} from './calendar';

// Generate a single school year once for most tests to reduce memory usage
let testSchoolYear: SchoolYear;

beforeAll(() => {
  testSchoolYear = generateSchoolYear(2024, 42);
});

describe('calendar.ts', () => {
  describe('generateSchoolYear', () => {
    it('generates exactly 180 school days', () => {
      const schoolDays = testSchoolYear.days.filter(d => d.isSchoolDay);
      expect(schoolDays).toHaveLength(180);
    });

    it('starts on August 15th', () => {
      expect(testSchoolYear.startDate.getMonth()).toBe(7); // August (0-indexed)
      expect(testSchoolYear.startDate.getDate()).toBe(15);
      expect(testSchoolYear.startDate.getFullYear()).toBe(2024);
    });

    it('initializes currentDay to 1', () => {
      expect(testSchoolYear.currentDay).toBe(1);
    });

    it('sets totalSchoolDays to 180', () => {
      expect(testSchoolYear.totalSchoolDays).toBe(180);
    });

    it('generates consistent results with same seed', () => {
      const year1 = generateSchoolYear(2024, 123);
      const year2 = generateSchoolYear(2024, 123);

      expect(year1.snowDaysUsed).toBe(year2.snowDaysUsed);
      expect(year1.blizzardOccurred).toBe(year2.blizzardOccurred);
    });
  });

  describe('breaks', () => {
    it('includes three breaks', () => {
      expect(testSchoolYear.breaks).toHaveLength(3);

      const breakNames = testSchoolYear.breaks.map(b => b.name);
      expect(breakNames).toContain('Fall Break');
      expect(breakNames).toContain('Winter Break');
      expect(breakNames).toContain('Spring Break');
    });

    it('Fall Break is in October', () => {
      const fallBreak = testSchoolYear.breaks.find(b => b.name === 'Fall Break');
      expect(fallBreak).toBeDefined();
      expect(fallBreak!.startDate.getMonth()).toBe(9); // October
      expect(fallBreak!.duration).toBe(5);
    });

    it('Winter Break starts December 20', () => {
      const winterBreak = testSchoolYear.breaks.find(b => b.name === 'Winter Break');
      expect(winterBreak).toBeDefined();
      expect(winterBreak!.startDate.getMonth()).toBe(11); // December
      expect(winterBreak!.startDate.getDate()).toBe(20);
      expect(winterBreak!.duration).toBe(14);
    });

    it('Spring Break is in March of following year', () => {
      const springBreak = testSchoolYear.breaks.find(b => b.name === 'Spring Break');
      expect(springBreak).toBeDefined();
      expect(springBreak!.startDate.getMonth()).toBe(2); // March
      expect(springBreak!.startDate.getFullYear()).toBe(2025);
    });

    it('break days are not school days', () => {
      const breakDays = testSchoolYear.days.filter(d => d.isBreak);
      expect(breakDays.length).toBeGreaterThan(0);
      breakDays.forEach(day => {
        expect(day.isSchoolDay).toBe(false);
      });
    });
  });

  describe('weekends', () => {
    it('correctly marks weekends', () => {
      const weekendDays = testSchoolYear.days.filter(d => d.isWeekend);
      expect(weekendDays.length).toBeGreaterThan(0);

      weekendDays.forEach(day => {
        const dayOfWeek = day.date.getDay();
        expect(dayOfWeek === 0 || dayOfWeek === 6).toBe(true);
        expect(day.isSchoolDay).toBe(false);
      });
    });
  });

  describe('day numbering', () => {
    it('numbers school days sequentially from 1 to 180', () => {
      const schoolDays = testSchoolYear.days
        .filter(d => d.isSchoolDay)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      schoolDays.forEach((day, index) => {
        expect(day.dayNumber).toBe(index + 1);
      });
    });

    it('non-school days have dayNumber 0', () => {
      const nonSchoolDays = testSchoolYear.days.filter(d => !d.isSchoolDay);
      nonSchoolDays.forEach(day => {
        expect(day.dayNumber).toBe(0);
      });
    });
  });

  describe('weather events', () => {
    it('snow days are not school days', () => {
      const snowDays = testSchoolYear.days.filter(d => d.isSnowDay);
      snowDays.forEach(day => {
        expect(day.isSchoolDay).toBe(false);
      });
    });

    it('blizzard days are also snow days', () => {
      const blizzardDays = testSchoolYear.days.filter(d => d.isBlizzard);
      blizzardDays.forEach(day => {
        expect(day.isSnowDay).toBe(true);
      });
    });

    it('blizzardOccurred flag matches presence of blizzard days', () => {
      const hasBlizzardDays = testSchoolYear.days.some(d => d.isBlizzard);
      expect(testSchoolYear.blizzardOccurred).toBe(hasBlizzardDays);
    });

    it('snowDaysUsed is non-negative', () => {
      expect(testSchoolYear.snowDaysUsed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSchoolYearProgress', () => {
    it('returns correct percentage at start', () => {
      const year = { ...testSchoolYear, currentDay: 1 };
      const progress = getSchoolYearProgress(year);
      expect(progress.percentComplete).toBe(1);
      expect(progress.daysRemaining).toBe(179);
    });

    it('returns correct percentage at midpoint', () => {
      const year = { ...testSchoolYear, currentDay: 90 };
      const progress = getSchoolYearProgress(year);
      expect(progress.percentComplete).toBe(50);
      expect(progress.daysRemaining).toBe(90);
    });

    it('returns correct percentage at end', () => {
      const year = { ...testSchoolYear, currentDay: 180 };
      const progress = getSchoolYearProgress(year);
      expect(progress.percentComplete).toBe(100);
      expect(progress.daysRemaining).toBe(0);
    });

    it('finds the next break', () => {
      const year = { ...testSchoolYear, currentDay: 1 };
      const progress = getSchoolYearProgress(year);
      expect(progress.nextBreak).not.toBeNull();
      expect(progress.nextBreak?.name).toBe('Fall Break');
    });
  });

  describe('getSemester', () => {
    it('returns 1 for days 1-90', () => {
      expect(getSemester(1)).toBe(1);
      expect(getSemester(45)).toBe(1);
      expect(getSemester(90)).toBe(1);
    });

    it('returns 2 for days 91-180', () => {
      expect(getSemester(91)).toBe(2);
      expect(getSemester(180)).toBe(2);
    });
  });

  describe('getQuarter', () => {
    it('returns correct quarters', () => {
      expect(getQuarter(1)).toBe(1);
      expect(getQuarter(45)).toBe(1);
      expect(getQuarter(46)).toBe(2);
      expect(getQuarter(90)).toBe(2);
      expect(getQuarter(91)).toBe(3);
      expect(getQuarter(135)).toBe(3);
      expect(getQuarter(136)).toBe(4);
      expect(getQuarter(180)).toBe(4);
    });
  });

  describe('formatSchoolDate', () => {
    it('formats dates correctly', () => {
      const date = new Date(2024, 7, 15);
      expect(formatSchoolDate(date)).toBe('Aug 15');
    });
  });

  describe('config validation', () => {
    it('has valid config constants', () => {
      expect(SCHOOL_YEAR_CONFIG.totalSchoolDays).toBe(180);
      expect(SCHOOL_YEAR_CONFIG.startMonth).toBe(7);
      expect(SCHOOL_YEAR_CONFIG.startDay).toBe(15);
      expect(SCHOOL_YEAR_CONFIG.snowDayChance).toBe(0.02);
      expect(SCHOOL_YEAR_CONFIG.blizzardChance).toBe(0.05);
      expect(SCHOOL_YEAR_CONFIG.maxSnowDays).toBe(3);
      expect(SCHOOL_YEAR_CONFIG.blizzardDuration).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('school year spans two calendar years', () => {
      expect(testSchoolYear.startDate.getFullYear()).toBe(2024);
      expect(testSchoolYear.endDate.getFullYear()).toBe(2025);
    });

    it('all days have valid month values', () => {
      testSchoolYear.days.forEach(day => {
        expect(day.month).toBeGreaterThanOrEqual(0);
        expect(day.month).toBeLessThanOrEqual(11);
      });
    });

    it('all days have valid weekOfYear values', () => {
      testSchoolYear.days.forEach(day => {
        expect(day.weekOfYear).toBeGreaterThanOrEqual(1);
        expect(day.weekOfYear).toBeLessThanOrEqual(53);
      });
    });
  });
});

import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import { formatDateRange, getReadableDateAndTime } from "../utils/display";

describe("formatDateRange", () => {
  const currentYear = 2024;
  const currentDate = DateTime.fromObject({ year: currentYear, month: 6, day: 15 }); // June 15, 2024

  describe("same dates", () => {
    describe("with short months (default)", () => {
      it("should format single date without year when in current year", () => {
        const date = DateTime.fromObject({ year: currentYear, month: 10, day: 15 });
        const result = formatDateRange({ start: date, end: date }, currentDate);
        expect(result).toBe("Oct 15");
      });

      it("should format single date with year when not in current year", () => {
        const date = DateTime.fromObject({ year: 2023, month: 10, day: 15 });
        const result = formatDateRange({ start: date, end: date }, currentDate);
        expect(result).toBe("Oct 15, 2023");
      });

      it("should format single date with year when in future year", () => {
        const date = DateTime.fromObject({ year: 2025, month: 10, day: 15 });
        const result = formatDateRange({ start: date, end: date }, currentDate);
        expect(result).toBe("Oct 15, 2025");
      });
    });

    describe("with long months", () => {
      it("should format single date without year when in current year", () => {
        const date = DateTime.fromObject({ year: currentYear, month: 10, day: 15 });
        const result = formatDateRange({ start: date, end: date }, currentDate, {
          shortMonths: false,
        });
        expect(result).toBe("October 15");
      });

      it("should format single date with year when not in current year", () => {
        const date = DateTime.fromObject({ year: 2023, month: 10, day: 15 });
        const result = formatDateRange({ start: date, end: date }, currentDate, {
          shortMonths: false,
        });
        expect(result).toBe("October 15, 2023");
      });

      it("should format single date with year when in future year", () => {
        const date = DateTime.fromObject({ year: 2025, month: 10, day: 15 });
        const result = formatDateRange({ start: date, end: date }, currentDate, {
          shortMonths: false,
        });
        expect(result).toBe("October 15, 2025");
      });
    });
  });

  describe("same month and year", () => {
    describe("with short months (default)", () => {
      it("should format range without year when in current year", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: currentYear, month: 10, day: 17 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 15-17");
      });

      it("should format range with year when not in current year", () => {
        const start = DateTime.fromObject({ year: 2023, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: 2023, month: 10, day: 17 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 15-17, 2023");
      });

      it("should format range with year when in future year", () => {
        const start = DateTime.fromObject({ year: 2025, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: 2025, month: 10, day: 17 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 15-17, 2025");
      });

      it("should handle single digit days", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 1 });
        const end = DateTime.fromObject({ year: currentYear, month: 10, day: 3 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 1-3");
      });

      it("should handle double digit days", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: currentYear, month: 10, day: 31 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 15-31");
      });
    });

    describe("with long months", () => {
      it("should format range without year when in current year", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: currentYear, month: 10, day: 17 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 15-17");
      });

      it("should format range with year when not in current year", () => {
        const start = DateTime.fromObject({ year: 2023, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: 2023, month: 10, day: 17 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 15-17, 2023");
      });

      it("should format range with year when in future year", () => {
        const start = DateTime.fromObject({ year: 2025, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: 2025, month: 10, day: 17 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 15-17, 2025");
      });

      it("should handle single digit days", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 1 });
        const end = DateTime.fromObject({ year: currentYear, month: 10, day: 3 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 1-3");
      });

      it("should handle double digit days", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: currentYear, month: 10, day: 31 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 15-31");
      });
    });
  });

  describe("different months, same year", () => {
    describe("with short months (default)", () => {
      it("should format range without year when in current year", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 31 });
        const end = DateTime.fromObject({ year: currentYear, month: 11, day: 3 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 31 - Nov 3");
      });

      it("should format range with year when not in current year", () => {
        const start = DateTime.fromObject({ year: 2023, month: 10, day: 31 });
        const end = DateTime.fromObject({ year: 2023, month: 11, day: 3 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 31 - Nov 3, 2023");
      });

      it("should format range with year when in future year", () => {
        const start = DateTime.fromObject({ year: 2025, month: 10, day: 31 });
        const end = DateTime.fromObject({ year: 2025, month: 11, day: 3 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 31 - Nov 3, 2025");
      });

      it("should handle month transitions", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 12, day: 31 });
        const end = DateTime.fromObject({ year: currentYear, month: 1, day: 2 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Dec 31 - Jan 2");
      });
    });

    describe("with long months", () => {
      it("should format range without year when in current year", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 31 });
        const end = DateTime.fromObject({ year: currentYear, month: 11, day: 3 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 31 - November 3");
      });

      it("should format range with year when not in current year", () => {
        const start = DateTime.fromObject({ year: 2023, month: 10, day: 31 });
        const end = DateTime.fromObject({ year: 2023, month: 11, day: 3 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 31 - November 3, 2023");
      });

      it("should format range with year when in future year", () => {
        const start = DateTime.fromObject({ year: 2025, month: 10, day: 31 });
        const end = DateTime.fromObject({ year: 2025, month: 11, day: 3 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 31 - November 3, 2025");
      });

      it("should handle month transitions", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 12, day: 31 });
        const end = DateTime.fromObject({ year: currentYear, month: 1, day: 2 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("December 31 - January 2");
      });
    });
  });

  describe("different years", () => {
    describe("with short months (default)", () => {
      it("should always show full dates with years", () => {
        const start = DateTime.fromObject({ year: 2024, month: 12, day: 31 });
        const end = DateTime.fromObject({ year: 2025, month: 1, day: 2 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Dec 31, 2024 - Jan 2, 2025");
      });

      it("should handle multi-year ranges", () => {
        const start = DateTime.fromObject({ year: 2023, month: 12, day: 31 });
        const end = DateTime.fromObject({ year: 2025, month: 1, day: 2 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Dec 31, 2023 - Jan 2, 2025");
      });

      it("should handle past to future year transitions", () => {
        const start = DateTime.fromObject({ year: 2023, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: 2025, month: 3, day: 20 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 15, 2023 - Mar 20, 2025");
      });
    });

    describe("with long months", () => {
      it("should always show full dates with years", () => {
        const start = DateTime.fromObject({ year: 2024, month: 12, day: 31 });
        const end = DateTime.fromObject({ year: 2025, month: 1, day: 2 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("December 31, 2024 - January 2, 2025");
      });

      it("should handle multi-year ranges", () => {
        const start = DateTime.fromObject({ year: 2023, month: 12, day: 31 });
        const end = DateTime.fromObject({ year: 2025, month: 1, day: 2 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("December 31, 2023 - January 2, 2025");
      });

      it("should handle past to future year transitions", () => {
        const start = DateTime.fromObject({ year: 2023, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: 2025, month: 3, day: 20 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 15, 2023 - March 20, 2025");
      });
    });
  });

  describe("edge cases", () => {
    describe("with short months (default)", () => {
      it("should handle leap year dates", () => {
        const start = DateTime.fromObject({ year: 2024, month: 2, day: 28 });
        const end = DateTime.fromObject({ year: 2024, month: 2, day: 29 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Feb 28-29");
      });

      it("should handle end of month transitions", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 1, day: 31 });
        const end = DateTime.fromObject({ year: currentYear, month: 2, day: 1 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Jan 31 - Feb 1");
      });

      it("should handle very short ranges", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: currentYear, month: 10, day: 16 });
        const result = formatDateRange({ start, end }, currentDate);
        expect(result).toBe("Oct 15-16");
      });
    });

    describe("with long months", () => {
      it("should handle leap year dates", () => {
        const start = DateTime.fromObject({ year: 2024, month: 2, day: 28 });
        const end = DateTime.fromObject({ year: 2024, month: 2, day: 29 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("February 28-29");
      });

      it("should handle end of month transitions", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 1, day: 31 });
        const end = DateTime.fromObject({ year: currentYear, month: 2, day: 1 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("January 31 - February 1");
      });

      it("should handle very short ranges", () => {
        const start = DateTime.fromObject({ year: currentYear, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: currentYear, month: 10, day: 16 });
        const result = formatDateRange({ start, end }, currentDate, { shortMonths: false });
        expect(result).toBe("October 15-16");
      });
    });
  });

  describe("default current date", () => {
    describe("with short months (default)", () => {
      it("should use current date when no reference date provided", () => {
        const start = DateTime.fromObject({ year: 2023, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: 2023, month: 10, day: 17 });
        const result = formatDateRange({ start, end });
        // This test will depend on when it's run, so we'll just verify it returns a string
        expect(typeof result).toBe("string");
        expect(result).toContain("Oct 15-17, 2023");
      });
    });

    describe("with long months", () => {
      it("should use current date when no reference date provided", () => {
        const start = DateTime.fromObject({ year: 2023, month: 10, day: 15 });
        const end = DateTime.fromObject({ year: 2023, month: 10, day: 17 });
        const result = formatDateRange({ start, end }, undefined, { shortMonths: false });
        // This test will depend on when it's run, so we'll just verify it returns a string
        expect(typeof result).toBe("string");
        expect(result).toContain("October 15-17, 2023");
      });
    });
  });
});

describe("getReadableDateAndTime", () => {
  const currentDate = DateTime.fromObject({ year: 2024, month: 6, day: 15, hour: 12, minute: 0 }); // June 15, 2024 at 12:00 PM

  describe("same day", () => {
    it("should return null date and time when date is today", () => {
      const today = DateTime.fromObject({ year: 2024, month: 6, day: 15, hour: 14, minute: 30 });
      const result = getReadableDateAndTime(today, currentDate);
      expect(result).toEqual({ date: null, time: "2:30 PM" });
    });

    it("should return null date and time when date is today at different time", () => {
      const today = DateTime.fromObject({ year: 2024, month: 6, day: 15, hour: 9, minute: 15 });
      const result = getReadableDateAndTime(today, currentDate);
      expect(result).toEqual({ date: null, time: "9:15 AM" });
    });

    it("should handle midnight times", () => {
      const today = DateTime.fromObject({ year: 2024, month: 6, day: 15, hour: 0, minute: 0 });
      const result = getReadableDateAndTime(today, currentDate);
      expect(result).toEqual({ date: null, time: "12:00 AM" });
    });

    it("should handle noon times", () => {
      const today = DateTime.fromObject({ year: 2024, month: 6, day: 15, hour: 12, minute: 0 });
      const result = getReadableDateAndTime(today, currentDate);
      expect(result).toEqual({ date: null, time: "12:00 PM" });
    });
  });

  describe("same week", () => {
    it("should return weekday name and time when date is this week", () => {
      const thisWeek = DateTime.fromObject({ year: 2024, month: 6, day: 13, hour: 14, minute: 30 }); // Thursday
      const result = getReadableDateAndTime(thisWeek, currentDate);
      expect(result).toEqual({ date: "Thursday", time: "2:30 PM" });
    });

    it("should return weekday name and time for different weekdays", () => {
      const friday = DateTime.fromObject({ year: 2024, month: 6, day: 14, hour: 10, minute: 0 });
      const result = getReadableDateAndTime(friday, currentDate);
      expect(result).toEqual({ date: "Friday", time: "10:00 AM" });
    });

    it("should handle end of week", () => {
      const sunday = DateTime.fromObject({ year: 2024, month: 6, day: 16, hour: 20, minute: 45 });
      const result = getReadableDateAndTime(sunday, currentDate);
      expect(result).toEqual({ date: "Sunday", time: "8:45 PM" });
    });
  });

  describe("same month", () => {
    it("should return date with weekday and time when in same month", () => {
      const sameMonth = DateTime.fromObject({
        year: 2024,
        month: 6,
        day: 25,
        hour: 16,
        minute: 20,
      });
      const result = getReadableDateAndTime(sameMonth, currentDate);
      expect(result).toEqual({ date: "Tue, Jun 25", time: "4:20 PM" });
    });

    it("should handle single digit days", () => {
      const singleDigitDay = DateTime.fromObject({
        year: 2024,
        month: 6,
        day: 5,
        hour: 11,
        minute: 30,
      });
      const result = getReadableDateAndTime(singleDigitDay, currentDate);
      expect(result).toEqual({ date: "Wed, Jun 5", time: "11:30 AM" });
    });

    it("should handle double digit days", () => {
      const doubleDigitDay = DateTime.fromObject({
        year: 2024,
        month: 6,
        day: 30,
        hour: 19,
        minute: 15,
      });
      const result = getReadableDateAndTime(doubleDigitDay, currentDate);
      expect(result).toEqual({ date: "Sun, Jun 30", time: "7:15 PM" });
    });
  });

  describe("same year", () => {
    it("should return date without year and time when in same year", () => {
      const sameYear = DateTime.fromObject({ year: 2024, month: 8, day: 15, hour: 13, minute: 45 });
      const result = getReadableDateAndTime(sameYear, currentDate);
      expect(result).toEqual({ date: "Aug 15", time: "1:45 PM" });
    });

    it("should handle different months", () => {
      const december = DateTime.fromObject({ year: 2024, month: 12, day: 25, hour: 18, minute: 0 });
      const result = getReadableDateAndTime(december, currentDate);
      expect(result).toEqual({ date: "Dec 25", time: "6:00 PM" });
    });

    it("should handle beginning of year", () => {
      const january = DateTime.fromObject({ year: 2024, month: 1, day: 1, hour: 0, minute: 0 });
      const result = getReadableDateAndTime(january, currentDate);
      expect(result).toEqual({ date: "Jan 1", time: "12:00 AM" });
    });
  });

  describe("different year", () => {
    it("should return full date with year and time when in different year", () => {
      const differentYear = DateTime.fromObject({
        year: 2023,
        month: 10,
        day: 15,
        hour: 15,
        minute: 30,
      });
      const result = getReadableDateAndTime(differentYear, currentDate);
      expect(result).toEqual({ date: "Oct 15, 2023", time: "3:30 PM" });
    });

    it("should handle future years", () => {
      const futureYear = DateTime.fromObject({ year: 2025, month: 3, day: 20, hour: 9, minute: 0 });
      const result = getReadableDateAndTime(futureYear, currentDate);
      expect(result).toEqual({ date: "Mar 20, 2025", time: "9:00 AM" });
    });

    it("should handle past years", () => {
      const pastYear = DateTime.fromObject({ year: 2022, month: 7, day: 4, hour: 12, minute: 0 });
      const result = getReadableDateAndTime(pastYear, currentDate);
      expect(result).toEqual({ date: "Jul 4, 2022", time: "12:00 PM" });
    });
  });

  describe("edge cases", () => {
    it("should handle leap year dates", () => {
      const leapYearDate = DateTime.fromObject({
        year: 2024,
        month: 2,
        day: 29,
        hour: 14,
        minute: 30,
      });
      const result = getReadableDateAndTime(leapYearDate, currentDate);
      expect(result).toEqual({ date: "Feb 29", time: "2:30 PM" });
    });

    it("should handle month transitions", () => {
      const monthTransition = DateTime.fromObject({
        year: 2024,
        month: 7,
        day: 1,
        hour: 0,
        minute: 0,
      });
      const result = getReadableDateAndTime(monthTransition, currentDate);
      expect(result).toEqual({ date: "Jul 1", time: "12:00 AM" });
    });

    it("should handle year transitions", () => {
      const yearTransition = DateTime.fromObject({
        year: 2025,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
      });
      const result = getReadableDateAndTime(yearTransition, currentDate);
      expect(result).toEqual({ date: "Jan 1, 2025", time: "12:00 AM" });
    });

    it("should handle very early morning times", () => {
      const earlyMorning = DateTime.fromObject({
        year: 2024,
        month: 6,
        day: 20,
        hour: 3,
        minute: 45,
      });
      const result = getReadableDateAndTime(earlyMorning, currentDate);
      expect(result).toEqual({ date: "Thu, Jun 20", time: "3:45 AM" });
    });

    it("should handle late night times", () => {
      const lateNight = DateTime.fromObject({
        year: 2024,
        month: 6,
        day: 22,
        hour: 23,
        minute: 59,
      });
      const result = getReadableDateAndTime(lateNight, currentDate);
      expect(result).toEqual({ date: "Sat, Jun 22", time: "11:59 PM" });
    });
  });

  describe("default current date", () => {
    it("should use current date when no reference date provided", () => {
      const futureDate = DateTime.fromObject({
        year: 2024,
        month: 7,
        day: 15,
        hour: 14,
        minute: 30,
      });
      const result = getReadableDateAndTime(futureDate);
      // This test will depend on when it's run, so we'll just verify it returns the expected structure
      expect(result).toHaveProperty("date");
      expect(result).toHaveProperty("time");
      expect(result.time).toBe("2:30 PM");
    });

    it("should handle today's date when no reference date provided", () => {
      const today = DateTime.now();
      const result = getReadableDateAndTime(today);
      // This test will depend on when it's run, so we'll just verify it returns the expected structure
      expect(result).toHaveProperty("date");
      expect(result).toHaveProperty("time");
      expect(typeof result.time).toBe("string");
    });
  });

  describe("time formatting", () => {
    it("should format 12-hour time correctly", () => {
      const morning = DateTime.fromObject({ year: 2024, month: 6, day: 20, hour: 9, minute: 30 });
      const result = getReadableDateAndTime(morning, currentDate);
      expect(result.time).toBe("9:30 AM");

      const afternoon = DateTime.fromObject({
        year: 2024,
        month: 6,
        day: 20,
        hour: 14,
        minute: 30,
      });
      const result2 = getReadableDateAndTime(afternoon, currentDate);
      expect(result2.time).toBe("2:30 PM");
    });

    it("should handle single digit minutes", () => {
      const singleMinute = DateTime.fromObject({
        year: 2024,
        month: 6,
        day: 20,
        hour: 10,
        minute: 5,
      });
      const result = getReadableDateAndTime(singleMinute, currentDate);
      expect(result.time).toBe("10:05 AM");
    });

    it("should handle double digit minutes", () => {
      const doubleMinute = DateTime.fromObject({
        year: 2024,
        month: 6,
        day: 20,
        hour: 16,
        minute: 45,
      });
      const result = getReadableDateAndTime(doubleMinute, currentDate);
      expect(result.time).toBe("4:45 PM");
    });
  });
});

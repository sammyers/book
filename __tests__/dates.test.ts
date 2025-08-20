import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import { formatDateRange } from "../utils/display";

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

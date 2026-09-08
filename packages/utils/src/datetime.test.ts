/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addDaysToDate,
  calculateTimeAgo,
  calculateTimeAgoShort,
  checkDateCriteria,
  checkIfDatesAreEqual,
  convertHoursMinutesToMinutes,
  convertMinutesToHoursAndMinutes,
  convertMinutesToHoursMinutesString,
  findHowManyDaysLeft,
  findTotalDaysInRange,
  formatDateRange,
  formatDuration,
  generateDateArray,
  getDate,
  getReadTimeFromWordsCount,
  getWeekNumberOfDate,
  isDateGreaterThanToday,
  isInDateFormat,
  isValidDate,
  parseDateFilter,
  processRelativeDate,
  renderFormattedDate,
  renderFormattedDateWithoutYear,
  renderFormattedPayloadDate,
  renderFormattedTime,
} from "./datetime";

const NOW = new Date(2024, 5, 15, 12, 0, 0); // 2024-06-15 12:00 local

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getDate", () => {
  it("parses yyyy-mm-dd strings as local dates", () => {
    const date = getDate("2024-01-05");
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(0);
    expect(date?.getDate()).toBe(5);
  });

  it("ignores any time component in the string", () => {
    expect(getDate("2024-01-05T23:59:59Z")?.getDate()).toBe(5);
  });

  it("passes Date instances through", () => {
    const input = new Date(2024, 0, 1);
    expect(getDate(input)).toBe(input);
  });

  it("returns undefined for empty or invalid values", () => {
    expect(getDate(undefined)).toBeUndefined();
    expect(getDate(null)).toBeUndefined();
    expect(getDate("")).toBeUndefined();
    expect(getDate("not-a-date")?.getTime()).toBeNaN();
  });
});

describe("formatting helpers", () => {
  it("renderFormattedDate uses the default and custom format", () => {
    expect(renderFormattedDate("2024-01-01")).toBe("Jan 01, 2024");
    expect(renderFormattedDate("2024-01-01", "yyyy/MM/dd")).toBe("2024/01/01");
    expect(renderFormattedDate(undefined)).toBeUndefined();
  });

  it("renderFormattedDate falls back to the default format on bad tokens", () => {
    expect(renderFormattedDate("2024-01-01", "MM-DD-YYYY")).toBe("Jan 01, 2024");
  });

  it("renderFormattedDateWithoutYear drops the year", () => {
    expect(renderFormattedDateWithoutYear("2024-01-01")).toBe("Jan 01");
    expect(renderFormattedDateWithoutYear("")).toBe("");
  });

  it("renderFormattedPayloadDate formats for API payloads", () => {
    expect(renderFormattedPayloadDate(new Date(2024, 0, 1))).toBe("2024-01-01");
    expect(renderFormattedPayloadDate(null)).toBeUndefined();
  });

  it("renderFormattedTime supports 12 and 24 hour formats", () => {
    const date = new Date(2024, 0, 1, 13, 5);
    expect(renderFormattedTime(date)).toBe("13:05");
    expect(renderFormattedTime(date, "12-hour")).toBe("01:05 PM");
    expect(renderFormattedTime("invalid")).toBe("");
  });
});

describe("date arithmetic", () => {
  it("findTotalDaysInRange is inclusive by default", () => {
    expect(findTotalDaysInRange("2021-01-01", "2021-01-08")).toBe(8);
    expect(findTotalDaysInRange("2021-01-01", "2021-01-08", false)).toBe(7);
    expect(findTotalDaysInRange(undefined, "2021-01-08")).toBeUndefined();
  });

  it("addDaysToDate returns a new date", () => {
    const start = new Date(2024, 0, 30);
    const result = addDaysToDate(start, 3);
    expect(result?.getMonth()).toBe(1);
    expect(result?.getDate()).toBe(2);
    expect(start.getDate()).toBe(30);
    expect(addDaysToDate(null, 3)).toBeUndefined();
  });

  it("findHowManyDaysLeft counts from today", () => {
    expect(findHowManyDaysLeft("2024-06-20")).toBe(5);
    expect(findHowManyDaysLeft("2024-06-20", false)).toBe(4);
    expect(findHowManyDaysLeft(null)).toBeUndefined();
  });

  it("checkIfDatesAreEqual compares calendar dates", () => {
    expect(checkIfDatesAreEqual("2024-01-01", "2024-01-01")).toBe(true);
    expect(checkIfDatesAreEqual("2024-01-01", "2024-01-02")).toBe(false);
    expect(checkIfDatesAreEqual(null, undefined)).toBe(true);
    expect(checkIfDatesAreEqual("2024-01-01", null)).toBe(false);
  });

  it("getWeekNumberOfDate returns the week of the year", () => {
    expect(getWeekNumberOfDate(new Date(2023, 0, 1))).toBe(1);
    expect(getWeekNumberOfDate(new Date(2023, 8, 1))).toBe(35);
  });
});

describe("relative time", () => {
  it("calculateTimeAgo formats with a suffix", () => {
    expect(calculateTimeAgo(null)).toBe("");
    expect(calculateTimeAgo(new Date(2024, 5, 15, 11, 0, 0))).toBe("about 1 hour ago");
  });

  it("calculateTimeAgoShort uses compact units", () => {
    expect(calculateTimeAgoShort(null)).toBe("");
    expect(calculateTimeAgoShort(new Date(NOW.getTime() - 30 * 1000))).toBe("30s");
    expect(calculateTimeAgoShort(new Date(NOW.getTime() - 5 * 60 * 1000))).toBe("5m");
    expect(calculateTimeAgoShort(new Date(NOW.getTime() - 3 * 3600 * 1000))).toBe("3h");
    expect(calculateTimeAgoShort(new Date(NOW.getTime() - 4 * 86400 * 1000))).toBe("4d");
    expect(calculateTimeAgoShort(new Date(NOW.getTime() - 65 * 86400 * 1000))).toBe("2mo");
    expect(calculateTimeAgoShort(new Date(NOW.getTime() - 800 * 86400 * 1000))).toBe("2y");
  });

  it("isDateGreaterThanToday compares against now", () => {
    expect(isDateGreaterThanToday("2024-06-16")).toBe(true);
    expect(isDateGreaterThanToday("2024-06-14")).toBe(false);
    expect(isDateGreaterThanToday("")).toBe(false);
    expect(isDateGreaterThanToday("garbage")).toBe(false);
  });
});

describe("string / numeric conversions", () => {
  it("isInDateFormat matches yyyy-mm-dd", () => {
    expect(isInDateFormat("2024-01-01")).toBe(true);
    expect(isInDateFormat("01-01-2024")).toBe(false);
  });

  it("converts hours and minutes", () => {
    expect(convertHoursMinutesToMinutes(2, 30)).toBe(150);
    expect(convertMinutesToHoursAndMinutes(150)).toEqual({ hours: 2, minutes: 30 });
    expect(convertMinutesToHoursMinutesString(150)).toBe("2h 30m ");
    expect(convertMinutesToHoursMinutesString(60)).toBe("1h ");
    expect(convertMinutesToHoursMinutesString(0)).toBe("");
  });

  it("getReadTimeFromWordsCount assumes 200 wpm", () => {
    expect(getReadTimeFromWordsCount(400)).toBe(120);
    expect(getReadTimeFromWordsCount(100)).toBe(30);
  });

  it("isValidDate accepts parseable strings and dates", () => {
    expect(isValidDate("2024-01-01")).toBe(true);
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate("nope")).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(42)).toBe(false);
  });
});

describe("generateDateArray", () => {
  it("produces consecutive dates", () => {
    const result = generateDateArray("2024-01-01", "2024-01-03");
    expect(result[0].date).toBe("2024-01-01");
    expect(result.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < result.length; i++) {
      const prev = new Date(result[i - 1].date).getTime();
      const curr = new Date(result[i].date).getTime();
      expect(curr - prev).toBe(86400 * 1000);
    }
  });
});

describe("date filters", () => {
  it("processRelativeDate handles days, weeks and months", () => {
    expect(processRelativeDate("2_days").getDate()).toBe(17);
    expect(processRelativeDate("1_weeks").getDate()).toBe(22);
    expect(processRelativeDate("-1_months").getMonth()).toBe(4);
    expect(() => processRelativeDate("x_days")).toThrow(/Invalid relative amount/);
    expect(() => processRelativeDate("1_years")).toThrow(/Unsupported time unit/);
  });

  it("parseDateFilter handles relative and absolute dates", () => {
    const relative = parseDateFilter("1_weeks;after;fromnow");
    expect(relative.type).toBe("after");
    expect(relative.date.getDate()).toBe(22);

    const absolute = parseDateFilter("2024-12-01;before");
    expect(absolute.type).toBe("before");
    expect(absolute.date.toISOString().startsWith("2024-12-01")).toBe(true);
  });

  it("checkDateCriteria ignores the time of day", () => {
    const filter = new Date(2024, 0, 10, 15, 30);
    expect(checkDateCriteria(new Date(2024, 0, 10, 1, 0), filter, "after")).toBe(true);
    expect(checkDateCriteria(new Date(2024, 0, 9), filter, "after")).toBe(false);
    expect(checkDateCriteria(new Date(2024, 0, 10, 23, 0), filter, "before")).toBe(true);
    expect(checkDateCriteria(new Date(2024, 0, 11), filter, "before")).toBe(false);
    expect(checkDateCriteria(null, filter, "after")).toBe(false);
  });
});

describe("formatDateRange", () => {
  it("formats every branch", () => {
    expect(formatDateRange(null, null)).toBe("");
    expect(formatDateRange(new Date(2025, 0, 24), null)).toBe("Jan 24, 2025");
    expect(formatDateRange(null, new Date(2025, 0, 24))).toBe("Jan 24, 2025");
    expect(formatDateRange(new Date(2025, 0, 24), new Date(2025, 0, 28))).toBe("Jan 24 - 28, 2025");
    expect(formatDateRange(new Date(2025, 0, 24), new Date(2025, 1, 6))).toBe("Jan 24 - Feb 06, 2025");
    expect(formatDateRange(new Date(2024, 11, 28), new Date(2025, 0, 4))).toBe("Dec 28, 2024 - Jan 04, 2025");
  });
});

describe("formatDuration", () => {
  it("formats seconds into a readable string", () => {
    expect(formatDuration(3665)).toBe("1 hr 1 min 5 sec");
    expect(formatDuration(125)).toBe("2 min 5 sec");
    expect(formatDuration(45)).toBe("45 sec");
    expect(formatDuration(3600)).toBe("1 hr");
    expect(formatDuration(0)).toBe("0 sec");
    expect(formatDuration(0.1223094)).toBe("122.31 ms");
  });

  it("returns N/A for invalid input", () => {
    expect(formatDuration(null)).toBe("N/A");
    expect(formatDuration(undefined)).toBe("N/A");
    expect(formatDuration(-1)).toBe("N/A");
    expect(formatDuration(Number.NaN)).toBe("N/A");
  });
});

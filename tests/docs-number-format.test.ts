import { describe, expect, it } from "vitest";
import { formatExactNumber } from "../docs/format-exact-number";

describe("catalogue exact numeric display", () => {
  it.each([
    ["9007199254740993.1234", "9,007,199,254,740,993.1234"],
    ["-1234567.123456789", "-1,234,567.123456789"],
    ["−1234567.0000", "−1,234,567.0000"],
    ["1234", "1,234"],
    ["0.0000", "0.0000"],
    ["-0.0001", "-0.0001"],
    [null, null],
  ])("groups %s without losing precision or fractional zeros", (raw, expected) => {
    expect(formatExactNumber(raw)).toBe(expected);
  });
});

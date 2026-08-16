import { describe, expect, it } from "vitest";
import { normalizePhoneNumber } from "../phone";

describe("phone number normalization", () => {
  it("strips country code, spaces and leading zero to a stable 10-digit key", () => {
    expect(normalizePhoneNumber("+91 98765 43210")).toBe("9876543210");
    expect(normalizePhoneNumber("09876543210")).toBe("9876543210");
    expect(normalizePhoneNumber("9876543210")).toBe("9876543210");
    expect(normalizePhoneNumber("91-9876543210")).toBe("9876543210");
  });
});

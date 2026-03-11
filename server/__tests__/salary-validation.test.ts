import { validateProspect } from "../prospect-helpers";
import { insertProspectSchema } from "@shared/schema";

describe("salary field validation via validateProspect", () => {
  const base = { companyName: "Acme", roleTitle: "Engineer" };

  test("accepts a valid salary with dollar sign and commas", () => {
    const result = validateProspect({ ...base, salary: "$85,000" });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts a valid salary without dollar sign", () => {
    const result = validateProspect({ ...base, salary: "120,000" });
    expect(result.valid).toBe(true);
  });

  test("accepts a salary with cents", () => {
    const result = validateProspect({ ...base, salary: "$85,000.50" });
    expect(result.valid).toBe(true);
  });

  test("accepts a small salary without commas", () => {
    const result = validateProspect({ ...base, salary: "$500" });
    expect(result.valid).toBe(true);
  });

  test("accepts an empty salary (optional field)", () => {
    const result = validateProspect({ ...base, salary: "" });
    expect(result.valid).toBe(true);
  });

  test("accepts undefined salary (not provided)", () => {
    const result = validateProspect({ ...base });
    expect(result.valid).toBe(true);
  });

  test("accepts null salary", () => {
    const result = validateProspect({ ...base, salary: null });
    expect(result.valid).toBe(true);
  });

  test("rejects salary with letters", () => {
    const result = validateProspect({ ...base, salary: "eighty-five thousand" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a valid dollar amount (e.g. $85,000)");
  });

  test("rejects salary with random characters", () => {
    const result = validateProspect({ ...base, salary: "$$85,000" });
    expect(result.valid).toBe(false);
  });

  test("rejects salary with misplaced commas", () => {
    const result = validateProspect({ ...base, salary: "$8,50,00" });
    expect(result.valid).toBe(false);
  });

  test("rejects salary with too many decimal places", () => {
    const result = validateProspect({ ...base, salary: "$85,000.123" });
    expect(result.valid).toBe(false);
  });
});

describe("salary field validation via Zod schema", () => {
  const base = {
    companyName: "Acme",
    roleTitle: "Engineer",
    status: "Bookmarked" as const,
    interestLevel: "Medium" as const,
  };

  test("passes schema validation with valid salary", () => {
    const result = insertProspectSchema.safeParse({ ...base, salary: "$85,000" });
    expect(result.success).toBe(true);
  });

  test("passes schema validation with empty salary", () => {
    const result = insertProspectSchema.safeParse({ ...base, salary: "" });
    expect(result.success).toBe(true);
  });

  test("passes schema validation with null salary", () => {
    const result = insertProspectSchema.safeParse({ ...base, salary: null });
    expect(result.success).toBe(true);
  });

  test("passes schema validation without salary field", () => {
    const result = insertProspectSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  test("fails schema validation with invalid salary format", () => {
    const result = insertProspectSchema.safeParse({ ...base, salary: "not-a-salary" });
    expect(result.success).toBe(false);
  });

  test("fails schema validation with misformatted number", () => {
    const result = insertProspectSchema.safeParse({ ...base, salary: "8500,0" });
    expect(result.success).toBe(false);
  });
});

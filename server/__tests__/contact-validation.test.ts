import { validateProspect } from "../prospect-helpers";
import { insertProspectSchema } from "@shared/schema";

describe("contact fields validation via validateProspect", () => {
  const base = { companyName: "Acme", roleTitle: "Engineer" };

  describe("contactName", () => {
    test("accepts a valid contact name", () => {
      const result = validateProspect({ ...base, contactName: "Jane Smith" });
      expect(result.valid).toBe(true);
    });

    test("accepts empty contact name", () => {
      const result = validateProspect({ ...base, contactName: "" });
      expect(result.valid).toBe(true);
    });

    test("accepts undefined contact name", () => {
      const result = validateProspect(base);
      expect(result.valid).toBe(true);
    });
  });

  describe("contactLinkedin", () => {
    test("accepts a valid LinkedIn URL", () => {
      const result = validateProspect({ ...base, contactLinkedin: "https://linkedin.com/in/janesmith" });
      expect(result.valid).toBe(true);
    });

    test("accepts LinkedIn URL with www", () => {
      const result = validateProspect({ ...base, contactLinkedin: "https://www.linkedin.com/in/janesmith" });
      expect(result.valid).toBe(true);
    });

    test("accepts http LinkedIn URL", () => {
      const result = validateProspect({ ...base, contactLinkedin: "http://linkedin.com/in/janesmith" });
      expect(result.valid).toBe(true);
    });

    test("accepts empty LinkedIn URL", () => {
      const result = validateProspect({ ...base, contactLinkedin: "" });
      expect(result.valid).toBe(true);
    });

    test("accepts null LinkedIn URL", () => {
      const result = validateProspect({ ...base, contactLinkedin: null });
      expect(result.valid).toBe(true);
    });

    test("rejects non-LinkedIn URL", () => {
      const result = validateProspect({ ...base, contactLinkedin: "https://twitter.com/janesmith" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Must be a valid LinkedIn URL (e.g. https://linkedin.com/in/name)");
    });

    test("rejects plain text as LinkedIn URL", () => {
      const result = validateProspect({ ...base, contactLinkedin: "janesmith" });
      expect(result.valid).toBe(false);
    });
  });

  describe("contactEmail", () => {
    test("accepts a valid email", () => {
      const result = validateProspect({ ...base, contactEmail: "jane@company.com" });
      expect(result.valid).toBe(true);
    });

    test("accepts email with subdomain", () => {
      const result = validateProspect({ ...base, contactEmail: "jane@mail.company.co.uk" });
      expect(result.valid).toBe(true);
    });

    test("accepts empty email", () => {
      const result = validateProspect({ ...base, contactEmail: "" });
      expect(result.valid).toBe(true);
    });

    test("accepts null email", () => {
      const result = validateProspect({ ...base, contactEmail: null });
      expect(result.valid).toBe(true);
    });

    test("rejects email without @", () => {
      const result = validateProspect({ ...base, contactEmail: "janecompany.com" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Must be a valid email address");
    });

    test("rejects email without domain", () => {
      const result = validateProspect({ ...base, contactEmail: "jane@" });
      expect(result.valid).toBe(false);
    });

    test("rejects plain text as email", () => {
      const result = validateProspect({ ...base, contactEmail: "not an email" });
      expect(result.valid).toBe(false);
    });
  });
});

describe("contact fields validation via Zod schema", () => {
  const base = {
    companyName: "Acme",
    roleTitle: "Engineer",
    status: "Bookmarked" as const,
    interestLevel: "Medium" as const,
  };

  test("passes with all contact fields filled", () => {
    const result = insertProspectSchema.safeParse({
      ...base,
      contactName: "Jane Smith",
      contactLinkedin: "https://linkedin.com/in/janesmith",
      contactEmail: "jane@company.com",
    });
    expect(result.success).toBe(true);
  });

  test("passes with no contact fields", () => {
    const result = insertProspectSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  test("passes with only contact name", () => {
    const result = insertProspectSchema.safeParse({ ...base, contactName: "Jane" });
    expect(result.success).toBe(true);
  });

  test("passes with null contact fields", () => {
    const result = insertProspectSchema.safeParse({
      ...base,
      contactName: null,
      contactLinkedin: null,
      contactEmail: null,
    });
    expect(result.success).toBe(true);
  });

  test("fails with invalid LinkedIn URL", () => {
    const result = insertProspectSchema.safeParse({
      ...base,
      contactLinkedin: "https://twitter.com/jane",
    });
    expect(result.success).toBe(false);
  });

  test("fails with invalid email", () => {
    const result = insertProspectSchema.safeParse({
      ...base,
      contactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

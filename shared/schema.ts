import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const STATUSES = [
  "Bookmarked",
  "Applied",
  "Phone Screen",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export const INTEREST_LEVELS = ["High", "Medium", "Low"] as const;

export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  roleTitle: text("role_title").notNull(),
  jobUrl: text("job_url"),
  salary: text("salary"),
  contactName: text("contact_name"),
  contactLinkedin: text("contact_linkedin"),
  contactEmail: text("contact_email"),
  status: text("status").notNull().default("Bookmarked"),
  interestLevel: text("interest_level").notNull().default("Medium"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
}).extend({
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  status: z.enum(STATUSES).default("Bookmarked"),
  interestLevel: z.enum(INTEREST_LEVELS).default("Medium"),
  jobUrl: z.string().optional().nullable(),
  salary: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^\$?\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(val),
      { message: "Salary must be a valid dollar amount (e.g. $85,000)" }
    ),
  contactName: z.string().optional().nullable(),
  contactLinkedin: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\/(www\.)?linkedin\.com\//.test(val),
      { message: "Must be a valid LinkedIn URL (e.g. https://linkedin.com/in/name)" }
    ),
  contactEmail: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: "Must be a valid email address" }
    ),
  notes: z.string().optional().nullable(),
});

export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospects.$inferSelect;

import { pgTable, serial, text, varchar, integer, decimal, boolean, timestamp, uuid, pgEnum, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Auth tables
export { user, session, account, verification } from "./auth-schema";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const projectStatusEnum = pgEnum("project_status", ["draft", "investigating", "estimated", "completed"]);

// Prefectures
export const prefectures = pgTable("prefectures", {
  id: serial("id").primaryKey(),
  code: integer("code").notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  shortName: varchar("short_name", { length: 20 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Municipalities
export const municipalities = pgTable("municipalities", {
  id: serial("id").primaryKey(),
  prefectureId: integer("prefecture_id").notNull().references(() => prefectures.id),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Investigation Items Master
export const investigationItems = pgTable("investigation_items", {
  id: serial("id").primaryKey(),
  prefectureId: integer("prefecture_id").notNull().references(() => prefectures.id),
  municipalityName: varchar("municipality_name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
  unit: varchar("unit", { length: 20 }).default("式").notNull(),
  costPrice: integer("cost_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  daysBeforeConstruction: integer("days_before_construction"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Common Items (prefecture-independent)
export const commonItems = pgTable("common_items", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
  unit: varchar("unit", { length: 20 }).default("式").notNull(),
  costPrice: integer("cost_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectNumber: varchar("project_number", { length: 50 }).unique(),
  propertyName: varchar("property_name", { length: 500 }).notNull(),
  prefectureId: integer("prefecture_id").references(() => prefectures.id),
  municipality: varchar("municipality", { length: 100 }),
  lotNumber: varchar("lot_number", { length: 500 }),
  addressDisplay: varchar("address_display", { length: 500 }),
  siteArea: decimal("site_area", { precision: 10, scale: 2 }),
  buildingScale: varchar("building_scale", { length: 200 }),
  cityPlanningZone: varchar("city_planning_zone", { length: 200 }),
  firePrevention: varchar("fire_prevention", { length: 100 }),
  zoning: varchar("zoning", { length: 200 }),
  heightDistrict: varchar("height_district", { length: 200 }),
  buildingCoverage: decimal("building_coverage", { precision: 5, scale: 2 }),
  floorAreaRatio: decimal("floor_area_ratio", { precision: 5, scale: 2 }),
  customerName: varchar("customer_name", { length: 200 }),
  status: projectStatusEnum("status").default("draft").notNull(),
  assignedUserId: text("assigned_user_id"),
  estimateNumber: varchar("estimate_number", { length: 50 }),
  estimateDate: date("estimate_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project Survey (investigation form data)
export const projectSurvey = pgTable("project_survey", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }).unique(),
  districtPlan: text("district_plan"),
  districtPlanNotes: text("district_plan_notes"),
  buildingAgreement: text("building_agreement"),
  buildingAgreementNotes: text("building_agreement_notes"),
  landscape: text("landscape"),
  landscapeNotes: text("landscape_notes"),
  buriedCultural: text("buried_cultural"),
  buriedCulturalNotes: text("buried_cultural_notes"),
  road1Type: varchar("road_1_type", { length: 100 }),
  road1Side: varchar("road_1_side", { length: 50 }),
  road1Name: text("road_1_name"),
  road1Character: varchar("road_1_character", { length: 100 }),
  road1Width: decimal("road_1_width", { precision: 5, scale: 2 }),
  road1Demarcation: varchar("road_1_demarcation", { length: 50 }),
  road2Type: varchar("road_2_type", { length: 100 }),
  road2Side: varchar("road_2_side", { length: 50 }),
  road2Name: text("road_2_name"),
  road2Character: varchar("road_2_character", { length: 100 }),
  road2Width: decimal("road_2_width", { precision: 5, scale: 2 }),
  road2Demarcation: varchar("road_2_demarcation", { length: 50 }),
  road3Type: varchar("road_3_type", { length: 100 }),
  road3Side: varchar("road_3_side", { length: 50 }),
  road3Name: text("road_3_name"),
  road3Character: varchar("road_3_character", { length: 100 }),
  road3Width: decimal("road_3_width", { precision: 5, scale: 2 }),
  road3Demarcation: varchar("road_3_demarcation", { length: 50 }),
  publicSewerage: text("public_sewerage"),
  sewerageLedger: boolean("sewerage_ledger"),
  sewerageNotes: text("sewerage_notes"),
  waterSupply: text("water_supply"),
  waterLedger: boolean("water_ledger"),
  waterNotes: text("water_notes"),
  gas: text("gas"),
  gasNotes: text("gas_notes"),
  scenicDistrict: text("scenic_district"),
  scenicNotes: text("scenic_notes"),
  wallSetbackRoad: varchar("wall_setback_road", { length: 100 }),
  wallSetbackAdjacent: varchar("wall_setback_adjacent", { length: 100 }),
  retainingWallRegulation: text("retaining_wall_regulation"),
  retainingWallNotes: text("retaining_wall_notes"),
  sedimentControl: text("sediment_control"),
  sedimentNotes: text("sediment_notes"),
  riverConservation: text("river_conservation"),
  riverWidth: decimal("river_width", { precision: 5, scale: 2 }),
  riverNotes: text("river_notes"),
  landslide: text("landslide"),
  steepSlope: text("steep_slope"),
  disasterWarning: text("disaster_warning"),
  fireDepartment: text("fire_department"),
  intermediateInspection: text("intermediate_inspection"),
  highriseRelated: text("highrise_related"),
  developmentGuidelines: text("development_guidelines"),
  cityPlanningFacility: text("city_planning_facility"),
  extraNotes: text("extra_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project Items (estimate line items)
export const projectItems = pgTable("project_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sourceItemId: integer("source_item_id").references(() => investigationItems.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1").notNull(),
  unit: varchar("unit", { length: 20 }).default("式").notNull(),
  costPrice: integer("cost_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  isSelected: boolean("is_selected").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const prefecturesRelations = relations(prefectures, ({ many }) => ({
  municipalities: many(municipalities),
  investigationItems: many(investigationItems),
  projects: many(projects),
}));

export const municipalitiesRelations = relations(municipalities, ({ one }) => ({
  prefecture: one(prefectures, {
    fields: [municipalities.prefectureId],
    references: [prefectures.id],
  }),
}));

export const investigationItemsRelations = relations(investigationItems, ({ one }) => ({
  prefecture: one(prefectures, {
    fields: [investigationItems.prefectureId],
    references: [prefectures.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  prefecture: one(prefectures, {
    fields: [projects.prefectureId],
    references: [prefectures.id],
  }),
  survey: one(projectSurvey),
  items: many(projectItems),
}));

export const projectSurveyRelations = relations(projectSurvey, ({ one }) => ({
  project: one(projects, {
    fields: [projectSurvey.projectId],
    references: [projects.id],
  }),
}));

export const projectItemsRelations = relations(projectItems, ({ one }) => ({
  project: one(projects, {
    fields: [projectItems.projectId],
    references: [projects.id],
  }),
  sourceItem: one(investigationItems, {
    fields: [projectItems.sourceItemId],
    references: [investigationItems.id],
  }),
}));

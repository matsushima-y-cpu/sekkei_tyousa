import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";

// Auth tables
export { user, session, account, verification } from "./auth-schema";

// Prefectures
export const prefectures = sqliteTable("prefectures", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: integer("code").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
});

// Municipalities
export const municipalities = sqliteTable("municipalities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prefectureId: integer("prefecture_id").notNull().references(() => prefectures.id),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
});

// Investigation Items Master
export const investigationItems = sqliteTable("investigation_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prefectureId: integer("prefecture_id").notNull().references(() => prefectures.id),
  municipalityName: text("municipality_name").notNull(),
  description: text("description").notNull(),
  quantity: text("quantity").default("1").notNull(),
  unit: text("unit").default("式").notNull(),
  costPrice: integer("cost_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  daysBeforeConstruction: integer("days_before_construction"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Common Items (prefecture-independent)
export const commonItems = sqliteTable("common_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category"),
  description: text("description").notNull(),
  quantity: text("quantity").default("1").notNull(),
  unit: text("unit").default("式").notNull(),
  costPrice: integer("cost_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Projects
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  projectNumber: text("project_number").unique(),
  propertyName: text("property_name").notNull(),
  prefectureId: integer("prefecture_id").references(() => prefectures.id),
  municipality: text("municipality"),
  lotNumber: text("lot_number"),
  addressDisplay: text("address_display"),
  siteArea: text("site_area"),
  buildingScale: text("building_scale"),
  cityPlanningZone: text("city_planning_zone"),
  firePrevention: text("fire_prevention"),
  zoning: text("zoning"),
  heightDistrict: text("height_district"),
  buildingCoverage: text("building_coverage"),
  floorAreaRatio: text("floor_area_ratio"),
  customerName: text("customer_name"),
  status: text("status", { enum: ["draft", "investigating", "estimated", "completed"] }).default("draft").notNull(),
  assignedUserId: text("assigned_user_id"),
  estimateNumber: text("estimate_number"),
  estimateDate: text("estimate_date"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Project Survey (investigation form data)
export const projectSurvey = sqliteTable("project_survey", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }).unique(),
  districtPlan: text("district_plan"),
  districtPlanNotes: text("district_plan_notes"),
  buildingAgreement: text("building_agreement"),
  buildingAgreementNotes: text("building_agreement_notes"),
  landscape: text("landscape"),
  landscapeNotes: text("landscape_notes"),
  buriedCultural: text("buried_cultural"),
  buriedCulturalNotes: text("buried_cultural_notes"),
  road1Type: text("road_1_type"),
  road1Side: text("road_1_side"),
  road1Name: text("road_1_name"),
  road1Character: text("road_1_character"),
  road1Width: text("road_1_width"),
  road1Demarcation: text("road_1_demarcation"),
  road2Type: text("road_2_type"),
  road2Side: text("road_2_side"),
  road2Name: text("road_2_name"),
  road2Character: text("road_2_character"),
  road2Width: text("road_2_width"),
  road2Demarcation: text("road_2_demarcation"),
  road3Type: text("road_3_type"),
  road3Side: text("road_3_side"),
  road3Name: text("road_3_name"),
  road3Character: text("road_3_character"),
  road3Width: text("road_3_width"),
  road3Demarcation: text("road_3_demarcation"),
  publicSewerage: text("public_sewerage"),
  sewerageLedger: integer("sewerage_ledger", { mode: "boolean" }),
  sewerageNotes: text("sewerage_notes"),
  waterSupply: text("water_supply"),
  waterLedger: integer("water_ledger", { mode: "boolean" }),
  waterNotes: text("water_notes"),
  gas: text("gas"),
  gasNotes: text("gas_notes"),
  scenicDistrict: text("scenic_district"),
  scenicNotes: text("scenic_notes"),
  wallSetbackRoad: text("wall_setback_road"),
  wallSetbackAdjacent: text("wall_setback_adjacent"),
  retainingWallRegulation: text("retaining_wall_regulation"),
  retainingWallNotes: text("retaining_wall_notes"),
  sedimentControl: text("sediment_control"),
  sedimentNotes: text("sediment_notes"),
  riverConservation: text("river_conservation"),
  riverWidth: text("river_width"),
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
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Project Items (estimate line items)
export const projectItems = sqliteTable("project_items", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sourceItemId: integer("source_item_id").references(() => investigationItems.id),
  description: text("description").notNull(),
  quantity: text("quantity").default("1").notNull(),
  unit: text("unit").default("式").notNull(),
  costPrice: integer("cost_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  isSelected: integer("is_selected", { mode: "boolean" }).default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
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

import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  projectId: integer("project_id").notNull(),
  emoji: text("emoji").default("📄"),
  status: text("status").default("draft").notNull(), // draft, in-progress, in-review, complete
  priority: text("priority").default("medium"), // low, medium, high
  tags: text("tags").array(),
  favorite: boolean("favorite").default(false),
  assignedTo: text("assigned_to"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  projectId: integer("project_id").notNull(),
  content: text("content").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const materialAnalyses = pgTable("material_analyses", {
  id: serial("id").primaryKey(),
  materialId: integer("material_id").notNull(),
  insights: jsonb("insights").notNull(),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priority: text("priority").notNull(), // high, medium, low
  duration: integer("duration").notNull(), // in days
  projectId: integer("project_id").notNull(),
});

export const roadmapEvents = pgTable("roadmap_events", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  projectId: integer("project_id").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  userId: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
  projectId: true,
  emoji: true,
  status: true,
  priority: true,
  tags: true,
  favorite: true,
  assignedTo: true,
  dueDate: true,
});

export const insertMaterialSchema = createInsertSchema(materials).pick({
  name: true,
  type: true,
  size: true,
  projectId: true,
  content: true,
});

export const insertMaterialAnalysisSchema = createInsertSchema(materialAnalyses).pick({
  materialId: true,
  insights: true,
});

export const insertFeatureSchema = createInsertSchema(features).pick({
  name: true,
  description: true,
  priority: true,
  duration: true,
  projectId: true,
});

export const insertRoadmapEventSchema = createInsertSchema(roadmapEvents).pick({
  featureId: true,
  startDate: true,
  endDate: true,
  projectId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type MaterialAnalysis = typeof materialAnalyses.$inferSelect;
export type InsertMaterialAnalysis = z.infer<typeof insertMaterialAnalysisSchema>;

export type Feature = typeof features.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;

export type RoadmapEvent = typeof roadmapEvents.$inferSelect;
export type InsertRoadmapEvent = z.infer<typeof insertRoadmapEventSchema>;

// Additional types for document interface
export type StatusType = 'draft' | 'in-progress' | 'in-review' | 'complete';
export type PriorityType = 'low' | 'medium' | 'high';
export type ViewType = 'table' | 'gallery' | 'list';
export type SortDirection = 'asc' | 'desc';

export interface ColumnType {
  id: string;
  label: string;
  width: number;
  sortable: boolean;
  visible: boolean;
  type: 'text' | 'date' | 'status' | 'priority' | 'emoji' | 'tags' | 'user';
}

export interface DocumentCustom {
  createdBy: string;
  wordCount: number;
  estimatedReadTime: string;
  lastEdited: string;
  lastEditedBy: string;
  comments: number;
}

export interface DocumentWithMetadata {
  id: number;
  title: string;
  content: string | null;
  projectId: number;
  emoji: string;
  status: StatusType;
  priority: PriorityType;
  tags: string[];
  favorite: boolean;
  assignedTo: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  custom?: DocumentCustom;
}

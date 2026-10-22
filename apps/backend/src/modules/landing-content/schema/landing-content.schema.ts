import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LandingContentDocument = LandingContent & Document;

export class TeamMemberItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  role: string;

  @Prop({ default: "" })
  description?: string;

  @Prop({ default: "" })
  image?: string;

  @Prop({ default: "" })
  fallback?: string;

  @Prop({ type: Object, default: {} })
  social?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export class ClientCompanyItem {
  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  logo?: string; // image URL or SVG icon identifier

  @Prop({ default: "" })
  website?: string;
}

export class CounterStatItem {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  value: string; // e.g. "50+", "350+"

  @Prop({ default: "" })
  description?: string;

  @Prop({ default: "" })
  icon?: string;
}

export class FaqItem {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;
}

export class TestimonialItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  role: string;

  @Prop({ default: "" })
  clinic?: string;

  @Prop({ default: "" })
  image?: string;

  @Prop({ required: true })
  quote: string;
}

@Schema({ timestamps: true, versionKey: false })
export class LandingContent {
  @Prop({ unique: true, default: "global" })
  key: string; // 'global'

  // Hero Section
  @Prop({ default: "Run Your Clinic with One Simple Khata" })
  heroTitle: string;

  @Prop({ default: "Daktar Khata is the clinic management platform for doctors, clinics, and hospitals. Keep patient records, appointments, prescriptions, and earnings in one place — beautifully simple, multi-tenant by design." })
  heroSubtitle: string;

  @Prop({ default: "Tailored for the Modern Patient" })
  heroBadge: string;

  // Counter Stats Section (nicher count)
  @Prop({ type: [Object], default: [] })
  stats: CounterStatItem[];

  // Trusted By Leading Companies / Clinics Worldwide (Logo Carousel)
  @Prop({ default: "Trusted by Leading Healthcare Clinics & Medical Centers" })
  partnersTitle: string;

  @Prop({ type: [Object], default: [] })
  partners: ClientCompanyItem[];

  // Team Section
  @Prop({ default: "Meet the people behind Daktar Khata" })
  teamTitle: string;

  @Prop({ default: "A team of healthcare practitioners, engineers, and designers working to give every clinic a simpler way to run its practice." })
  teamSubtitle: string;

  @Prop({ type: [Object], default: [] })
  team: TeamMemberItem[];

  // Testimonials
  @Prop({ default: "Trusted by Doctors & Clinics Across the Country" })
  testimonialsTitle: string;

  @Prop({ type: [Object], default: [] })
  testimonials: TestimonialItem[];

  // FAQs
  @Prop({ type: [Object], default: [] })
  faqs: FaqItem[];
}

export const LandingContentSchema =
  SchemaFactory.createForClass(LandingContent);
LandingContentSchema.index({ key: 1 }, { unique: true });

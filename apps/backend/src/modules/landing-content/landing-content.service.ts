import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { collectionsName } from "../../constant";
import {
  LandingContent,
  LandingContentDocument,
} from "./schema/landing-content.schema";

const defaultContent: Partial<LandingContent> = {
  key: "global",
  heroTitle: "Run Your Clinic with One Simple Khata",
  heroSubtitle:
    "Daktar Khata is the clinic management platform for doctors, clinics, and hospitals. Keep patient records, appointments, prescriptions, and earnings in one place — beautifully simple, multi-tenant by design.",
  heroBadge: "Tailored for the Modern Patient",
  stats: [
    {
      label: "Clinics & Hospitals",
      value: "50+",
      description: "Empowered across Bangladesh",
      icon: "Building2",
    },
    {
      label: "Verified Doctors",
      value: "350+",
      description: "Prescribing & consulting daily",
      icon: "Stethoscope",
    },
    {
      label: "Patient Records",
      value: "50K+",
      description: "Safely maintained in khata",
      icon: "Users",
    },
    {
      label: "Reliability & Uptime",
      value: "99.9%",
      description: "Multi-tenant cloud platform",
      icon: "ShieldCheck",
    },
  ],
  partnersTitle: "Trusted by Leading Healthcare Clinics & Medical Centers",
  partners: [
    { name: "Medicare Diagnostic Center", logo: "hospital-1" },
    { name: "Prime Specialized Clinic", logo: "hospital-2" },
    { name: "Care Consultation Complex", logo: "hospital-3" },
    { name: "Shishu Sheba Hospital", logo: "hospital-4" },
    { name: "Al-Madina Health Care", logo: "hospital-5" },
    { name: "Square Health Diagnostics", logo: "hospital-6" },
  ],
  teamTitle: "Meet the people behind Daktar Khata",
  teamSubtitle:
    "A team of healthcare practitioners, engineers, and designers working to give every clinic a simpler way to run its practice.",
  team: [
    {
      name: "Dr. Nahid Hasan",
      role: "Founder & CEO",
      description:
        "Practicing physician turned builder, automating clinic workflows across Bangladesh.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=60&w=300&auto=format&fit=crop",
      fallback: "NH",
      social: { linkedin: "#", github: "#", website: "#" },
    },
    {
      name: "Dr. Farhana Akter",
      role: "Co-founder & Clinical Success",
      description:
        "Leads doctor onboarding and ensures every clinic gets real clinical value from day one.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=60&w=300&auto=format&fit=crop",
      fallback: "FA",
      social: { linkedin: "#", github: "#", website: "#" },
    },
    {
      name: "Sohel Rana",
      role: "Engineering Lead",
      description:
        "Brings 10+ years of software architecture to keep Daktar Khata fast, isolated and secure.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=60&w=300&auto=format&fit=crop",
      fallback: "SR",
      social: { linkedin: "#", github: "#", website: "#" },
    },
    {
      name: "Nusrat Jahan",
      role: "Product Designer",
      description:
        "Designs the simple, warm interfaces doctors and receptionists actually enjoy using daily.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=60&w=300&auto=format&fit=crop",
      fallback: "NJ",
      social: { linkedin: "#", github: "#", website: "#" },
    },
  ],
  testimonialsTitle: "Trusted by Doctors & Clinics Across the Country",
  testimonials: [
    {
      name: "Dr. Tariqul Islam",
      role: "Chief Consultant, Medicine",
      clinic: "Care Diagnostic & Consultation Center",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
      quote:
        "Daktar Khata replaced our messy paper appointment books. Now my receptionist manages our patient token queue seamlessly, and I can open any patient’s past prescription in seconds.",
    },
    {
      name: "Dr. Shahana Parveen",
      role: "Gynecologist & Obstetrician",
      clinic: "Mother & Child Care Clinic",
      image:
        "https://images.unsplash.com/photo-1594824813583-0599298516d7?q=80&w=200&auto=format&fit=crop",
      quote:
        "Prescription writing is incredibly fast with pre-saved medicine templates. Patients appreciate having neat, printed prescriptions with clear dosing instructions.",
    },
  ],
  faqs: [
    {
      question: "What is Daktar Khata?",
      answer:
        "Daktar Khata is an all-in-one clinic and hospital SaaS platform. It manages appointments, digital prescriptions, patient records, bed admissions, and daily billing khata in one simple dashboard.",
    },
    {
      question: "Can multiple doctors and staff use it simultaneously?",
      answer:
        "Yes! Each clinic gets its own isolated tenant workspace with granular role-based permissions for doctors, nurses, receptionists, and accounts personnel.",
    },
    {
      question: "Do I need separate software for billing and payments?",
      answer:
        "No. Full billing, patient invoice generation, payment collections, and doctor commission settlement are completely integrated inside Daktar Khata.",
    },
  ],
};

@Injectable()
export class LandingContentService implements OnModuleInit {
  constructor(
    @InjectModel(collectionsName.landingContent)
    private readonly landingContentModel: Model<LandingContentDocument>,
  ) {}

  async onModuleInit() {
    const existing = await this.landingContentModel.findOne({ key: "global" });
    if (!existing) {
      await this.landingContentModel.create(defaultContent);
    }
  }

  async get(): Promise<LandingContent> {
    let content = await this.landingContentModel.findOne({ key: "global" }).exec();
    if (!content) {
      content = await this.landingContentModel.create(defaultContent);
    }
    return content;
  }

  async update(payload: Partial<LandingContent>): Promise<LandingContent> {
    const updated = await this.landingContentModel.findOneAndUpdate(
      { key: "global" },
      { $set: payload },
      { new: true, upsert: true },
    );
    return updated;
  }
}

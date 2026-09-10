
// Mock data for the clinic management system

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  medicalHistory?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  yearsOfExperience: number;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  imageUrl?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  type?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  diagnosis: string;
  prescription: string[];
  notes?: string;
  followUpDate?: Date;
}

// Generate realistic mock patients
export const mockPatients: Patient[] = [
  {
    id: "p1",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "(555) 123-4567",
    dateOfBirth: new Date(1985, 5, 15),
    gender: "female",
    address: "123 Main St, Anytown, CA 12345",
    medicalHistory: ["Asthma", "Allergies: Peanuts"]
  },
  {
    id: "p2",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 987-6543",
    dateOfBirth: new Date(1975, 8, 27),
    gender: "male",
    address: "456 Oak St, Somewhere, CA 12345",
    medicalHistory: ["Hypertension", "Type 2 Diabetes"]
  },
  {
    id: "p3",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "(555) 555-1212",
    dateOfBirth: new Date(1990, 2, 10),
    gender: "female",
    address: "789 Pine St, Nowhere, CA 12345"
  },
  {
    id: "p4",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "(555) 444-3333",
    dateOfBirth: new Date(1982, 11, 5),
    gender: "male",
    address: "101 Maple Ave, Anywhere, CA 12345",
    medicalHistory: ["Migraine", "Seasonal Allergies"]
  },
  {
    id: "p5",
    name: "Emily Wilson",
    email: "emily.wilson@example.com",
    phone: "(555) 222-1111",
    dateOfBirth: new Date(1995, 7, 20),
    gender: "female",
    address: "202 Elm St, Everywhere, CA 12345"
  }
];

// Generate realistic mock doctors
export const mockDoctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. John Smith",
    email: "dr.smith@clinic.com",
    phone: "(555) 111-2222",
    specialization: "Cardiology",
    yearsOfExperience: 12,
    availability: [
      { day: "Monday", startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Wednesday", startTime: "9:00 AM", endTime: "5:00 PM" },
      { day: "Friday", startTime: "9:00 AM", endTime: "1:00 PM" }
    ],
    imageUrl: "https://ui-avatars.com/api/?name=John+Smith&background=0D8ABC&color=fff"
  },
  {
    id: "d2",
    name: "Dr. Sarah Johnson",
    email: "dr.johnson@clinic.com",
    phone: "(555) 333-4444",
    specialization: "Pediatrics",
    yearsOfExperience: 8,
    availability: [
      { day: "Tuesday", startTime: "8:00 AM", endTime: "4:00 PM" },
      { day: "Thursday", startTime: "8:00 AM", endTime: "4:00 PM" },
      { day: "Saturday", startTime: "9:00 AM", endTime: "1:00 PM" }
    ],
    imageUrl: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff"
  },
  {
    id: "d3",
    name: "Dr. Michael Chen",
    email: "dr.chen@clinic.com",
    phone: "(555) 555-6666",
    specialization: "Neurology",
    yearsOfExperience: 15,
    availability: [
      { day: "Monday", startTime: "10:00 AM", endTime: "6:00 PM" },
      { day: "Tuesday", startTime: "10:00 AM", endTime: "6:00 PM" },
      { day: "Thursday", startTime: "10:00 AM", endTime: "6:00 PM" }
    ],
    imageUrl: "https://ui-avatars.com/api/?name=Michael+Chen&background=0D8ABC&color=fff"
  },
  {
    id: "d4",
    name: "Dr. Emily Rodriguez",
    email: "dr.rodriguez@clinic.com",
    phone: "(555) 777-8888",
    specialization: "Dermatology",
    yearsOfExperience: 10,
    availability: [
      { day: "Wednesday", startTime: "8:00 AM", endTime: "4:00 PM" },
      { day: "Friday", startTime: "8:00 AM", endTime: "4:00 PM" }
    ],
    imageUrl: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=0D8ABC&color=fff"
  }
];

// Generate realistic mock appointments
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "Jane Doe",
    doctorId: "d1",
    doctorName: "Dr. John Smith",
    date: yesterday,
    time: "10:00 AM",
    status: "completed",
    notes: "Patient reported chest pain. EKG performed. Results normal.",
    type: "Check-up"
  },
  {
    id: "a2",
    patientId: "p2",
    patientName: "John Smith",
    doctorId: "d3",
    doctorName: "Dr. Michael Chen",
    date: today,
    time: "2:00 PM",
    status: "scheduled",
    type: "Consultation"
  },
  {
    id: "a3",
    patientId: "p3",
    patientName: "Sarah Johnson",
    doctorId: "d2",
    doctorName: "Dr. Sarah Johnson",
    date: today,
    time: "11:30 AM",
    status: "scheduled",
    type: "Follow-up"
  },
  {
    id: "a4",
    patientId: "p4",
    patientName: "Michael Brown",
    doctorId: "d4",
    doctorName: "Dr. Emily Rodriguez",
    date: tomorrow,
    time: "3:00 PM",
    status: "scheduled",
    type: "Consultation"
  },
  {
    id: "a5",
    patientId: "p5",
    patientName: "Emily Wilson",
    doctorId: "d1",
    doctorName: "Dr. John Smith",
    date: nextWeek,
    time: "9:30 AM",
    status: "scheduled",
    type: "Check-up"
  },
  {
    id: "a6",
    patientId: "p1",
    patientName: "Jane Doe",
    doctorId: "d2",
    doctorName: "Dr. Sarah Johnson",
    date: yesterday,
    time: "4:00 PM",
    status: "cancelled",
    notes: "Patient called to reschedule.",
    type: "Vaccination"
  }
];

// Generate realistic mock medical records
export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: "mr1",
    patientId: "p1",
    patientName: "Jane Doe",
    doctorId: "d1",
    doctorName: "Dr. John Smith",
    date: new Date(2023, 10, 15),
    diagnosis: "Mild hypertension",
    prescription: ["Lisinopril 10mg, once daily"],
    notes: "BP reading: 145/90. Patient advised to reduce sodium intake and increase physical activity.",
    followUpDate: new Date(2024, 0, 15)
  },
  {
    id: "mr2",
    patientId: "p2",
    patientName: "John Smith",
    doctorId: "d3",
    doctorName: "Dr. Michael Chen",
    date: new Date(2023, 11, 5),
    diagnosis: "Tension headache",
    prescription: ["Ibuprofen 400mg as needed", "Stress management techniques discussed"],
    notes: "Patient reports increase in work-related stress."
  },
  {
    id: "mr3",
    patientId: "p3",
    patientName: "Sarah Johnson",
    doctorId: "d2",
    doctorName: "Dr. Sarah Johnson",
    date: new Date(2024, 0, 20),
    diagnosis: "Upper respiratory infection",
    prescription: ["Amoxicillin 500mg, three times daily for 10 days", "Guaifenesin for congestion"],
    notes: "Patient presenting with fever, cough, and congestion for 3 days."
  },
  {
    id: "mr4",
    patientId: "p4",
    patientName: "Michael Brown",
    doctorId: "d4",
    doctorName: "Dr. Emily Rodriguez",
    date: new Date(2023, 9, 10),
    diagnosis: "Eczema",
    prescription: ["Hydrocortisone cream 1%, apply twice daily", "Cetirizine 10mg daily for itching"],
    notes: "Flare-up on arms and neck. Advised to avoid fragranced products and hot showers."
  },
  {
    id: "mr5",
    patientId: "p1",
    patientName: "Jane Doe",
    doctorId: "d1",
    doctorName: "Dr. John Smith",
    date: new Date(2024, 1, 15),
    diagnosis: "Hypertension - Controlled",
    prescription: ["Continue Lisinopril 10mg once daily"],
    notes: "BP reading: 128/82. Patient reports improved energy with increased exercise.",
    followUpDate: new Date(2024, 4, 15)
  }
];

// Stats for dashboard
export const mockStats = {
  totalPatients: 150,
  totalDoctors: 8,
  appointmentsToday: 24,
  completedAppointments: 18,
  cancelledAppointments: 3,
  newPatientsThisMonth: 12,
  patientGrowthRate: 8.5,
  revenue: {
    thisMonth: 45600,
    lastMonth: 42300,
    growth: 7.8
  },
  appointments: {
    thisMonth: 345,
    lastMonth: 310,
    growth: 11.3
  },
  appointmentsByType: [
    { type: 'Check-up', count: 120 },
    { type: 'Follow-up', count: 95 },
    { type: 'Consultation', count: 75 },
    { type: 'Emergency', count: 35 },
    { type: 'Vaccination', count: 20 }
  ],
  appointmentsByDoctor: [
    { doctor: 'Dr. John Smith', count: 85 },
    { doctor: 'Dr. Sarah Johnson', count: 72 },
    { doctor: 'Dr. Michael Chen', count: 68 },
    { doctor: 'Dr. Emily Rodriguez', count: 50 },
    { doctor: 'Other Doctors', count: 70 }
  ]
};

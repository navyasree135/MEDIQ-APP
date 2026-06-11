export type UserRole = 'patient' | 'doctor' | 'admin';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type UrgencyLevel = 'urgent' | 'priority' | 'routine';

export interface AuthToken {
    access_token: string;
    token_type: string;
}

export interface AuthUser {
    id: number;
    email: string;
    role: UserRole;
    full_name: string | null;
}

export interface SignUpPayload {
    email: string;
    password: string;
    full_name: string;
    role: Exclude<UserRole, 'admin'>;
    specialty?: string;
    location?: string;
}

export interface PatientProfile {
    id: number;
    user_id: number;
    full_name: string;
    date_of_birth: string | null;
    phone: string | null;
    insurance_id: number | null;
    blood_group: string | null;
    gender: string | null;
    last_visit: string | null;
    conditions: string | null;
    allergies: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    created_at: string;
}

export interface PatientUpdate {
    full_name?: string;
    date_of_birth?: string | null;
    phone?: string | null;
    insurance_id?: number | null;
    blood_group?: string | null;
    gender?: string | null;
    last_visit?: string | null;
    conditions?: string | null;
    allergies?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
}

export interface PrescriptionMedicine {
    name: string;
    instruction: string;
    frequency: string;
    duration: string;
    activeTime: 'morning' | 'noon' | 'night';
    dosage: string;
    instructionText: string;
    remaining: string;
}

export interface Prescription {
    id: number;
    patient_id: number;
    doctor_name: string;
    specialty: string;
    hospital: string;
    date: string;
    image_url: string | null;
    medicines_json: string;
    created_at: string;
}

export interface LabTest {
    id: number;
    patient_id: number;
    test_name: string;
    lab_name: string;
    order_date: string;
    status: string;
    file_name?: string | null;
    created_at: string;
}

export interface DoctorProfile {
    id: number;
    full_name: string;
    specialty: string;
    location: string | null;
    clinic_address: string | null;
    clinic_lat: number | null;
    clinic_lng: number | null;
    created_at: string;
}

export interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    scheduled_at: string;
    status: AppointmentStatus;
    notes: string | null;
    doctor_name?: string | null;
    specialty?: string | null;
    location?: string | null;
    patient_name?: string | null;
    patient_phone?: string | null;
}

export interface BookAppointmentPayload {
    patient_id: number;
    doctor_id: number;
    scheduled_at: string;
    notes?: string;
}

export interface DoctorAvailability {
    doctor_id: number;
    doctor_name: string;
    specialty: string;
    location: string | null;
    clinic_address: string | null;
    clinic_lat: number | null;
    clinic_lng: number | null;
    slot: string;
    booked_slots: string[];
}

export interface TriageResult {
    urgency: UrgencyLevel;
    rationale: string;
}

export interface ChatMessageResponse {
    session_id: string;
    reply: string;
    triage?: TriageResult | null;
    offered_slot?: Record<string, unknown> | null;
    appointment?: Appointment | null;
}

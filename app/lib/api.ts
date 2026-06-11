import { Platform } from 'react-native';

import type {
    Appointment,
    AuthToken,
    AuthUser,
    BookAppointmentPayload,
    ChatMessageResponse,
    DoctorAvailability,
    DoctorProfile,
    PatientProfile,
    PatientUpdate,
    SignUpPayload,
    Prescription,
    LabTest,
} from '@/lib/types';

const explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

function defaultBaseUrl(): string {
    if (Platform.OS === 'android') {
        return 'http://10.219.44.55:8000';
    }
    return 'http://10.219.44.55:8000';
}

export const API_BASE_URL = (explicitBaseUrl && explicitBaseUrl.replace(/\/$/, '')) || defaultBaseUrl();

export class ApiError extends Error {
    status: number;
    payload: unknown;

    constructor(message: string, status: number, payload: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}

function parseErrorMessage(payload: unknown, fallback: string): string {
    if (payload && typeof payload === 'object' && 'detail' in payload) {
        const detail = (payload as { detail?: unknown }).detail;
        if (typeof detail === 'string') {
            return detail;
        }
        if (Array.isArray(detail)) {
            return detail
                .map((item) => {
                    if (!item || typeof item !== 'object') {
                        return '';
                    }
                    const msg = (item as { msg?: unknown }).msg;
                    return typeof msg === 'string' ? msg : '';
                })
                .filter(Boolean)
                .join(', ');
        }
    }
    return fallback;
}

async function parseResponse(response: Response): Promise<unknown> {
    const raw = await response.text();
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as unknown;
    } catch {
        return raw;
    }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(init.headers as Record<string, string> | undefined),
    };

    const hasContentType = Object.keys(headers).some((key) => key.toLowerCase() === 'content-type');
    if (init.body && !hasContentType) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
    });

    const payload = await parseResponse(response);
    if (!response.ok) {
        throw new ApiError(
            parseErrorMessage(payload, `Request failed with status ${response.status}`),
            response.status,
            payload,
        );
    }

    return payload as T;
}

export async function login(email: string, password: string): Promise<AuthToken> {
    const body = new URLSearchParams({
        username: email,
        password,
    });

    return request<AuthToken>(
        '/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        },
    );
}

export async function signup(payload: SignUpPayload): Promise<AuthUser> {
    return request<AuthUser>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function verify(token: string): Promise<AuthUser> {
    return request<AuthUser>('/auth/verify', { method: 'GET' }, token);
}

export async function fetchDoctors(token: string): Promise<DoctorProfile[]> {
    return request<DoctorProfile[]>('/doctors', { method: 'GET' }, token);
}

export async function fetchDoctorAvailability(token: string, specialty?: string): Promise<DoctorAvailability[]> {
    const params = specialty?.trim() ? `?specialty=${encodeURIComponent(specialty.trim())}` : '';
    return request<DoctorAvailability[]>(`/doctors/availability${params}`, { method: 'GET' }, token);
}

export async function fetchAppointments(token: string): Promise<Appointment[]> {
    return request<Appointment[]>('/appointments/my-schedule', { method: 'GET' }, token);
}

export async function bookAppointment(token: string, payload: BookAppointmentPayload): Promise<Appointment> {
    return request<Appointment>(
        '/appointments/book',
        {
            method: 'POST',
            body: JSON.stringify(payload),
        },
        token,
    );
}

export async function fetchPatientMe(token: string): Promise<PatientProfile> {
    return request<PatientProfile>('/patients/me', { method: 'GET' }, token);
}

export async function updatePatient(token: string, patientId: number, payload: Partial<PatientUpdate>): Promise<PatientProfile> {
    return request<PatientProfile>(`/patients/${patientId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    }, token);
}

export async function fetchDoctorMe(token: string): Promise<DoctorProfile> {
    return request<DoctorProfile>('/doctors/me', { method: 'GET' }, token);
}

export async function updateDoctorMe(
    token: string,
    payload: {
        full_name?: string;
        specialty?: string;
        location?: string | null;
        clinic_address?: string | null;
        clinic_lat?: number | null;
        clinic_lng?: number | null;
    }
): Promise<DoctorProfile> {
    return request<DoctorProfile>('/doctors/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
    }, token);
}

export async function fetchPatientById(token: string, patientId: number): Promise<PatientProfile> {
    return request<PatientProfile>(`/patients/${patientId}`, { method: 'GET' }, token);
}

export async function sendChatMessage(
    token: string,
    message: string,
    sessionId?: string,
): Promise<ChatMessageResponse> {
    return request<ChatMessageResponse>(
        '/chat/message',
        {
            method: 'POST',
            body: JSON.stringify({
                message,
                session_id: sessionId,
            }),
        },
        token,
    );
}

export async function sendCoordinatorMessage(
    token: string,
    message: string,
    sessionId?: string,
): Promise<ChatMessageResponse> {
    return request<ChatMessageResponse>(
        '/agents/coordinator',
        {
            method: 'POST',
            body: JSON.stringify({
                message,
                session_id: sessionId,
            }),
        },
        token,
    );
}

export async function analyzeSymptoms(
    token: string,
    symptoms: string,
): Promise<{ urgency: 'urgent' | 'priority' | 'routine'; rationale: string }> {
    return request<{ urgency: 'urgent' | 'priority' | 'routine'; rationale: string }>(
        '/triage/analyze',
        {
            method: 'POST',
            body: JSON.stringify({ symptoms }),
        },
        token,
    );
}

export async function fetchPrescriptions(token: string): Promise<Prescription[]> {
    return request<Prescription[]>('/prescriptions', { method: 'GET' }, token);
}

export async function createPrescription(token: string, payload: Omit<Prescription, 'id' | 'patient_id' | 'created_at'>): Promise<Prescription> {
    return request<Prescription>('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(payload),
    }, token);
}

export async function fetchLabTests(token: string): Promise<LabTest[]> {
    return request<LabTest[]>('/lab_tests', { method: 'GET' }, token);
}

export async function createLabTest(token: string, payload: Omit<LabTest, 'id' | 'patient_id' | 'created_at'>): Promise<LabTest> {
    return request<LabTest>('/lab_tests', {
        method: 'POST',
        body: JSON.stringify(payload),
    }, token);
}

export async function updateAppointmentStatus(token: string, appointmentId: number, statusVal: string): Promise<Appointment> {
    return request<Appointment>(`/appointments/${appointmentId}/status?status_val=${encodeURIComponent(statusVal)}`, {
        method: 'PATCH'
    }, token);
}

export async function fetchPatientPrescriptions(token: string, patientId: number): Promise<Prescription[]> {
    return request<Prescription[]>(`/prescriptions/patient/${patientId}`, { method: 'GET' }, token);
}

export async function fetchPatientLabTests(token: string, patientId: number): Promise<LabTest[]> {
    return request<LabTest[]>(`/lab_tests/patient/${patientId}`, { method: 'GET' }, token);
}


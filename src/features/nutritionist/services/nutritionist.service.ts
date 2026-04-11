import { apiClient } from '../../../core/api/apiClient';

export interface Nutritionist {
    _id: string;
    name: string;
    lastName: string;
    secondLastName?: string;
    email?: string;
    city?: string;
    street?: string;
    neighborhood?: string;
    streetNumber?: string;
    licenseNumber?: string;
    specialization?: string;
    photo?: string;
}

export interface Appointment {
    _id: string;
    patient_id: string;
    nutritionist_id: string;
    appointment_date: string;
    appointment_time: string;
    type: 'virtual' | 'in-person';
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
}

export const nutritionistService = {
    getById: async (nutritionistId: string) => {
        const response = await apiClient.get(`/nutritionist/${nutritionistId}`);
        return response.data as Nutritionist;
    },

    getAppointmentsByPatientId: async (patientId: string) => {
        const response = await apiClient.get(`/appointments/${patientId}`);
        return response.data as Appointment[];
    }
};


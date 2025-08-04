import axios from 'axios';
import { DateTime } from 'luxon';

// 1) Crea un helper para recorrer objetos y convertir los campos "date"
function normalizeDates(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(normalizeDates);
    } else if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (key === 'date' && typeof val === 'string') {
            // Convierte ISOZ → zona Tijuana, y lo pone a medianoche local
            obj[key] = DateTime.fromISO(val, { zone: 'America/Tijuana' })
                            .startOf('day')
                            .toJSDate();
        } else if (typeof val === 'object') {
            normalizeDates(val);
        }
        }
    }
    return obj;``
}

// 2) Registra un interceptor global
axios.interceptors.response.use(response => {
    if (response.data) {
        response.data = normalizeDates(response.data);
    }
    return response;
}, error => Promise.reject(error));

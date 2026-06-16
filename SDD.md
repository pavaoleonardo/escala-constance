# System Specification: Escala Varejo (Tailored Configuration)

## 1. Intent & Overview
**Escala Varejo** is a multi-store staff scheduling and workforce management application designed for multi-unit retail franchise owners in Brazil. This specific operational profile is configured for the workflow constraints of *self-shoes* retail models (such as Constance Bolsas e Sapatos), automating shift patterns across 3 distinct mall-based locations, tracking mandatory Sunday rotations, and preventing CLT labor code violations.

*   **Application Name:** Escala Varejo
*   **Target Audience:** Franchise Owners (Admin), Store Managers.
*   **Target UI Language:** Portuguese (Pt-BR).
*   **Specification Language:** English.

---

## 2. Branding & White-Label Structure
To protect intellectual property and support potential future multi-tenant commercialization, the application is designed to be white-labeled:
*   **Generic Base Name**: The core application branding is **Escala Varejo**.
*   **Dynamic Franchise Branding**: Inside the dashboard header, managers can configure a custom franchise name (e.g., "Constance") by clicking an edit (✏️) icon next to the subtitle.
*   **Persistent Customization**:
    *   The configured franchise name is saved under `escala_varejo_franchise_name` in LocalStorage.
    *   The dashboard header logo dynamically displays the first letter of the franchise name (defaulting to "C" for Constance, "V" if empty).
    *   WhatsApp scale export texts dynamically format their titles as `🗓️ ESCALA [NOME DA FRANQUIA] - [NOME DA LOJA]`.

---

## 3. Data Storage & Schema
The application supports both a local demo mode (persisting in browser storage) and Supabase Cloud storage:
*   **Database Tables (Supabase)**:
    *   `lojas`: Stores location metadata (operating hours, name).
    *   `funcionarios`: Stores worker rosters, roles (Supervisora/Vendedora), active status, weekly hours, and home stores.
    *   `turnos`: Records individual daily shifts, break durations, and overtime flags.
*   **Local Storage Keys**:
    *   `varejo_stores`: List of stores.
    *   `varejo_employees`: Employee roster.
    *   `varejo_shifts`: Assigned shifts.
    *   `varejo_data_version`: Active schema/data version.
*   **Data Migration**:
    *   On startup, the system automatically checks if old legacy `constance_*` LocalStorage keys exist. If present, it seamlessly migrates the user's data to the generic `varejo_*` namespace to prevent data loss.

---

## 4. Labor Compliance & Validation Rules
The system calculates all variables for the Brazilian Labor Code (CLT) in real time:
*   **Maximum Weekly Hours**: Regular schedule must not exceed **44 hours/week** per employee.
*   **Daily Shift Limit**: Employees work **6-hour daily shifts** by default. A maximum of **2 hours of overtime** (10 hours total) is permitted only if the *Permitir Hora Extra* option is checked.
*   **Intra-jornada Breaks**:
    *   Expedients > 6h require a minimum of **60 minutes** break duration.
    *   Expedients between 4h and 6h require a minimum of **15 minutes** break duration.
*   **Interjornada Rest**: There must be at least **11 consecutive hours of rest** between the end of one shift and the start of the next.
*   **Sunday Rotations**:
    *   Each employee is entitled to at least **1 Sunday off per month**.
    *   Sunday shifts are single-expedient (**12:00 to 20:00** with a mandatory 60m break).
    *   A minimum of 2-3 employees must be scheduled on Sundays.
    *   Weekly rest day (DSR) must be scheduled from Monday to Wednesday for any employee working the previous Sunday.

---

## 5. Integrations & User Manual
*   **Direct WhatsApp Share**: The system generates a formatted WhatsApp text schedule and provides a direct **"Enviar no WhatsApp"** button. This leverages the WhatsApp Web/Desktop URL scheme (`api.whatsapp.com/send?text=`) to instantly send schedules to the store group channel.
*   **Headless PDF Generator**: Located at `/Manual_Usuario.html`, the static user manual uses `html2pdf.js` to compile the instructions into a clean, 2-page PDF file saved directly to the user's computer.

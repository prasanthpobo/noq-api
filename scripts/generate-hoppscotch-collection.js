const fs = require('fs');
const path = require('path');

// ─── Helpers ────────────────────────────────────────────────────────────────

const body = (obj) => ({
  contentType: 'application/json',
  body: JSON.stringify(obj, null, 2),
});

const noBody = { contentType: null, body: null };

const authBearer = {
  authType: 'bearer',
  authActive: true,
  token: '<<accessToken>>',
};

const noAuth = { authType: 'none', authActive: false };

const baseHeaders = [
  { key: 'Content-Type', value: 'application/json', active: true },
  { key: 'x-clinic-id',  value: '<<clinicId>>',     active: true },
];

const req = ({ name, method, endpoint, headers = baseHeaders, auth = authBearer, bodyContent = noBody, params = [], preRequestScript = '', testScript = '' }) => ({
  v: '1',
  name,
  method,
  endpoint,
  params,
  headers,
  preRequestScript,
  testScript,
  body: bodyContent,
  auth,
});

const BASE = '<<baseUrl>>';

// ─── Folders ────────────────────────────────────────────────────────────────

const authFolder = {
  v: 2,
  name: '🔐 Auth',
  folders: [],
  requests: [
    req({
      name: 'Login',
      method: 'POST',
      endpoint: `${BASE}/auth/login`,
      auth: noAuth,
      headers: [
        { key: 'Content-Type', value: 'application/json', active: true },
        { key: 'x-clinic-id',  value: '<<clinicId>>',     active: true },
      ],
      bodyContent: body({
        identifier: 'admin@cityhealth.com',
        password: 'Admin@123',
      }),
    }),
    req({
      name: 'Register User',
      method: 'POST',
      endpoint: `${BASE}/auth/register`,
      auth: noAuth,
      headers: [
        { key: 'Content-Type', value: 'application/json', active: true },
        { key: 'x-clinic-id',  value: '<<clinicId>>',     active: true },
      ],
      bodyContent: body({
        name: 'Dr. Priya',
        email: 'priya@clinic.com',
        mobile: '9876543211',
        password: 'secret123',
        role: 'doctor',
      }),
    }),
    req({
      name: 'Refresh Token',
      method: 'POST',
      endpoint: `${BASE}/auth/refresh`,
      auth: noAuth,
      headers: [{ key: 'Content-Type', value: 'application/json', active: true }],
      bodyContent: body({ refreshToken: '<<refreshToken>>' }),
    }),
    req({
      name: 'Get Me',
      method: 'GET',
      endpoint: `${BASE}/auth/me`,
      bodyContent: noBody,
    }),
    req({
      name: 'Change Password',
      method: 'PUT',
      endpoint: `${BASE}/auth/change-password`,
      bodyContent: body({ currentPassword: 'Admin@123', newPassword: 'NewPass@456' }),
    }),
    req({
      name: 'Logout',
      method: 'POST',
      endpoint: `${BASE}/auth/logout`,
      bodyContent: noBody,
    }),
  ],
};

const clinicFolder = {
  v: 2,
  name: '🏥 Clinic',
  folders: [],
  requests: [
    req({
      name: 'Create Clinic',
      method: 'POST',
      endpoint: `${BASE}/clinic`,
      auth: noAuth,
      headers: [{ key: 'Content-Type', value: 'application/json', active: true }],
      bodyContent: body({
        name: 'City Health Clinic',
        subdomain: 'cityhealth',
        phone: '04422334455',
        email: 'info@cityhealth.com',
        address: {
          street: '12 Anna Salai',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600002',
        },
        settings: {
          tokenResetTime: '00:00',
          workingHours: { start: '09:00', end: '18:00' },
          appointmentDuration: 15,
        },
        adminName: 'Admin User',
        adminEmail: 'admin@cityhealth.com',
        adminMobile: '9000000001',
        adminPassword: 'Admin@123',
      }),
    }),
    req({
      name: 'Get Current Clinic',
      method: 'GET',
      endpoint: `${BASE}/clinic/current`,
      bodyContent: noBody,
    }),
    req({
      name: 'Update Clinic',
      method: 'PUT',
      endpoint: `${BASE}/clinic/current`,
      bodyContent: body({
        name: 'City Health Clinic Updated',
        settings: { appointmentDuration: 20 },
      }),
    }),
  ],
};

const doctorFolder = {
  v: 2,
  name: '👨‍⚕️ Doctor',
  folders: [],
  requests: [
    req({
      name: 'Add Doctor',
      method: 'POST',
      endpoint: `${BASE}/doctor`,
      bodyContent: body({
        name: 'Dr. Arun Kumar',
        mobile: '9876543210',
        email: 'arun@clinic.com',
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        registrationNumber: 'TN12345',
        experience: 8,
        consultationFee: 300,
        availability: [
          {
            day: 'monday',
            isAvailable: true,
            slots: [
              { start: '09:00', end: '13:00', maxTokens: 20 },
              { start: '17:00', end: '20:00', maxTokens: 15 },
            ],
          },
          { day: 'tuesday',  isAvailable: true,  slots: [{ start: '09:00', end: '13:00', maxTokens: 20 }] },
          { day: 'wednesday',isAvailable: true,  slots: [{ start: '09:00', end: '13:00', maxTokens: 20 }] },
          { day: 'thursday', isAvailable: true,  slots: [{ start: '09:00', end: '13:00', maxTokens: 20 }] },
          { day: 'friday',   isAvailable: true,  slots: [{ start: '09:00', end: '13:00', maxTokens: 20 }] },
          { day: 'saturday', isAvailable: true,  slots: [{ start: '09:00', end: '12:00', maxTokens: 10 }] },
          { day: 'sunday',   isAvailable: false, slots: [] },
        ],
      }),
    }),
    req({
      name: 'List Doctors',
      method: 'GET',
      endpoint: `${BASE}/doctor`,
      params: [
        { key: 'page',  value: '1',  active: true },
        { key: 'limit', value: '20', active: true },
      ],
      bodyContent: noBody,
    }),
    req({
      name: 'Get Doctor by ID',
      method: 'GET',
      endpoint: `${BASE}/doctor/<<doctorId>>`,
      bodyContent: noBody,
    }),
    req({
      name: 'Update Doctor',
      method: 'PUT',
      endpoint: `${BASE}/doctor/<<doctorId>>`,
      bodyContent: body({ consultationFee: 400, experience: 9 }),
    }),
    req({
      name: 'Update Availability',
      method: 'PUT',
      endpoint: `${BASE}/doctor/<<doctorId>>/availability`,
      bodyContent: body({
        availability: [
          { day: 'monday', isAvailable: true, slots: [{ start: '09:00', end: '13:00', maxTokens: 20 }] },
          { day: 'saturday', isAvailable: false, slots: [] },
        ],
      }),
    }),
    req({
      name: 'Deactivate Doctor',
      method: 'DELETE',
      endpoint: `${BASE}/doctor/<<doctorId>>`,
      bodyContent: noBody,
    }),
  ],
};

const patientFolder = {
  v: 2,
  name: '🧑‍🤝‍🧑 Patient',
  folders: [],
  requests: [
    req({
      name: 'Register Patient',
      method: 'POST',
      endpoint: `${BASE}/patient`,
      bodyContent: body({
        name: 'Ravi Kumar',
        mobile: '9123456789',
        email: 'ravi@example.com',
        age: 35,
        gender: 'male',
        dob: '1989-04-15',
        bloodGroup: 'O+',
        address: {
          street: '5 MG Road',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
        },
        allergies: ['Penicillin', 'Aspirin'],
        chronicConditions: ['Diabetes Type 2'],
        emergencyContact: {
          name: 'Priya Kumar',
          mobile: '9000000001',
          relation: 'Wife',
        },
      }),
    }),
    req({
      name: 'Search Patients',
      method: 'GET',
      endpoint: `${BASE}/patient`,
      params: [
        { key: 'q',     value: 'ravi', active: true },
        { key: 'page',  value: '1',    active: true },
        { key: 'limit', value: '20',   active: true },
      ],
      bodyContent: noBody,
    }),
    req({
      name: 'Search by Mobile',
      method: 'GET',
      endpoint: `${BASE}/patient/search/9123456789`,
      bodyContent: noBody,
    }),
    req({
      name: 'Get Patient by ID',
      method: 'GET',
      endpoint: `${BASE}/patient/<<patientId>>`,
      bodyContent: noBody,
    }),
    req({
      name: 'Update Patient',
      method: 'PUT',
      endpoint: `${BASE}/patient/<<patientId>>`,
      bodyContent: body({ age: 36, allergies: ['Penicillin'] }),
    }),
    req({
      name: 'Patient Visit History',
      method: 'GET',
      endpoint: `${BASE}/patient/<<patientId>>/history`,
      bodyContent: noBody,
    }),
  ],
};

const tokenFolder = {
  v: 2,
  name: '🎫 Token / Queue',
  folders: [],
  requests: [
    req({
      name: 'Generate Token',
      method: 'POST',
      endpoint: `${BASE}/token/generate`,
      bodyContent: body({
        doctorId: '<<doctorId>>',
        patientId: '<<patientId>>',
        priority: 'normal',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      }),
    }),
    req({
      name: 'Get Live Queue',
      method: 'GET',
      endpoint: `${BASE}/token/queue/<<doctorId>>`,
      params: [{ key: 'date', value: new Date().toISOString().split('T')[0], active: true }],
      bodyContent: noBody,
    }),
    req({
      name: 'List Tokens (by date)',
      method: 'GET',
      endpoint: `${BASE}/token`,
      params: [
        { key: 'date',  value: new Date().toISOString().split('T')[0], active: true },
        { key: 'page',  value: '1',  active: true },
        { key: 'limit', value: '50', active: true },
      ],
      bodyContent: noBody,
    }),
    req({
      name: 'Get Token by ID',
      method: 'GET',
      endpoint: `${BASE}/token/<<tokenId>>`,
      bodyContent: noBody,
    }),
    req({
      name: 'Call Patient (→ in_progress)',
      method: 'PUT',
      endpoint: `${BASE}/token/status/<<tokenId>>`,
      bodyContent: body({ status: 'in_progress' }),
    }),
    req({
      name: 'Complete Token',
      method: 'PUT',
      endpoint: `${BASE}/token/status/<<tokenId>>`,
      bodyContent: body({ status: 'completed' }),
    }),
    req({
      name: 'Cancel Token',
      method: 'PUT',
      endpoint: `${BASE}/token/status/<<tokenId>>`,
      bodyContent: body({ status: 'cancelled', cancelReason: 'Patient left the queue' }),
    }),
  ],
};

const appointmentFolder = {
  v: 2,
  name: '📅 Appointment',
  folders: [],
  requests: [
    req({
      name: 'Book Appointment',
      method: 'POST',
      endpoint: `${BASE}/appointment`,
      bodyContent: body({
        doctorId: '<<doctorId>>',
        patientId: '<<patientId>>',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '10:30',
        type: 'new',
        reason: 'Fever and cold for 3 days',
        notes: 'Morning slot preferred',
      }),
    }),
    req({
      name: 'List Appointments',
      method: 'GET',
      endpoint: `${BASE}/appointment`,
      params: [
        { key: 'date',  value: new Date().toISOString().split('T')[0], active: true },
        { key: 'page',  value: '1',  active: true },
        { key: 'limit', value: '20', active: true },
      ],
      bodyContent: noBody,
    }),
    req({
      name: 'Get Appointment by ID',
      method: 'GET',
      endpoint: `${BASE}/appointment/<<appointmentId>>`,
      bodyContent: noBody,
    }),
    req({
      name: 'Confirm Appointment',
      method: 'PUT',
      endpoint: `${BASE}/appointment/<<appointmentId>>`,
      bodyContent: body({ status: 'confirmed' }),
    }),
    req({
      name: 'Cancel Appointment',
      method: 'PUT',
      endpoint: `${BASE}/appointment/<<appointmentId>>`,
      bodyContent: body({ status: 'cancelled', cancelReason: 'Doctor unavailable' }),
    }),
    req({
      name: 'Convert Appointment → Token',
      method: 'POST',
      endpoint: `${BASE}/appointment/<<appointmentId>>/convert-to-token`,
      bodyContent: noBody,
    }),
  ],
};

const consultationFolder = {
  v: 2,
  name: '📋 Consultation / Rx',
  folders: [],
  requests: [
    req({
      name: 'Create Consultation',
      method: 'POST',
      endpoint: `${BASE}/consultation`,
      bodyContent: body({
        tokenId: '<<tokenId>>',
        chiefComplaint: 'Fever, headache for 2 days',
        symptoms: ['fever', 'headache', 'body ache'],
        diagnosis: 'Viral fever',
        differentialDiagnosis: ['Dengue', 'Malaria'],
        vitals: {
          bp: '120/80',
          pulse: 88,
          temperature: 101.2,
          weight: 68,
          height: 170,
          spo2: 98,
          rbs: 110,
        },
        medicines: [
          {
            name: 'Paracetamol 500mg',
            dosage: '500mg',
            frequency: 'TDS',
            duration: '5 days',
            instructions: 'After food',
            quantity: 15,
          },
          {
            name: 'Cetirizine 10mg',
            dosage: '10mg',
            frequency: 'OD',
            duration: '3 days',
            instructions: 'At night',
            quantity: 3,
          },
        ],
        investigations: ['CBC', 'Dengue NS1'],
        notes: 'Plenty of fluids, rest',
        advice: 'Avoid cold water. Return if fever persists beyond 3 days.',
        followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        followUpNotes: 'Review CBC report',
      }),
    }),
    req({
      name: 'Get Consultation by Token',
      method: 'GET',
      endpoint: `${BASE}/consultation/token/<<tokenId>>`,
      bodyContent: noBody,
    }),
    req({
      name: 'Patient Consultation History',
      method: 'GET',
      endpoint: `${BASE}/consultation/patient/<<patientId>>`,
      params: [
        { key: 'page',  value: '1',  active: true },
        { key: 'limit', value: '10', active: true },
      ],
      bodyContent: noBody,
    }),
    req({
      name: 'Update Consultation',
      method: 'PUT',
      endpoint: `${BASE}/consultation/<<consultationId>>`,
      bodyContent: body({
        diagnosis: 'Dengue fever',
        medicines: [
          { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'TDS', duration: '5 days' },
        ],
      }),
    }),
    req({
      name: 'Sign Consultation (Complete)',
      method: 'PUT',
      endpoint: `${BASE}/consultation/<<consultationId>>/sign`,
      bodyContent: noBody,
    }),
  ],
};

const dashboardFolder = {
  v: 2,
  name: '📊 Dashboard',
  folders: [],
  requests: [
    req({
      name: "Today's Summary",
      method: 'GET',
      endpoint: `${BASE}/dashboard/summary`,
      bodyContent: noBody,
    }),
    req({
      name: 'Waiting Patients',
      method: 'GET',
      endpoint: `${BASE}/dashboard/waiting`,
      params: [{ key: 'doctorId', value: '<<doctorId>>', active: false }],
      bodyContent: noBody,
    }),
    req({
      name: 'Doctor Queue Stats',
      method: 'GET',
      endpoint: `${BASE}/dashboard/doctor-stats`,
      bodyContent: noBody,
    }),
    req({
      name: 'Recent Consultations',
      method: 'GET',
      endpoint: `${BASE}/dashboard/recent-consultations`,
      params: [{ key: 'limit', value: '10', active: true }],
      bodyContent: noBody,
    }),
  ],
};

// ─── Root collection ─────────────────────────────────────────────────────────

const collection = [
  {
    v: 2,
    name: 'NoQ Clinic API',
    folders: [
      authFolder,
      clinicFolder,
      doctorFolder,
      patientFolder,
      tokenFolder,
      appointmentFolder,
      consultationFolder,
      dashboardFolder,
    ],
    requests: [],
  },
];

// ─── Write ────────────────────────────────────────────────────────────────────

const outPath = path.join(__dirname, '..', 'NoQ_Hoppscotch_Collection.json');
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
console.log(`✅  Generated: ${outPath}  (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log('');
console.log('Import steps:');
console.log('  1. Open https://hoppscotch.io');
console.log('  2. Click Collections → Import / Export → Import from JSON');
console.log('  3. Select NoQ_Hoppscotch_Collection.json');
console.log('');
console.log('Environment variables to set in Hoppscotch:');
console.log('  baseUrl     = http://localhost:5000/api');
console.log('  clinicId    = (your clinic ObjectId)');
console.log('  accessToken = (from login response)');
console.log('  refreshToken= (from login response)');
console.log('  doctorId    = (from create doctor response)');
console.log('  patientId   = (from register patient response)');
console.log('  tokenId     = (from generate token response)');
console.log('  appointmentId = (from book appointment response)');
console.log('  consultationId= (from create consultation response)');

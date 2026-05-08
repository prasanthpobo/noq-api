const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  convertInchesToTwip,
  PageBreak,
  HorizontalPositionAlign,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Colour palette ────────────────────────────────────────────────────────
const BRAND_BLUE   = '1E3A8A';
const LIGHT_BLUE   = 'DBEAFE';
const CODE_BG      = 'F1F5F9';
const GREY_BORDER  = 'CBD5E1';
const WHITE        = 'FFFFFF';
const GREEN        = '166534';
const GREEN_BG     = 'DCFCE7';
const ORANGE       = '9A3412';
const ORANGE_BG    = 'FFEDD5';
const PURPLE       = '5B21B6';
const PURPLE_BG    = 'EDE9FE';
const DARK_TEXT    = '1E293B';
const MED_TEXT     = '475569';

// ─── Helpers ────────────────────────────────────────────────────────────────
const noBorder = {
  top:    { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right:  { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const thinBorder = (color = GREY_BORDER) => ({
  top:    { style: BorderStyle.SINGLE, size: 4, color },
  bottom: { style: BorderStyle.SINGLE, size: 4, color },
  left:   { style: BorderStyle.SINGLE, size: 4, color },
  right:  { style: BorderStyle.SINGLE, size: 4, color },
});

const heading1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 36, color: BRAND_BLUE, font: 'Calibri' })],
  });

const heading2 = (text) =>
  new Paragraph({
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_BLUE } },
    children: [new TextRun({ text, bold: true, size: 28, color: BRAND_BLUE, font: 'Calibri' })],
  });

const heading3 = (text) =>
  new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: DARK_TEXT, font: 'Calibri' })],
  });

const para = (text, opts = {}) =>
  new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Calibri', ...opts })],
  });

const bullet = (text) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Calibri' })],
  });

const spacer = (lines = 1) =>
  new Paragraph({ spacing: { before: 0, after: lines * 120 }, children: [] });

const methodBadge = (method) => {
  const colors = {
    POST:   { bg: GREEN_BG,   fg: GREEN },
    GET:    { bg: LIGHT_BLUE, fg: BRAND_BLUE },
    PUT:    { bg: ORANGE_BG,  fg: ORANGE },
    DELETE: { bg: 'FEE2E2',   fg: '991B1B' },
  };
  const c = colors[method] || { bg: CODE_BG, fg: DARK_TEXT };
  return new TextRun({
    text: ` ${method} `,
    bold: true,
    size: 20,
    color: c.fg,
    shading: { type: ShadingType.SOLID, color: c.bg },
    font: 'Courier New',
  });
};

const endpointRow = (method, path, description, auth = '') => {
  const authText = auth ? ` 🔒${auth}` : '';
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 12, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: CODE_BG },
        borders: thinBorder(),
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [methodBadge(method)] })],
      }),
      new TableCell({
        width: { size: 34, type: WidthType.PERCENTAGE },
        borders: thinBorder(),
        shading: { type: ShadingType.SOLID, color: CODE_BG },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text: path + authText, font: 'Courier New', size: 20, color: BRAND_BLUE })]
        })],
      }),
      new TableCell({
        width: { size: 54, type: WidthType.PERCENTAGE },
        borders: thinBorder(),
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: description, size: 20, color: MED_TEXT, font: 'Calibri' })] })],
      }),
    ],
  });
};

const tableHeader = (cols) =>
  new TableRow({
    tableHeader: true,
    children: cols.map(({ text, pct }) =>
      new TableCell({
        width: { size: pct, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: BRAND_BLUE },
        borders: thinBorder(BRAND_BLUE),
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text, bold: true, color: WHITE, size: 22, font: 'Calibri' })]
        })],
      })
    ),
  });

const codeBlock = (lines) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorder(GREY_BORDER),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: CODE_BG },
            borders: noBorder,
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: lines.map((line) =>
              new Paragraph({
                spacing: { before: 0, after: 40 },
                children: [
                  new TextRun({
                    text: line,
                    font: 'Courier New',
                    size: 18,
                    color: line.startsWith('//') ? '64748B' : DARK_TEXT,
                  }),
                ],
              })
            ),
          }),
        ],
      }),
    ],
  });

const labelValue = (label, value) =>
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, color: BRAND_BLUE, font: 'Calibri' }),
      new TextRun({ text: value, size: 22, color: DARK_TEXT, font: 'Calibri' }),
    ],
  });

// ─── Document sections ──────────────────────────────────────────────────────

const coverPage = () => [
  spacer(4),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: [new TextRun({ text: 'NoQ Clinic API', bold: true, size: 64, color: BRAND_BLUE, font: 'Calibri' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [new TextRun({ text: 'Backend REST API Documentation', size: 32, color: MED_TEXT, font: 'Calibri' })],
  }),
  new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      ...[
        ['Version',   'v1.0.0'],
        ['Base URL',  'http://localhost:5000/api'],
        ['Auth',      'JWT Bearer Token'],
        ['Format',    'JSON'],
        ['Date',      new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
      ].map(([k, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: noBorder,
              margins: { top: 80, bottom: 80, left: 0, right: 0 },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: k, bold: true, size: 22, color: MED_TEXT, font: 'Calibri' })] })],
            }),
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              borders: noBorder,
              children: [new Paragraph({ children: [new TextRun({ text: ' : ', size: 22, color: MED_TEXT })] })],
            }),
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: noBorder,
              margins: { top: 80, bottom: 80, left: 0, right: 0 },
              children: [new Paragraph({ children: [new TextRun({ text: v, size: 22, color: DARK_TEXT, font: 'Courier New' })] })],
            }),
          ],
        })
      ),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

const overviewSection = () => [
  heading1('1. Overview'),
  para('NoQ is a multi-tenant clinic token booking and management system. Each clinic is isolated by a tenantId (clinicId). All API paths are prefixed with /api.'),
  spacer(),

  heading2('Base URL'),
  codeBlock(['http://localhost:5000/api']),
  spacer(),

  heading2('Multi-Tenancy'),
  para('Every request to a protected route must include the tenant header:'),
  codeBlock([
    'x-clinic-id: <MongoDB ObjectId of the clinic>',
    '// OR',
    'x-subdomain: cityhealth',
  ]),
  spacer(),

  heading2('Authentication Header'),
  codeBlock(['Authorization: Bearer <accessToken>']),
  spacer(),

  heading2('Standard Response Envelope'),
  codeBlock([
    '// Success',
    '{',
    '  "success": true,',
    '  "message": "...",',
    '  "data": { ... }',
    '}',
    '',
    '// Paginated',
    '{',
    '  "success": true,',
    '  "data": [ ... ],',
    '  "pagination": { "total": 42, "page": 1, "limit": 20, "pages": 3 }',
    '}',
    '',
    '// Error',
    '{',
    '  "success": false,',
    '  "message": "Descriptive error message"',
    '}',
  ]),
  spacer(),

  heading2('HTTP Status Codes'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorder(),
    rows: [
      tableHeader([{ text: 'Code', pct: 15 }, { text: 'Meaning', pct: 85 }]),
      ...([
        ['200', 'OK — successful read/update'],
        ['201', 'Created — resource successfully created'],
        ['400', 'Bad Request — validation failure'],
        ['401', 'Unauthorized — missing or invalid JWT'],
        ['403', 'Forbidden — insufficient role'],
        ['404', 'Not Found — resource does not exist'],
        ['409', 'Conflict — duplicate record'],
        ['429', 'Too Many Requests — rate limit exceeded'],
        ['500', 'Internal Server Error'],
      ].map(([code, meaning]) =>
        new TableRow({
          children: [
            new TableCell({
              borders: thinBorder(),
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: code, font: 'Courier New', size: 20, bold: true, color: BRAND_BLUE })] })],
            }),
            new TableCell({
              borders: thinBorder(),
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [para(meaning)],
            }),
          ],
        })
      )),
    ],
  }),
  spacer(),

  heading2('Role Permissions'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorder(),
    rows: [
      tableHeader([{ text: 'Role', pct: 20 }, { text: 'Permissions', pct: 80 }]),
      ...([
        ['admin',  'Full access — create/edit doctors, manage clinic settings, all reports'],
        ['doctor', 'Own queue, create/sign consultations, update own availability'],
        ['staff',  'Generate tokens, manage appointments, register patients'],
      ].map(([role, perm]) =>
        new TableRow({
          children: [
            new TableCell({ borders: thinBorder(), margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: role, bold: true, size: 20, font: 'Courier New', color: BRAND_BLUE })] })] }),
            new TableCell({ borders: thinBorder(), margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [para(perm)] }),
          ],
        })
      )),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

const endpointTableSection = () => [
  heading1('2. Endpoint Index'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorder(),
    rows: [
      tableHeader([{ text: 'Method', pct: 12 }, { text: 'Endpoint', pct: 34 }, { text: 'Description', pct: 54 }]),
      // Auth
      endpointRow('POST',   '/auth/login',                         'Login with email or mobile'),
      endpointRow('POST',   '/auth/register',                      'Register a new user'),
      endpointRow('POST',   '/auth/refresh',                       'Refresh access token'),
      endpointRow('GET',    '/auth/me',                            'Get current user profile', ''),
      endpointRow('PUT',    '/auth/change-password',               'Change password', ''),
      endpointRow('POST',   '/auth/logout',                        'Logout and revoke token', ''),
      // Clinic
      endpointRow('POST',   '/clinic',                             'Create a new clinic (onboarding)'),
      endpointRow('GET',    '/clinic/current',                     'Get current clinic details', ''),
      endpointRow('PUT',    '/clinic/current',                     'Update clinic settings', ' admin'),
      // Doctor
      endpointRow('POST',   '/doctor',                             'Add a doctor', ' admin'),
      endpointRow('GET',    '/doctor',                             'List doctors', ''),
      endpointRow('GET',    '/doctor/:id',                         'Get doctor by ID', ''),
      endpointRow('PUT',    '/doctor/:id',                         'Update doctor', ' admin'),
      endpointRow('DELETE', '/doctor/:id',                         'Deactivate doctor', ' admin'),
      endpointRow('PUT',    '/doctor/:id/availability',            'Update doctor schedule', ' admin|doctor'),
      // Patient
      endpointRow('POST',   '/patient',                            'Register patient', ''),
      endpointRow('GET',    '/patient',                            'Search / list patients', ''),
      endpointRow('GET',    '/patient/search/:mobile',             'Find patient by mobile', ''),
      endpointRow('GET',    '/patient/:id',                        'Get patient by ID', ''),
      endpointRow('PUT',    '/patient/:id',                        'Update patient', ''),
      endpointRow('GET',    '/patient/:id/history',                'Full visit history', ''),
      // Token
      endpointRow('POST',   '/token/generate',                     'Generate queue token', ''),
      endpointRow('GET',    '/token',                              'List tokens (filterable)', ''),
      endpointRow('GET',    '/token/queue/:doctorId',              'Get live queue for doctor', ''),
      endpointRow('GET',    '/token/:id',                          'Get token by ID', ''),
      endpointRow('PUT',    '/token/status/:id',                   'Update token status', ''),
      // Appointment
      endpointRow('POST',   '/appointment',                        'Book appointment', ''),
      endpointRow('GET',    '/appointment',                        'List appointments', ''),
      endpointRow('GET',    '/appointment/:id',                    'Get appointment by ID', ''),
      endpointRow('PUT',    '/appointment/:id',                    'Update appointment', ''),
      endpointRow('POST',   '/appointment/:id/convert-to-token',   'Convert appointment → token', ''),
      // Consultation
      endpointRow('POST',   '/consultation',                       'Create consultation / Rx', ''),
      endpointRow('GET',    '/consultation/token/:tokenId',        'Get consultation by token', ''),
      endpointRow('GET',    '/consultation/patient/:patientId',    'Patient consultation history', ''),
      endpointRow('PUT',    '/consultation/:id',                   'Update consultation', ''),
      endpointRow('PUT',    '/consultation/:id/sign',              'Sign & complete consultation', ' doctor|admin'),
      // Dashboard
      endpointRow('GET',    '/dashboard/summary',                  "Today's token & patient stats", ''),
      endpointRow('GET',    '/dashboard/waiting',                  'Current waiting patients', ''),
      endpointRow('GET',    '/dashboard/doctor-stats',             'Per-doctor queue stats', ''),
      endpointRow('GET',    '/dashboard/recent-consultations',     'Recent consultations feed', ''),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── Per-section detail builders ────────────────────────────────────────────

const sectionAuth = () => [
  heading1('3. Auth Endpoints'),

  heading2('POST /auth/login'),
  labelValue('Auth', 'Public'),
  labelValue('Rate limit', '20 requests / 15 minutes'),
  spacer(0.5),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "identifier": "doctor@clinic.com",  // email OR mobile number',
    '  "password":   "secret123",',
    '  "clinicId":   "64f1a2b3c4d5e6f7a8b9c0d1"  // optional if header is set',
    '}',
  ]),
  heading3('Response 200'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "message": "Login successful",',
    '  "data": {',
    '    "accessToken":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",',
    '    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",',
    '    "user": {',
    '      "_id":      "64f1...",',
    '      "name":     "Dr. Ramesh",',
    '      "email":    "doctor@clinic.com",',
    '      "mobile":   "9876543210",',
    '      "role":     "doctor",',
    '      "clinicId": "64f1a2b3..."',
    '    },',
    '    "clinic": {',
    '      "_id":       "64f1a2b3...",',
    '      "name":      "City Health Clinic",',
    '      "subdomain": "cityhealth"',
    '    }',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('POST /auth/register'),
  labelValue('Auth', 'Public (requires x-clinic-id header)'),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "name":     "Dr. Priya",',
    '  "email":    "priya@clinic.com",   // email OR mobile required',
    '  "mobile":   "9876543211",',
    '  "password": "secret123",',
    '  "role":     "doctor"              // admin | doctor | staff',
    '}',
  ]),
  spacer(),

  heading2('POST /auth/refresh'),
  labelValue('Auth', 'Public'),
  heading3('Request Body'),
  codeBlock(['{ "refreshToken": "eyJhbGci..." }']),
  heading3('Response 200'),
  codeBlock(['{ "success": true, "data": { "accessToken": "eyJhbGci..." } }']),
  spacer(),

  heading2('PUT /auth/change-password  🔒'),
  heading3('Request Body'),
  codeBlock(['{ "currentPassword": "oldpass", "newPassword": "newpass123" }']),
  new Paragraph({ children: [new PageBreak()] }),
];

const sectionClinic = () => [
  heading1('4. Clinic Endpoints'),

  heading2('POST /clinic'),
  labelValue('Auth', 'Public'),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "name":      "City Health Clinic",',
    '  "subdomain": "cityhealth",',
    '  "phone":     "04422334455",',
    '  "email":     "info@cityhealth.com",',
    '  "address": {',
    '    "street":  "12 Anna Salai",',
    '    "city":    "Chennai",',
    '    "state":   "Tamil Nadu",',
    '    "pincode": "600002"',
    '  },',
    '  "settings": {',
    '    "tokenResetTime":       "00:00",',
    '    "workingHours":         { "start": "09:00", "end": "18:00" },',
    '    "appointmentDuration":  15',
    '  },',
    '  // Optional — auto-creates an admin user:',
    '  "adminName":     "Admin User",',
    '  "adminEmail":    "admin@cityhealth.com",',
    '  "adminMobile":   "9000000001",',
    '  "adminPassword": "Admin@123"',
    '}',
  ]),
  heading3('Response 201'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "data": {',
    '    "clinic":    { "_id": "...", "name": "City Health Clinic", "subdomain": "cityhealth" },',
    '    "adminUser": { "_id": "...", "name": "Admin User", "role": "admin" }',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('PUT /clinic/current  🔒 admin'),
  heading3('Request Body (any updatable fields)'),
  codeBlock([
    '{',
    '  "name":     "City Health Clinic Updated",',
    '  "settings": { "appointmentDuration": 20 }',
    '}',
  ]),
  new Paragraph({ children: [new PageBreak()] }),
];

const sectionDoctor = () => [
  heading1('5. Doctor Endpoints'),

  heading2('POST /doctor  🔒 admin'),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "name":               "Dr. Arun Kumar",',
    '  "mobile":             "9876543210",',
    '  "email":              "arun@clinic.com",',
    '  "specialization":     "General Physician",',
    '  "qualification":      "MBBS, MD",',
    '  "registrationNumber": "TN12345",',
    '  "experience":         8,',
    '  "consultationFee":    300,',
    '  "availability": [',
    '    {',
    '      "day": "monday",',
    '      "isAvailable": true,',
    '      "slots": [',
    '        { "start": "09:00", "end": "13:00", "maxTokens": 20 },',
    '        { "start": "17:00", "end": "20:00", "maxTokens": 15 }',
    '      ]',
    '    },',
    '    { "day": "sunday", "isAvailable": false, "slots": [] }',
    '  ]',
    '}',
  ]),
  spacer(),

  heading2('GET /doctor  🔒'),
  labelValue('Query params', 'specialization=Cardiology  |  page=1  |  limit=20'),
  spacer(),

  heading2('PUT /doctor/:id/availability  🔒 admin|doctor'),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "availability": [',
    '    {',
    '      "day":         "monday",',
    '      "isAvailable": true,',
    '      "slots": [{ "start": "09:00", "end": "13:00", "maxTokens": 20 }]',
    '    },',
    '    { "day": "saturday", "isAvailable": false, "slots": [] }',
    '  ]',
    '}',
  ]),
  new Paragraph({ children: [new PageBreak()] }),
];

const sectionPatient = () => [
  heading1('6. Patient Endpoints'),

  heading2('POST /patient  🔒'),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "name":        "Ravi Kumar",',
    '  "mobile":      "9123456789",           // required, unique per clinic',
    '  "email":       "ravi@example.com",',
    '  "age":         35,',
    '  "gender":      "male",                  // male | female | other',
    '  "dob":         "1989-04-15",',
    '  "bloodGroup":  "O+",',
    '  "address": {',
    '    "street":  "5 MG Road",',
    '    "city":    "Chennai",',
    '    "state":   "Tamil Nadu",',
    '    "pincode": "600001"',
    '  },',
    '  "allergies":         ["Penicillin", "Aspirin"],',
    '  "chronicConditions": ["Diabetes Type 2"],',
    '  "emergencyContact": {',
    '    "name":     "Priya Kumar",',
    '    "mobile":   "9000000001",',
    '    "relation": "Wife"',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('GET /patient  🔒'),
  labelValue('Query params', 'q=ravi (name/mobile search)  |  mobile=9123456789  |  page=1  |  limit=20'),
  spacer(),

  heading2('GET /patient/search/:mobile  🔒'),
  codeBlock(['GET /api/patient/search/9123456789']),
  heading3('Response 200'),
  codeBlock(['{ "success": true, "data": { "patient": { "_id": "...", "name": "Ravi Kumar", ... } } }']),
  spacer(),

  heading2('GET /patient/:id/history  🔒'),
  heading3('Response 200'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "data": {',
    '    "patient":       { ... },',
    '    "consultations": [ { "_id": "...", "diagnosis": "...", "doctorId": { "name": "..." } } ],',
    '    "appointments":  [ ... ],',
    '    "tokens":        [ ... ]',
    '  }',
    '}',
  ]),
  new Paragraph({ children: [new PageBreak()] }),
];

const sectionToken = () => [
  heading1('7. Token / Queue Endpoints'),

  para('The token engine is concurrency-safe. Token numbers are generated using an atomic MongoDB findOneAndUpdate + $inc + upsert on a dedicated TokenCounter collection, guaranteeing no two requests receive the same number for the same doctor on the same day.'),
  spacer(),

  heading2('Token Status State Machine'),
  codeBlock([
    'waiting ──► in_progress ──► completed',
    '   │               │',
    '   └───────────────┴──► cancelled',
    '',
    'Priority sort order in queue:  urgent > elderly > child > normal',
  ]),
  spacer(),

  heading2('POST /token/generate  🔒'),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "doctorId":     "64f2a1b2c3d4e5f6a7b8c9d0",',
    '  "patientId":    "64f2a1b2c3d4e5f6a7b8c9d1",',
    '  "priority":     "normal",       // normal | urgent | elderly | child',
    '  "date":         "2026-05-08",   // optional — defaults to today (YYYY-MM-DD)',
    '  "notes":        "Elderly patient, needs wheelchair",',
    '  "appointmentId":"..."           // optional',
    '}',
  ]),
  heading3('Response 201'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "message": "Token #7 generated",',
    '  "data": {',
    '    "token": {',
    '      "_id":         "...",',
    '      "tokenNumber": 7,',
    '      "date":        "2026-05-08",',
    '      "status":      "waiting",',
    '      "priority":    "normal",',
    '      "doctorId":  { "name": "Dr. Arun", "specialization": "General Physician" },',
    '      "patientId": { "name": "Ravi Kumar", "mobile": "9123456789" }',
    '    }',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('GET /token/queue/:doctorId  🔒'),
  labelValue('Query params', 'date=2026-05-08  (defaults to today)'),
  heading3('Response 200'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "data": {',
    '    "doctor": { "_id": "...", "name": "Dr. Arun" },',
    '    "date":   "2026-05-08",',
    '    "queue": [',
    '      { "tokenNumber": 3, "status": "in_progress", "patientId": { "name": "..." } },',
    '      { "tokenNumber": 4, "status": "waiting",     "patientId": { "name": "..." } }',
    '    ],',
    '    "stats": {',
    '      "waiting":    2,',
    '      "inProgress": 1,',
    '      "completed":  5,',
    '      "cancelled":  1,',
    '      "total":      9',
    '    }',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('PUT /token/status/:id  🔒'),
  heading3('Request Body'),
  codeBlock([
    '// Normal transition',
    '{ "status": "in_progress" }',
    '',
    '// Cancellation',
    '{',
    '  "status":       "cancelled",',
    '  "cancelReason": "Patient left the queue"',
    '}',
  ]),
  spacer(),

  heading2('GET /token  🔒'),
  labelValue('Query params', 'date=2026-05-08  |  doctorId=...  |  status=waiting  |  page=1  |  limit=50'),
  new Paragraph({ children: [new PageBreak()] }),
];

const sectionAppointment = () => [
  heading1('8. Appointment Endpoints'),

  heading2('POST /appointment  🔒'),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "doctorId":  "64f2...",',
    '  "patientId": "64f2...",',
    '  "date":      "2026-05-10",          // YYYY-MM-DD',
    '  "time":      "10:30",               // HH:MM',
    '  "type":      "new",                 // new | follow_up | emergency',
    '  "reason":    "Fever and cold for 3 days",',
    '  "notes":     "Morning slot preferred"',
    '}',
  ]),
  heading3('Response 201'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "data": {',
    '    "appointment": {',
    '      "_id":     "...",',
    '      "status":  "scheduled",',
    '      "date":    "2026-05-10",',
    '      "time":    "10:30",',
    '      "doctorId":  { "name": "Dr. Arun", "specialization": "General Physician" },',
    '      "patientId": { "name": "Ravi Kumar", "mobile": "9123456789" }',
    '    }',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('GET /appointment  🔒'),
  labelValue('Query params', 'date=2026-05-10  |  doctorId=...  |  patientId=...  |  status=scheduled  |  page=1  |  limit=20'),
  spacer(),

  heading2('PUT /appointment/:id  🔒'),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "status":       "confirmed",',
    '  "time":         "11:00",',
    '  "cancelReason": "Doctor unavailable"  // required only when cancelling',
    '}',
    '',
    '// status values: scheduled | confirmed | in_progress | completed | cancelled | no_show',
  ]),
  spacer(),

  heading2('POST /appointment/:id/convert-to-token  🔒'),
  para('Generates a queue token from a scheduled/confirmed appointment and links both records.'),
  heading3('Response 201'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "message": "Token #3 generated from appointment",',
    '  "data": {',
    '    "appointment": { "_id": "...", "status": "in_progress", "tokenId": "..." },',
    '    "token":       { "_id": "...", "tokenNumber": 3, "status": "waiting" }',
    '  }',
    '}',
  ]),
  new Paragraph({ children: [new PageBreak()] }),
];

const sectionConsultation = () => [
  heading1('9. Consultation / Rx Pad Endpoints'),

  heading2('POST /consultation  🔒'),
  heading3('Request Body'),
  codeBlock([
    '{',
    '  "tokenId":      "64f2a1b2c3d4e5f6a7b8c9d2",',
    '  "chiefComplaint": "Fever, headache for 2 days",',
    '  "symptoms":     ["fever", "headache", "body ache"],',
    '  "diagnosis":    "Viral fever",',
    '  "differentialDiagnosis": ["Dengue", "Malaria"],',
    '  "vitals": {',
    '    "bp":          "120/80",',
    '    "pulse":       88,',
    '    "temperature": 101.2,',
    '    "weight":      68,',
    '    "height":      170,',
    '    "spo2":        98,',
    '    "rbs":         110',
    '  },',
    '  "medicines": [',
    '    {',
    '      "name":         "Paracetamol 500mg",',
    '      "dosage":       "500mg",',
    '      "frequency":    "TDS",',
    '      "duration":     "5 days",',
    '      "instructions": "After food",',
    '      "quantity":     15',
    '    },',
    '    {',
    '      "name":         "Cetirizine 10mg",',
    '      "dosage":       "10mg",',
    '      "frequency":    "OD",',
    '      "duration":     "3 days",',
    '      "instructions": "At night",',
    '      "quantity":     3',
    '    }',
    '  ],',
    '  "investigations":  ["CBC", "Dengue NS1"],',
    '  "notes":           "Plenty of fluids, rest",',
    '  "advice":          "Avoid cold water. Return if fever persists beyond 3 days.",',
    '  "followUpDate":    "2026-05-13",',
    '  "followUpNotes":   "Review CBC report"',
    '}',
  ]),
  spacer(),

  heading2('GET /consultation/token/:tokenId  🔒'),
  heading3('Response 200 — full Rx with populated doctor & patient'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "data": {',
    '    "consultation": {',
    '      "_id":       "...",',
    '      "date":      "2026-05-08",',
    '      "diagnosis": "Viral fever",',
    '      "medicines": [ { "name": "Paracetamol 500mg", "frequency": "TDS", ... } ],',
    '      "vitals":    { "bp": "120/80", "pulse": 88 },',
    '      "doctorId":  { "name": "Dr. Arun", "qualification": "MBBS, MD" },',
    '      "patientId": { "name": "Ravi Kumar", "age": 35, "bloodGroup": "O+",',
    '                     "allergies": ["Penicillin"] }',
    '    }',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('GET /consultation/patient/:patientId  🔒'),
  labelValue('Query params', 'page=1  |  limit=10'),
  spacer(),

  heading2('PUT /consultation/:id/sign  🔒 doctor|admin'),
  para('Signs the prescription and automatically marks the linked token as completed. No request body required.'),
  heading3('Response 200'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "message": "Consultation signed and token completed",',
    '  "data": {',
    '    "consultation": { "isSigned": true, "signedAt": "2026-05-08T10:30:00.000Z" }',
    '  }',
    '}',
  ]),
  new Paragraph({ children: [new PageBreak()] }),
];

const sectionDashboard = () => [
  heading1('10. Dashboard Endpoints'),

  heading2('GET /dashboard/summary  🔒'),
  heading3('Response 200'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "data": {',
    '    "date": "2026-05-08",',
    '    "tokens": {',
    '      "total":      42,',
    '      "waiting":    8,',
    '      "inProgress": 1,',
    '      "completed":  30,',
    '      "cancelled":  3',
    '    },',
    '    "appointments": { "total": 15 },',
    '    "doctors":      { "active": 4 },',
    '    "patients":     { "newToday": 6 }',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('GET /dashboard/waiting  🔒'),
  labelValue('Query params', 'doctorId=...  (optional — filter to one doctor)'),
  heading3('Response 200'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "data": {',
    '    "count": 8,',
    '    "tokens": [',
    '      {',
    '        "tokenNumber": 9,',
    '        "status":      "waiting",',
    '        "priority":    "urgent",',
    '        "patientId": { "name": "Lakshmi", "age": 72 },',
    '        "doctorId":  { "name": "Dr. Arun" }',
    '      }',
    '    ]',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('GET /dashboard/doctor-stats  🔒'),
  heading3('Response 200'),
  codeBlock([
    '{',
    '  "success": true,',
    '  "data": {',
    '    "date": "2026-05-08",',
    '    "doctors": [',
    '      {',
    '        "doctor":     { "name": "Dr. Arun", "specialization": "General Physician" },',
    '        "waiting":    5,',
    '        "inProgress": 1,',
    '        "completed":  18,',
    '        "total":      24',
    '      },',
    '      {',
    '        "doctor":     { "name": "Dr. Priya", "specialization": "Paediatrics" },',
    '        "waiting":    3,',
    '        "inProgress": 0,',
    '        "completed":  12,',
    '        "total":      15',
    '      }',
    '    ]',
    '  }',
    '}',
  ]),
  spacer(),

  heading2('GET /dashboard/recent-consultations  🔒'),
  labelValue('Query params', 'limit=10'),
  new Paragraph({ children: [new PageBreak()] }),
];

const sectionErrors = () => [
  heading1('11. Error Reference'),
  para('All error responses follow the same envelope structure.'),
  spacer(),
  codeBlock([
    '// 400 — Validation failure',
    '{',
    '  "success": false,',
    '  "message": "\\"mobile\\" must be a 10-digit number; \\"name\\" is required"',
    '}',
    '',
    '// 401 — Invalid / expired token',
    '{ "success": false, "message": "Invalid or expired token" }',
    '',
    '// 403 — Insufficient role',
    '{ "success": false, "message": "Role \'staff\' is not allowed to access this resource" }',
    '',
    '// 404 — Not found',
    '{ "success": false, "message": "Doctor not found" }',
    '',
    '// 409 — Duplicate record',
    '{ "success": false, "message": "Patient with this mobile already exists" }',
    '',
    '// 429 — Rate limited',
    '{ "success": false, "message": "Too many requests, please try again later" }',
  ]),
  new Paragraph({ children: [new PageBreak()] }),
];

const sectionDataModels = () => [
  heading1('12. Data Models Reference'),

  heading2('User'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorder(),
    rows: [
      tableHeader([{ text: 'Field', pct: 20 }, { text: 'Type', pct: 20 }, { text: 'Notes', pct: 60 }]),
      ...([
        ['clinicId',    'ObjectId',  'Ref: Clinic — tenant key (indexed)'],
        ['name',        'String',    'Required'],
        ['email',       'String',    'Unique per clinic, sparse'],
        ['mobile',      'String',    'Unique per clinic, sparse'],
        ['password',    'String',    'bcrypt hashed, select: false'],
        ['role',        'Enum',      'admin | doctor | staff'],
        ['isActive',    'Boolean',   'Default: true'],
        ['lastLogin',   'Date',      'Set on login'],
        ['refreshToken','String',    'Stored for rotation, select: false'],
      ].map(([f, t, n]) =>
        new TableRow({ children: [
          new TableCell({ borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: f, font: 'Courier New', size: 18 })] })] }),
          new TableCell({ borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: t, size: 18, color: BRAND_BLUE })] })] }),
          new TableCell({ borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: n, size: 18, color: MED_TEXT })] })] }),
        ]})
      )),
    ],
  }),
  spacer(),

  heading2('Token'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorder(),
    rows: [
      tableHeader([{ text: 'Field', pct: 22 }, { text: 'Type', pct: 18 }, { text: 'Notes', pct: 60 }]),
      ...([
        ['clinicId',      'ObjectId', 'Ref: Clinic'],
        ['doctorId',      'ObjectId', 'Ref: Doctor'],
        ['patientId',     'ObjectId', 'Ref: Patient'],
        ['appointmentId', 'ObjectId', 'Ref: Appointment (optional)'],
        ['tokenNumber',   'Number',   'Auto-incremented per doctor per day'],
        ['date',          'String',   'YYYY-MM-DD'],
        ['status',        'Enum',     'waiting | in_progress | completed | cancelled'],
        ['priority',      'Enum',     'normal | urgent | elderly | child'],
        ['calledAt',      'Date',     'Set when status → in_progress'],
        ['completedAt',   'Date',     'Set when status → completed'],
        ['cancelledAt',   'Date',     'Set when status → cancelled'],
        ['cancelReason',  'String',   'Optional cancellation note'],
      ].map(([f, t, n]) =>
        new TableRow({ children: [
          new TableCell({ borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: f, font: 'Courier New', size: 18 })] })] }),
          new TableCell({ borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: t, size: 18, color: BRAND_BLUE })] })] }),
          new TableCell({ borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: n, size: 18, color: MED_TEXT })] })] }),
        ]})
      )),
    ],
  }),
  spacer(),

  heading2('Consultation'),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorder(),
    rows: [
      tableHeader([{ text: 'Field', pct: 25 }, { text: 'Type', pct: 20 }, { text: 'Notes', pct: 55 }]),
      ...([
        ['tokenId',               'ObjectId', 'Unique — one consultation per token'],
        ['symptoms',              'String[]',  'Array of symptom strings'],
        ['diagnosis',             'String',    'Primary diagnosis'],
        ['differentialDiagnosis', 'String[]',  'Alternate diagnoses'],
        ['vitals.bp',             'String',    'e.g. 120/80'],
        ['vitals.pulse',          'Number',    'bpm'],
        ['vitals.temperature',    'Number',    'Fahrenheit'],
        ['vitals.spo2',           'Number',    '0-100 %'],
        ['medicines[].name',      'String',    'Required'],
        ['medicines[].frequency', 'String',    'OD / BD / TDS / QID'],
        ['medicines[].duration',  'String',    'e.g. 5 days'],
        ['investigations',        'String[]',  'Lab/imaging orders'],
        ['followUpDate',          'Date',      'Must be in the future'],
        ['isSigned',              'Boolean',   'Default: false'],
        ['signedAt',              'Date',      'Set on sign action'],
      ].map(([f, t, n]) =>
        new TableRow({ children: [
          new TableCell({ borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: f, font: 'Courier New', size: 18 })] })] }),
          new TableCell({ borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: t, size: 18, color: BRAND_BLUE })] })] }),
          new TableCell({ borders: thinBorder(), margins: { top: 60, bottom: 60, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: n, size: 18, color: MED_TEXT })] })] }),
        ]})
      )),
    ],
  }),
];

// ─── Assemble & write ───────────────────────────────────────────────────────

async function generate() {
  const doc = new Document({
    creator: 'NoQ API',
    title: 'NoQ Clinic API Documentation',
    description: 'REST API reference for the NoQ clinic token booking backend',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: DARK_TEXT },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top:    convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left:   convertInchesToTwip(1),
              right:  convertInchesToTwip(1),
            },
          },
        },
        children: [
          ...coverPage(),
          ...overviewSection(),
          ...endpointTableSection(),
          ...sectionAuth(),
          ...sectionClinic(),
          ...sectionDoctor(),
          ...sectionPatient(),
          ...sectionToken(),
          ...sectionAppointment(),
          ...sectionConsultation(),
          ...sectionDashboard(),
          ...sectionErrors(),
          ...sectionDataModels(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'NoQ_API_Documentation.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`✅  Generated: ${outPath}  (${(buffer.length / 1024).toFixed(1)} KB)`);
}

generate().catch((err) => { console.error(err); process.exit(1); });

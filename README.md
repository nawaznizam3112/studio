# Studio

This repository now includes a HIPAA-conscious (not a claim of full HIPAA compliance) breathing training module with separate clinician and patient experiences.

## Breathing feature routes
- Clinician login: `/login?audience=clinician`
- Patient login: `/login?audience=patient`
- Clinician dashboard: `/clinician`
- Patient dashboard: `/patient`
- Patient invite enrollment: `/patient/enroll?token=<invite_token>`

## Core flows
### 1) Clinician enrolls patients
1. Login as clinician.
2. Open `/clinician`.
3. Seed default breathing programs (first-time setup).
4. Create patient invite (name + email).
5. Share invite link with patient.

### 2) Patient enrollment
1. Patient opens invite link `/patient/enroll?token=...`.
2. Sets phone + password to complete enrollment.
3. Logs in via patient login experience.

### 3) Program assignment
From `/clinician`, assign one or more programs to a patient with:
- start date
- schedule type (daily/custom stored in assignment)
- optional advanced hold gating
- optional breathing parameter overrides in assignment payload

### 4) Guided sessions + tracking
From `/patient`:
- complete safety acknowledgment on first use
- view timeline and next due module
- run timer-based inhale/exhale/hold guided session
- submit pre/post symptom check-ins and optional notes

Progress includes:
- 7/14/30 day completion rates
- streaks
- module completion count vs total
- clinician at-risk flag (no sessions in configured threshold window)

## Program library seeded
- Foundations (7 days)
- Anxiety & Stress Regulation (14 days)
- Sleep Wind-Down (10 days)
- COPD/Asthma-friendly Gentle Breath (10 days, optional)
- Performance / CO₂ tolerance (14 days, advanced, clinician-gated for holds)

## Firestore data model (schema-by-collection)
- `users` (includes role: clinician/patient + legacy roles)
- `patients`
- `patientInvites`
- `breathingPrograms` (program + module definitions)
- `breathingAssignments`
- `breathingSessionCompletions`
- `breathingOutcomes`
- `breathingAuditLogs`
- `breathingRetentionConfig`

## HIPAA-conscious controls implemented
- Role-gated server actions (least privilege checks)
- Audit logging for patient access, assignment changes, retention changes, and session writes
- PHI-safe operational behavior: no intentional PHI logging in new breathing actions
- Encryption in transit/at rest relies on Firebase platform controls

## Data retention (India-aware operations)
- Clinician can set retention duration (months) in `/clinician`
- Retention job can be run from `/clinician` and anonymizes records older than retention cutoff

## Local development
```bash
npm ci
npm run build
```

> `npm run lint` is currently interactive in this repository (prompts to initialize ESLint config).

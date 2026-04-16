# Agent Context — Autonomous Vehicle Compliance Checker

## Problem Statement

Build a **single checker** that lets anyone verify whether a specific autonomous vehicle (AV)
parked in London is legitimate. The check must confirm three things simultaneously:

1. **Vehicle compliance & registration** — the vehicle is registered and meets regulatory requirements
2. **Private hire operator** — there is a valid, licensed operator accountable for the vehicle
3. **Designated zone** — the vehicle is parked in a TfL-approved autonomous vehicle operation zone

> Motto: "Don't make autonomous vehicles the lime bikes of the future"

---

## Users & Their Goals

| Role | Need | Success Looks Like |
|---|---|---|
| TfL compliance officer | Verify AV registration and compliance | Instant pass/fail with evidence trail |
| Public safety inspector | Confirm valid private hire operator | Operator licence number + status |
| Traffic management official | Check vehicle is in an approved zone | Map-confirmed zone membership |
| Member of the public | Quick legitimacy check, easy reporting | Simple green/red result + report link |

---

## Core Verification Checks

When given a vehicle identifier (licence plate or QR code), the system must resolve:

### 1. Vehicle Registration & Compliance
- Is the vehicle registered with DVSA?
- Does it hold the required AV-specific approvals (UKAV type approval / self-driving vehicle licence)?
- Is the MOT / roadworthiness certificate current?
- Is it insured for autonomous operation?

### 2. Private Hire Operator
- Is there a licensed private hire operator linked to this vehicle?
- Is the operator's licence current and issued by TfL?
- Is the operator authorised for autonomous vehicle operations specifically?

### 3. TfL Designated Zone
- What is the vehicle's current or last-known location?
- Does that location fall within a TfL-designated AV operation zone?
- Is the zone currently active (some may be time/day restricted)?

---

## Key Data Sources & APIs to Integrate

| Source | What It Provides | Notes |
|---|---|---|
| DVSA Vehicle Enquiry Service API | Registration, make, tax & MOT status | `https://developer-portal.driver-vehicle-licensing.api.gov.uk` |
| TfL Unified API | Roads, zones, disruptions, geo data | `https://api.tfl.gov.uk` |
| Driver and Vehicle Standards Agency (DVSA) | MOT history | `https://developer-service.mot.api.gov.uk` |
| TfL Private Hire operator register | Licensed PHV operators | Public register — may need scraping or data agreement |
| Centre for Connected and Autonomous Vehicles (CCAV) | AV type approvals & licences | `https://www.gov.uk/government/organisations/centre-for-connected-and-autonomous-vehicles` |
| OS Data Hub / GeoJSON | Zone boundary polygons | For geo-fencing checks |

---

## Suggested Architecture

```
Input: licence plate / QR code
        │
        ▼
┌───────────────────┐
│   Lookup Service  │  ← orchestrates parallel checks
└───────┬───────────┘
        │
  ┌─────┼──────┐
  ▼     ▼      ▼
DVSA   TfL   Zone
check  PHV   geo-fence
        │
        ▼
┌───────────────────┐
│  Compliance Report│  ← structured result: PASS / FAIL / UNKNOWN per check
└───────────────────┘
        │
        ▼
  UI / API response
  + report/flag action
```

- Keep each check as an **independent agent/tool** so they can be called in parallel
- Return a structured result per check, not just a single boolean — partial failures need to surface
- Include a **public reporting endpoint** for members of the public who find a non-compliant vehicle

---

## Domain Concepts & Terminology

| Term | Meaning |
|---|---|
| AV | Autonomous Vehicle — self-driving, no human driver required |
| ZEVI | Zero Emission Vehicle Infrastructure (UK government programme) |
| UKAV | UK framework for approving self-driving vehicles (Automated Vehicles Act 2024) |
| PHV | Private Hire Vehicle |
| TfL | Transport for London — licensing authority for London PHV operators |
| CCAV | Centre for Connected and Autonomous Vehicles (DfT body) |
| DVSA | Driver and Vehicle Standards Agency |
| AV Zone | A geographic area designated by TfL as approved for autonomous vehicle operation |

---

## Constraints & Assumptions

- London-scoped for the hackathon (TfL jurisdiction)
- Input is a UK vehicle licence plate or a vehicle-mounted QR code
- Some data sources may require API keys or data-sharing agreements — mock/stub where needed
- The Automated Vehicles Act 2024 is the primary legislative context
- Privacy: licence plate lookups should be logged for audit but not stored indefinitely

---

## Tech Stack Guidance

- **Language**: Python (kick-off.py already exists)
- **AI**: Use Claude API for natural language results, report generation, and agentic orchestration
- **Preferred pattern**: tool-use / function calling so each check is a discrete Claude tool
- **Output**: JSON API + simple web UI

---

## Hackathon Goals (MVP)

- [ ] Accept a licence plate as input
- [ ] Run all three checks (vehicle, operator, zone) and return a structured result
- [ ] Display a clear PASS / FAIL / NEEDS REVIEW per check
- [ ] Provide a public "report this vehicle" action on failure
- [ ] Demo against at least one real data source (e.g. DVSA API) and stub the rest

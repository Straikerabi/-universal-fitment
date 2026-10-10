# QA / Legal / Business — Wave8 independent release gates

Status: **NO-GO**. This is an audit plan, not legal advice or an approval.

## Source of truth
Owner branch: `integration/private-unified-preview-wave5-owner`. Dependencies: #85, #86, #42, #43, draft #84, #89 and #92. Do not modify shared consumer/catalog/offline/worker files.

## P0 — fail-closed
| Gate | Required evidence | Acceptance |
| --- | --- | --- |
| OEM provenance | Independently obtained original 33 responses, hash and source-location review | 33/33 verified; otherwise block Wave7 migration |
| Consumer source-lock | Human-reviewed diff and rights inventory for integrated bytes | All preflight scenarios exit 2, launchApproved=false, P0 BLOCKED; malformed evidence rejected |
| Privacy | Data-flow inventory, controller details, Art. 13 information, deletion/retention and processor contracts where applicable | Named human signoff, no invented operator details |
| Asset rights | Per-asset B2C commercial permission and attribution obligations | 100% of published assets cleared or excluded |
| Security | Secret scan, dependency audit, CSP/header and storage review, abuse cases | No unresolved critical/high findings without explicit documented risk disposition |
| Hosting | Provider/location, TLS, logs, backups, retention, incident contacts and DPA where required | Recorded verification against actual provider config |
| Safety | Model-specific hazard review and conservative unconfirmed compatibility | Zero unjustified positive real fitments |
| Business | Consumer offer/affiliate disclosure and B2B contracts, access control, billing and GDPR roles | No monetization until explicit review |

## P1 — technical and real-device acceptance
- Repeat Chromium 33/33 and WebKit 33/33 **on integrated commit**, 0 skips; verify 320/375/390/430 px, 200% text, warm/cold offline and stale mission.
- Run 53+ Consumer tests, engine/bridge/business, 18 real-unknown checks and 10 Wave7 browser scenarios where applicable; report exact counts and commit SHA.
- Run iPhone Safari/VoiceOver physical hardware checklist; a simulated browser pass is not a hardware pass.
- B2C pilot: consent-based participant recruitment, measured completion rate and critical failure count; report numerator and denominator. No invented users.
- B2B pilot: separate scoped tenant, permissions and isolation tests; no production merchant onboarding.

## Reporting contract
Each gate reports: `gateId`, `status=pass|fail|blocked|not_run`, `commit`, `command`, `runUrl`, `measuredCount`, `reviewer`, `reviewDate`, `evidence`. Missing evidence means `blocked` or `not_run`, never `pass`.

## Integration boundary
Only the project lead may integrate. No main merge, deployment, legal signoff automation or synthetic operator data.

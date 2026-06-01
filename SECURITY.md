# Security Policy

## Overview

`dhis2-form-utils` is an open-source monorepo providing composable React form utilities for DHIS2 applications —
including a program rule engine extension, headless hooks, and UI adapter components. While this library does not handle
authentication or store credentials directly, it processes DHIS2 metadata and form payloads that may contain sensitive
health or programmatic data in downstream applications. Security issues are taken seriously.

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

There are two private channels available for responsible disclosure:

### 1. GitHub Private Vulnerability Reporting (Preferred)

Use GitHub's built-in private reporting feature:

**Security → Advisories → Report a Vulnerability**

This is the preferred channel as it keeps the full disclosure lifecycle within GitHub and enables coordinated advisory
publication once a fix is available.

### 2. Email

If you are unable to use GitHub's private reporting, or if the issue is particularly sensitive, contact the maintainer
directly:

**Gift Nnko** — *nnkogift@gmail.com*

---

## What to Include in Your Report

A useful vulnerability report helps triage and reproduce the issue quickly. Please include as much of the following as
possible:

- **Package(s) affected** — e.g. `@dhis2-form-utils/rules`, `@dhis2-form-utils/hooks`, a specific UI adapter
- **Description** — what the vulnerability is and why it is a security concern
- **Reproduction steps** — a minimal code example, test case, or proof of concept
- **Impact** — what an attacker could achieve and under what conditions
- **Environment** — library version, DHIS2 version if relevant, browser/Node version
- **Any suggested fix** — optional but appreciated

The more detail you provide, the faster the issue can be verified and addressed.

---

## Response Commitment

This is a personally maintained open-source project. The maintainer will make every reasonable effort to:

- **Acknowledge** receipt of your report in a timely manner
- **Triage** the issue and communicate an initial assessment
- **Resolve or provide a workaround** for confirmed vulnerabilities, prioritised by severity
- **Credit** reporters who wish to be acknowledged in the security advisory

Response times may vary depending on the complexity of the issue and the maintainer's availability. Critical
vulnerabilities affecting data integrity or exposure will always be prioritised over lower-severity issues. Your
patience and understanding are appreciated — this commitment is made in good faith.

---

## Scope

### In Scope

The following are considered security-relevant within this library:

| Area                                | Examples                                                                                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rule engine expression handling** | Expression injection or unsafe evaluation when processing DHIS2 program rule expressions passed to `@dhis2/rule-engine` context builders                               |
| **Payload filtering**               | Bugs in `filterPayload` that cause sensitive field data to be included in submission payloads despite being hidden/disabled by program rules                           |
| **Unsafe rendering in UI adapters** | XSS vulnerabilities introduced by UI adapter components that render dynamic DHIS2 metadata (labels, descriptions, option names) without proper sanitisation            |
| **`FieldStateMap` data leakage**    | Typed field state exposing values that should be suppressed or stripped based on rule outcomes                                                                         |
| **Dependency vulnerabilities**      | Critical or high-severity CVEs in direct dependencies that affect the security posture of consuming applications                                                       |
| **Hook behaviour**                  | Security-relevant edge cases in `@dhis2-form-utils/hooks` that cause form state to misrepresent rule outcomes (e.g. showing hidden fields, submitting disabled values) |

### Out of Scope

The following are explicitly outside the responsibility of this library:

| Area                                          | Reason                                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Authentication and session management**     | Handled entirely by `@dhis2/app-runtime` and the host DHIS2 instance                                        |
| **DHIS2 server-side vulnerabilities**         | Out of scope for a client-side utility library                                                              |
| **Network transport security**                | All HTTP communication goes through `@dhis2/app-runtime` — report these upstream to the DHIS2 platform team |
| **Host application misconfigurations**        | Security issues arising from how a consuming application integrates this library                            |
| **Third-party design system vulnerabilities** | Issues in DHIS2 UI, Mantine, or Material UI themselves — report to their respective maintainers             |
| **Social engineering**                        | Not a technical vulnerability                                                                               |

If you are unsure whether something falls in scope, report it anyway — it is better to receive a report that turns out
to be out of scope than to miss a real issue.

---

## Supported Versions

Security fixes are applied to the **latest release only**. There is no backporting to older major or minor versions.

| Version               | Supported |
| --------------------- | --------- |
| Latest release        | ✅        |
| All previous releases | ❌        |

Consumers are strongly encouraged to keep their dependency on `dhis2-form-utils` packages up to date. Pinning to old
versions means forgoing security fixes.

---

## Disclosure Policy

This project follows a **coordinated disclosure** approach:

1. Reporter submits a vulnerability through a private channel
2. Maintainer acknowledges and begins investigation
3. A fix is developed and tested privately
4. A patched release is published
5. A GitHub Security Advisory is published, crediting the reporter if they wish

The goal is to give users time to upgrade before full technical details are made public. The maintainer will work with
the reporter to agree on a reasonable disclosure timeline based on severity.

---

## Acknowledgements

Responsible disclosure makes open-source software safer for everyone. Reporters who identify and privately disclose
valid security vulnerabilities will be credited in the corresponding GitHub Security Advisory unless they prefer to
remain anonymous.

---

_This policy was last updated: June 2026_

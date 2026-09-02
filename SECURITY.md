# Security policy

## Supported versions

Only the `main` branch is supported; it is what is deployed. There are no
releases or older versions to patch.

## Reporting a vulnerability

Please report vulnerabilities **privately**, never in a public issue or pull
request:

1. Preferred: GitHub private vulnerability reporting —
   https://github.com/JensPenneman/jenspenneman.com/security/advisories/new
2. Alternative: email jenspenneman26@gmail.com (see
   https://jenspenneman.com/.well-known/security.txt).

Include what you found, how to reproduce it and, if you have one, a suggested
fix. You will get an acknowledgement within 72 hours and a resolution or a
status update within 14 days. Credit is given in the advisory if you want it.
There is no bug bounty.

## Scope

The website (all locales), its build pipeline and its GitHub configuration.
Third-party services (GitHub, Vercel) are out of scope; report those to the
respective vendor.

## Safe harbour

Good-faith research that respects this policy, avoids privacy violations and
service disruption, and gives reasonable time to fix before disclosure will not
be pursued.

## What is already in place

A per-request nonce Content Security Policy (`strict-dynamic`, no
`unsafe-inline`), HSTS with preload, OWASP recommended headers, signed commits
only, protected `main` with required CI, CodeQL, secret scanning with push
protection and Dependabot security updates.

# Security Policy

## Reporting a vulnerability

Do not open a public issue containing exploit details or private network
information. Use GitHub's private vulnerability-reporting feature for this
repository. If private reporting is unavailable, open a minimal issue asking
the maintainer to establish a private channel; omit technical details.

Include the affected version/commit, prerequisites, impact, a minimal
reproduction, and suggested remediation. Remove entity ids, hostnames, and
any other private installation details from reports and logs.

## Response targets

These are project targets, not an SLA: acknowledge critical/high reports in
three business days, establish severity and containment in seven, and publish
a coordinated fix as soon as safely validated. Lower-severity issues are
prioritized by exploitability and impact.

## Supported version

Only the latest published release and the default branch receive security
fixes.

## Security boundaries

Music Flow Card is a Lovelace dashboard card: static, sandboxed frontend code
that runs in the browser with the same access to Home Assistant's WebSocket
API as any other authenticated dashboard resource. It has no server-side
component, reads no secrets, and cannot escalate the permissions of the user
viewing the dashboard. Its only privileged actions are the service calls
(`media_player.turn_on`, `media_player.select_source`, volume/mute) that the
viewing user's own Home Assistant account is already authorized to make.

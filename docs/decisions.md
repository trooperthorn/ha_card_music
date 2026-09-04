# Decisions

## 2026-08 Release workflow uploads into an existing release instead of always creating one

The release workflow's "Attach the built card to the release" step checks
whether a release already exists for the tag and uploads the asset with
`gh release upload --clobber` when it does, falling back to `gh release
create` only when it does not.

The first release attempt used a bare `gh release create` unconditionally.
That failed when a release for the tag already existed (created from the
GitHub UI before the workflow ran), which left the tag without a
`music-flow-card.js` asset and HACS unable to find the card. Checking for
the release first and branching between upload and create fixed it.

## 2026-09-04: releases come from a merge to `main`, not `npm run release`

`Release` publishes the version already committed in `VERSION` and refuses a
committed `dist` that a fresh build does not reproduce; `Prepare release`
writes the next version and rebuilds `dist` in a reviewed, auto-merged PR.
Rejected: `scripts/release.mjs`, which wrote `VERSION`, committed, tagged, and
pushed from a workstation, so a release depended on whoever ran it and could
not be gated by branch protection.


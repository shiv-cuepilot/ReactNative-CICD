# Go-Live Runbook — App Store + Play Store

Sequenced steps to get IgniteKit connected to both stores and through review.
`[YOU]` = requires your Apple/Google/Expo accounts (cannot be automated for you).
`[DONE]` = already present in this repo.

> Build/submit/OTA plumbing, GitHub Actions, store metadata, and the release→track
> mapping are already scaffolded — see `docs/EAS.md` and
> `docs/RELEASE_AND_PLAY_MAPPING.md`. This runbook is only the account/credential
> and review-asset layer on top.

---

## Phase 0 — Prerequisites (accounts)

- `[YOU]` **Apple Developer Program** membership ($99/yr) for the team that owns
  bundle IDs `com.shivshankartiwari.ignitekit`.
- `[YOU]` **Google Play Console** developer account ($25 one-time) for
  `com.shivshankartiwari.reactnativeignitekit`.
- `[YOU]` **Expo account** (`owner: shivtiwari` in `app.config.js`) + EAS CLI
  (`npm i -g eas-cli`, `eas login`).

## Phase 1 — Link EAS

- `[DONE]` `projectId` + `updates.url` set in `app.config.js`.
- `[YOU]` `eas login && eas whoami` — confirm you own the `shivtiwari` project.
- `[YOU]` `eas build:list` — confirms the CLI can reach the project.

## Phase 2 — iOS: App Store Connect

- `[DONE]` `ascAppId: 6761337270` already in `eas.json` (the ASC app record exists).
- `[YOU]` In App Store Connect, confirm the app record uses bundle
  `com.shivshankartiwari.ignitekit` and matches the schemes in `eas.json`.
- `[YOU]` Signing: `eas credentials --platform ios` → set up all (distribution
  cert + provisioning profile, stored on EAS).
- `[YOU]` App Store Connect → App Privacy: fill using **Appendix A** below.
- `[YOU]` Upload screenshots — pipeline exists: see `docs/SCREENSHOTS.md`
  (`yarn screenshots:all`).

## Phase 3 — Android: Google Play Console

- `[YOU]` Create the app in Play Console (name "IgniteKit", package
  `com.shivshankartiwari.reactnativeignitekit`).
- `[YOU]` **First AAB must be uploaded manually** to a track once — Play blocks
  API submission until an app has a first release. Build one:
  `yarn eas:build:staging:android`, download the .aab, upload to Internal testing.
- `[YOU]` Create a **Google service account** with the Play Developer API,
  download its JSON, and add it to EAS
  (`eas credentials` / configure `serviceAccountKeyPath` for submit). After this,
  `yarn eas:submit:*:android` works via API.
- `[YOU]` Play Console → Data safety: fill using **Appendix A** below.
- `[YOU]` Complete Content rating questionnaire, Target audience, and set the
  **Privacy policy URL** (see Phase 4).

## Phase 4 — Privacy policy (required by both stores)

- `[DONE]` Policy drafted: `docs/legal/privacy-policy.md` + `privacy-policy.html`.
- `[YOU]` Host it at a public URL. Two options:
  1. **Your domain:** publish the content at `https://educatorslabs.com/privacy`
     (already referenced in `store.config.json`).
  2. **GitHub Pages:** enable Pages for this repo (Settings → Pages → deploy from
     `main`/`docs`), giving e.g.
     `https://<org>.github.io/ReactNative-CICD/legal/privacy-policy.html`; then
     update `privacyPolicyUrl` in `store.config.json` to match.
- `[YOU]` Enter that URL in both App Store Connect and Play Console.

## Phase 5 — First release

- `[YOU]` `yarn eas:build:prod` (or use the `eas-build-submit.yml` Action with
  `production`).
- `[YOU]` `yarn eas:submit:prod` once builds pass.
- `[YOU]` iOS: submit for review in App Store Connect. Android: promote from the
  chosen track to Production (`releaseStatus: completed` is preset for prod).

## Phase 6 — Verify the update feature end-to-end

The in-app "App Update Available" feature only lights up once the app is live:

- Store tier: publish a build with a higher version than an installed one → the
  banner shows "App Update Available".
- OTA tier: `yarn eas:update:prod "test"` on the same runtimeVersion → installed
  app shows "Update ready — restart to apply".

### OTA wiring (modeled on the Agastya app)

- `[DONE]` Native config already matches Agastya's: `EXUpdatesEnabled`,
  `EXUpdatesCheckOnLaunch=ALWAYS`, `EXUpdatesLaunchWaitMs=0` (Expo.plist /
  Info.plist / AndroidManifest), fixed-string `runtimeVersion`.
- `[DONE]` **`channel` added to every `eas.json` build profile**
  (development/staging/production). This ties each binary to its OTA stream — EAS
  injects `expo-channel-name` into the build. Without it, `eas update --channel X`
  reaches no one.
- Behavior: `LaunchWaitMs=0` means the OTA downloads in the background and is
  applied on the next launch. So mid-session the banner reads `ota-ready`
  ("restart to apply") once a pending update exists; `checkForUpdateAsync()` in
  the hook also catches updates published while the app is open.
- Unlike Agastya (which keeps OTA fully silent), this app surfaces OTA in the UI
  via the `useAppUpdates` hook — additive on top of the same native machinery.

---

## Appendix A — App Privacy (iOS) / Data Safety (Android) answers

Based on what the App actually does (no accounts, no ads, no personal data sale).

| Question | Answer |
|---|---|
| Do you collect data? | Minimal, for app functionality/diagnostics only |
| Contact info (name, email, phone) | **No** |
| Precise/coarse location | **No** |
| Contacts, photos, messages, files | **No** |
| Identifiers (user/device ID for tracking) | **No tracking**; device/app version used only for update checks & diagnostics |
| Diagnostics / crash / performance | **Yes** — not linked to identity, not used for tracking |
| Data shared with third parties | Update requests go to Apple/Google/Expo to deliver updates; not for advertising |
| Data used to track you across apps | **No** |
| Data encrypted in transit | **Yes** (HTTPS) |
| Users can request deletion | No personal profile is stored; contact support |

iOS "App Tracking Transparency": **not required** (no cross-app tracking, no IDFA).

## Appendix B — Common rejection causes (pre-checked)

- Missing/blank privacy policy URL → provided (Phase 4).
- APK instead of AAB on Play → all EAS profiles use `distribution: "store"` (AAB).
- Placeholder metadata → `store.config.json` has real title/description/keywords.
- Crash on launch during review → App renders; update feature guards `isEnabled`
  and swallows lookup failures (never blocks the UI).
- Broken support/marketing URLs → verify `educatorslabs.com/support` &
  `/ignitekit` resolve before submitting.

# ICRS 2026 programme — working notes

A private (`noindex`) page listing who is presenting at the 16th International
Coral Reef Symposium (Auckland, 19–24 July 2026), with the Konstanz-affiliated
folks called out. Data comes from EventsAir's public API — **not** by scraping
"The Event App".

## Pipeline

```
fetch_programme.rb ──▶ presenters.json ─┬─▶ index.html (hand-edited page; embeds presenter names)
        │                                └─▶ build_detail.rb ──▶ detail.json (committed; page fetches + caches it)
        └─▶ .data/agenda_full.json, .data/speakers.json   (gitignored raw feeds, for ad-hoc jq)
```

`presenters.json` is gitignored (raw, 1.8 MB). `detail.json` is the trimmed,
render-ready byline map (per `data-row` id: each talk's title, presenter,
authors, affiliations) — it **is committed** because the live page fetches it on
load and caches it via the Cache Storage API (not localStorage). Regenerate any
time (programme changes during the week):

```
ruby fetch_programme.rb   # refresh presenters.json from the API
ruby build_detail.rb      # rebuild detail.json from presenters.json + index.html rows
```

## Why not mitmproxy / iPhone Mirroring

The Event App (by EventsAir) is a thin webview over a **public, unauthenticated**
JSON API. Hitting the API directly beats intercepting phone traffic. (iPhone
Mirroring wouldn't have helped anyway — mirrored apps run on the phone, so a
Mac-side proxy sees nothing.)

## EventsAir API cheat sheet

- **Base:** `https://websitegatewayae.eventsair.com/api`
- **Every call:** `?tenant=innovators&projectid=23820057`
- No auth. Sending browser `Origin`/`Referer` headers avoids the occasional gate.

| Endpoint | Method | Notes |
|---|---|---|
| `GetAgendaData` | **POST** | Sessions. Returns **empty** `presentations` unless the body asks for them (below). |
| `GetSpeakerData` | GET | ~1,718 people: name, organization, position, bio, photo. |
| `ListPaperStatuses` | GET | Status names ↔ IDs (re-pull if the event's statuses change). |
| `ListPresentationTypes` | GET | Oral / Poster / Speed talk / Plenary / Panel. |
| `GetSponsorData`, `GetExhibitorData` | GET | Available, not yet used here. |

**The gotcha:** `GetAgendaData` only fills in presentations + authors when the POST
body includes both the author flags and the `statusIds` of on-programme papers:

```json
{ "includePresentingAuthors": true,
  "includeNonPresentingAuthors": true,
  "includeKeywords": true,
  "statusIds": ["<Accepted oral/speed/poster/session>", "<Plenary>", "<Panel>"] }
```

The exact status IDs live in `PRESENTING_STATUS_IDS` in `fetch_programme.rb`.

## presenters.json shape

```
meta: { event, source, note, sessionCount, presentationCount, uniquePresenterCount }
sessions[]:
  sessionNumber, slot, room, location, title, date, startTime, endTime
  presenters[]:     { name, organization }          # every presenting author in the session
  presentations[]:  { startTime, title, type,
                      presenter, coPresenters[],     # coPresenters = the names the app hides behind "+N"
                      authors[], affiliations[] }
```

**Join note:** `sessionNumber` is **not unique** — a multi-part session repeats it
across time-blocks (e.g. #120 appears 6× on Mon/Tue). Match a page row on
`sessionNumber + date + startTime`, or on the first presenter name.

## How the API was found (for other EventsAir events)

1. Open the event's `*.eventsairsite.com` programme site → view source.
2. Find the inline `publicData` JSON: `{ endpoint, tenantAlias, projectId }`.
3. The agenda widget JS (`bce-cloud.b-cdn.net/EventsAir/<ver>/index.view.js`)
   lists every `/api/*` endpoint and how the request is built.

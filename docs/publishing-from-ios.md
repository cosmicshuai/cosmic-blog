# Publishing notes from iPhone

An Apple Shortcut that takes a line of text and commits it to `src/notes/`
through the GitHub Contents API. Cloudflare rebuilds on push, so a note is live
about 40 seconds after you tap send.

No server, no running Mac, no recurring cost.

## Why the API and not the GitHub app

The note format is unforgiving in one specific way: `date:` has to be a full
timestamp. Eleventy only parses the `YYYY-MM-DD-` filename prefix, so a
date-only value collapses every note that day onto `00:00:00Z` — and because
anchor ids are derived from the timestamp, two same-day notes end up sharing a
DOM id and every permalink but the first breaks.

The build now recovers the time from a `YYYY-MM-DD-HHMMSS` filename when front
matter omits `date`, so a hand-made file can't corrupt the archive. But the
Shortcut sidesteps the question entirely by generating both, correctly, every
time. That is the whole reason to prefer it over typing files by hand.

---

## 1. Create the token

GitHub → Settings → Developer settings → **Fine-grained personal access tokens**
→ Generate new token.

| Field | Value |
|-------|-------|
| Repository access | **Only select repositories** → this repo |
| Permissions → Contents | **Read and write** |
| Expiration | your call; you'll need to redo this step when it lapses |

Fine-grained and single-repo matters. If the phone is lost, the blast radius is
one blog repo rather than your whole account.

Copy the token — GitHub shows it once.

## 2. Build the Shortcut

New Shortcut, named something like **Note**. Add these actions in order.

**1 — Text** (the note body)

Leave it empty and set it to `Shortcut Input` if you want the Share Sheet to
work; otherwise use an **Ask for Input** action with prompt `Note`.

**2 — Format Date** → for the filename

- Date: `Current Date`
- Format: **Custom**
- Format string: `yyyy-MM-dd-HHmmss`
- Rename this variable `Filename`.

**3 — Format Date** → for the front matter

- Date: `Current Date`
- Format: **Custom**
- Format string: `yyyy-MM-dd'T'HH:mm:ssXXX`
- Rename this variable `Stamp`.

`XXX` emits the timezone offset (`-07:00`), so the instant is unambiguous even
though the site renders times in UTC. Don't use a literal `Z` — that would
claim local time is UTC and shift every note.

**4 — Text** (the file contents). Exactly this, with the variables inserted:

```
---
date: [Stamp]
---

[note text from step 1]
```

The blank line after the closing `---` matters.

**5 — Base64 Encode**

Input: the Text from step 4. Turn **Line Breaks** off.

**6 — Dictionary**

| Key | Type | Value |
|-----|------|-------|
| `message` | Text | `note: [Filename]` |
| `content` | Text | the Base64 Encoded result |
| `branch` | Text | `main` |

**7 — Get Contents of URL**

- URL: `https://api.github.com/repos/OWNER/REPO/contents/src/notes/[Filename].md`
- Method: **PUT**
- Headers:
  - `Authorization` → `Bearer YOUR_TOKEN`
  - `Accept` → `application/vnd.github+json`
- Request Body: **JSON** → the Dictionary from step 6

**8 — Show Notification** (optional)

Text: `Posted [Filename]`. Useful confirmation, since everything else is silent.

## 3. Put it where you'll use it

- **Home Screen** — Shortcut details → Add to Home Screen. One tap to a text box.
- **Share Sheet** — in Shortcut Details, enable *Show in Share Sheet*. Now you
  can share a URL from Safari straight into a note, which is most of what a
  microblog is for.
- **Siri** — "Hey Siri, note". Dictation into the same box.

## 4. Verify it worked

Post something, wait ~40 seconds, then check <https://cosmic-log.pages.dev/notes/>.
The commit will also appear in the repo history as `note: <filename>`.

---

## Notes on the recipe

**This exact request is verified.** The Contents API call above was tested
against this repo on a throwaway branch, the stored bytes were read back
unchanged, and the resulting file was confirmed to render as a note and appear
in the Atom feed.

**Two notes in the same second** would collide — the second `PUT` returns 422
because the path exists and no `sha` was supplied. It fails loudly rather than
overwriting, which is the behaviour you want.

**The token lives in the Shortcut.** Anyone with your unlocked phone can read
it. Fine-grained scoping is what keeps that acceptable.

**Editing and deleting** still need the web UI or a real git client. This
Shortcut only appends, deliberately — it is a capture tool.

**Times display in UTC.** A note posted at 10:15 local shows as `17:15Z`. If
you'd rather see local time, that's a one-line change to the `utcTime` filter
in `eleventy.config.js`.

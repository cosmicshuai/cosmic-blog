# Publishing notes from iPhone

An Apple Shortcut that takes a line of text and commits it to `src/notes/`
through the GitHub Contents API. Cloudflare rebuilds on push, so a note is live
about 40 seconds after you tap send.

No server, no running Mac, no recurring cost.

## The note format

A note is a Markdown file in `src/notes/`. Front matter is optional:

- With `date:` in front matter, that timestamp is used.
- Without it, the build recovers the time from a `YYYY-MM-DD-HHMMSS` filename,
  **read as UTC**.

So a bare `.md` file containing nothing but body text is a complete, valid note.
That is what makes the Copilot fallback at the bottom of this page safe.

The Shortcut still writes an explicit `date:` anyway, and that is deliberate —
see the warning in step 3.

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
claim local time is UTC and shift every note by your offset.

> **Don't drop this step.** Front matter is optional in general, but not here.
> Shortcuts formats dates in **local** time, so the filename from step 2 is
> local — and the filename fallback reads filenames as **UTC**. Without an
> explicit `date:`, every note would be shifted by your timezone offset. The
> front matter is what pins the real instant. The Copilot fallback can omit it
> only because `date -u` produces a genuinely UTC filename.

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

---

# Fallback: the GitHub app + Copilot

Useful when you don't have the Shortcut to hand, or you're on someone else's
device. Slower — you wait for a runner and then merge a PR you wrote yourself —
but it needs no token and nothing installed.

In the GitHub mobile app, open an issue (or the Copilot pane), assign it to
Copilot, and paste the prompt below with your note appended at the end.

Because notes need **no front matter at all**, the only thing the agent has to
get right is the filename — and it is told to read the clock rather than guess.

## The prompt

```text
Create exactly one new file in `src/notes/` in this repository. Change nothing else.

FILENAME
Run this command and use its exact output as the filename, with `.md` appended:
    date -u +%Y-%m-%d-%H%M%S
Do not guess or infer the current time — run the command and read it. The
timestamp must be UTC.

FILE CONTENTS
The note text below, copied verbatim, and nothing else. Specifically:
- No YAML front matter. Do not add `---`, `date:`, `title:` or `tags:`.
- No heading, no title line, no bullet wrapper, no code fence.
- Do not reword, summarise, correct, translate or expand the text.
- Leave URLs as bare URLs; they are auto-linked at build time.
The build derives the note's timestamp from the filename, which is why no front
matter is needed.

OUTPUT
Open a pull request against `main` containing that single new file.
- Commit message: `note: <filename without the .md extension>`
- PR title: the same — `note: <filename without the .md extension>`
- PR body: leave it empty. Do not summarise or quote the note.
Do not merge it; I'll merge from my phone.

CONSTRAINTS
- Create one file. Do not modify or delete any existing file.
- Do not run the site build, install dependencies, or edit config.

NOTE TEXT — everything below this line is the note:
```

Then paste your note under that last line and send.

## Why it's shaped that way

- **"Run the command, don't guess"** is the load-bearing instruction. A model
  asked for the current time will invent one, and a wrong timestamp puts the
  note in the wrong position in the log.
- **"No front matter"** removes the only fiddly part of the format. A bare `.md`
  file with body text is a complete, valid note.
- **"Verbatim"** and the explicit don't-reword list exist because a coding agent's
  default instinct is to improve prose. You want a scribe, not an editor.
- **"One file, nothing else"** keeps the diff to a single addition, so reviewing
  the PR on a phone is a two-second glance.
- **The explicit PR title** is the reason to mention pull requests at all. The
  Copilot coding agent always opens one — it works on a branch and cannot push
  to `main` — but left to itself it writes its own title, usually a paraphrase
  of your note. Pinning it to `note: <filename>` keeps the repo history
  scannable and stops your own words being restated back at you in the PR list.

## After it opens the PR

Check the diff is one added file with the right timestamp, then merge from the
app. Cloudflare deploys on merge, same ~40 seconds as the Shortcut.

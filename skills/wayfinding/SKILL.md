---
name: wayfinding
description: "Charts work too big or too foggy for one session as a map of decision tickets in project memory, then resolves one per session until the way is clear. Use when an idea, a product or a change is too large for one sitting, or to continue a map."
---

# Wayfinding

A loose idea has arrived, too big for one session and wrapped in fog: the way from here to the **destination** is not visible yet. Wayfinding finds the way; it does not charge at the destination. It writes a **map** into project memory and works its **decision tickets** (questions whose answer is a decision, not slices of a build) one per session, until nothing is left to decide before someone does the work.

Pocock's `wayfinder` (MIT) is the source of the method; this version keeps the map in `.builderos/` so it works with nothing connected and every new session reads it.

## Plan, don't do

Each ticket resolves a decision; the map is done when the way is clear. The pull to start building is the signal you have reached the edge of the map: hand off. A map can carry execution only when its **Notes** say so.

## Where the map lives

`.builderos/maps/{slug}/MAP.md` is the index, one file per ticket in `tickets/NN-{slug}.md`, numbered in creation order. The map is an **index**, not a store: a decision lives in its ticket, the map gists it and links. Refer to every ticket by its title, with the number inside the link, never by a bare number. Where `tickets.write` resolved and the person wants the tracker, publish each ticket there too, with native blocking edges, and write the link into its file; the files stay the record.

Where commands run, `scripts/bos.mjs map` prints the destination, the frontier, what is claimed, blocked and decided, and the fog; the session briefing shows the next takeable ticket of every open map.

```markdown
# Map — {name}
**Status:** open

## Destination
{What reaching the end looks like: initiatives on the roadmap with their tracks, a spec ready for phase 4, a decision recorded as an ADR, a change made. One or two lines.}

## Notes
{Domain, skills every session reads, standing preferences for this effort.}

## Decisions so far
- [{ticket title} (01)](tickets/01-{slug}.md): {one-line gist of the answer}

## Not yet specified
- {A dim question you can see coming but cannot phrase sharply yet}

## Out of scope
- {Work ruled beyond the destination, with why, linking the closed ticket if there was one}
```

```markdown
# 01: {question as a title}
**Type:** research | prototype | grilling | task
**Status:** open | claimed | closed | out-of-scope
**Blocked by:** {numbers of the tickets that gate this one, or none}
**Claimed by:** {who, date; empty while unclaimed}

## Question
{The decision or investigation, sized to one session.}

## Resolution
{Written on close: the answer, who decided it, the evidence tags, links to what was produced.}
```

A ticket is **unblocked** when every ticket blocking it is closed. The **frontier** is the open, unblocked, unclaimed tickets: the edge of the known.

## Ticket types

Every ticket is worked **with** the person (they speak for themselves) or **alone** by the agent. A ticket worked with the person resolves only through that exchange: the person's answer closes it.

- **Research** (alone): a fact a decision waits on, from documents, the repository, the web or connected sources. Facts are the agent's job. Delegate it where the host supports delegation, so research tickets resolve in parallel; otherwise resolve it inline. Tag what it finds per `evidence-ledger`.
- **Prototype** (with the person): raise the fidelity of the discussion with a cheap, rough artifact to react to: a logic prototype per `domain-model`, rendered versions per `design-direction`, an outline. Link it from the ticket.
- **Grilling** (with the person): the default. Run `pressure-testing` rounds until the ticket's frontier is empty; settle any term used two ways per `domain-model`, step 1.
- **Task** (alone where possible, otherwise a checklist for the person): manual work a decision is blocked on: an account to open so an API can be judged, an export so data can be seen. It earns its place by unblocking a decision. Its resolution records what was done and the facts later tickets need.

## Fog of war

The map is deliberately incomplete. **Not yet specified** holds the dim view: decisions you can tell are coming but cannot phrase yet, because they hang on open questions. Resolving a ticket clears fog ahead of it.

**Fog or ticket?** Ticket when you can state the question precisely now, even if it is blocked. Fog when you cannot phrase it that sharply yet; one patch may become several tickets, or none.

Fog gathers only toward the destination. Work beyond it is **out of scope**: close any ticket that turns out to sit past the destination, with status `out-of-scope`, and leave one line under **Out of scope**. It never graduates; it returns only if the destination is redrawn, as a new map.

## Procedure

**One ticket per session**, research tickets excepted: the next session starts from the redrawn map, not from this one's momentum.

### Chart the map

1. **Name the destination.** One `pressure-testing` round on what this map is finding its way to; the destination fixes the scope, so it is settled first. Done when the person accepted a destination of one or two lines.
2. **Map the frontier, breadth first.** Fan out across the whole space, not deep on one thread: the open decisions and the first steps takeable now. If the way is already clear and fits one session, say so and offer the direct route instead (an initiative, a spec, an answer). Done when every open decision you can see is either a sharp question or a patch of fog.
3. **Write the map** with Destination and Notes, an empty Decisions so far, and the fog under Not yet specified. Done when `MAP.md` exists under `.builderos/maps/{slug}/` with all five headings.
4. **Write the tickets you can specify now**, then wire the blocking edges in a second pass, with real numbers. Done when every ticket has a type, a question and its blockers.
5. **Start the research tickets**, in parallel where delegation is available. Done when each research ticket is claimed or resolved.
6. **Stop.** Charting is one session's work. Done when the person has the destination, the frontier and the fog, and no grilling ticket has been worked.

### Work through the map

1. **Load the map**, not every ticket body (`scripts/bos.mjs map {slug}` where commands run). Done when you can name the frontier, the claimed tickets and the fog.
2. **Choose the ticket.** The one the person named, otherwise the first on the frontier. **Claim it** first (`**Status:** claimed`, `**Claimed by:**`), so a parallel session skips it. Done when the claim is written in the ticket file, re-read just before writing.
3. **Resolve it as its type** says, reading any related or closed ticket on demand and the skills the Notes name. Done when the ticket's own question has an answer the person gave (with them) or a sourced fact (alone).
4. **Record it.** Write `## Resolution`, set `**Status:** closed`, add one line under Decisions so far. A decision that is hard to reverse, surprising and a real trade-off also becomes an ADR in `decisions/`. Done when the ticket, the map and any ADR all carry the decision.
5. **Redraw.** New tickets the answer surfaced (write, then wire); fog the answer made specifiable graduates into tickets and leaves Not yet specified; tickets the answer invalidated are updated, or closed as out of scope. Done when the map matches what is now known.
6. **When no ticket and no fog remain**, the way is clear: set `**Status:** done` and hand off to the destination: `builder-os` for initiatives (each with its track and the map linked as its evidence), `spec-writing` for a spec, the ADR for a decision. Done when `bos.mjs map` shows no open ticket and Not yet specified is empty.

Expect other sessions to be working the same map: re-read a ticket before claiming it.

## Capabilities

| Capability | Used for | Floor if absent |
|---|---|---|
| `files.read` / `files.write` | The map and its tickets | Keep the map in the conversation and say it will not survive the session |
| `subagent.dispatch` | Research tickets in parallel | Resolve them inline, one after another |
| `tickets.write` | Publishing tickets to the person's tracker | The files are the tracker |
| `shell.exec` | `bos.mjs map` for the frontier | Read the ticket files and compute it by hand |

## Output Contract

Charting ends with `## MAP CHARTED`: the destination, the frontier by title, the fog. A worked ticket ends with `## TICKET RESOLVED`: the decision, who made it, what it unblocked, the next ticket on the frontier. A finished map ends with `## WAY CLEAR` and the hand-off.

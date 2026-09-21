# jev-migrate launch kit

Draft copy for posting on your own accounts. Nothing here has been posted — review, tweak, then post yourself (or ask me to, and I'll confirm before anything goes out).

All numbers below are pulled straight from [README.md](README.md)'s benchmark section — real measured numbers, not invented ones. Keep it that way in any edits: don't round up or add claims the benchmark script doesn't back.

---

## 1. Show HN (news.ycombinator.com)

**Title** (HN strips "Show HN:" formatting weirdness if you get fancy — keep it plain):

> Show HN: jev-migrate – find LLM calls that don't need an LLM

**Post body:**

```
I kept noticing the same pattern in codebases: an OpenAI/Anthropic call with
temperature: 0, a tiny max_tokens, and a prompt that's really just "pick one
of these 3 categories" or "is this X, yes or no?" That's not generation,
it's a decision - and paying 500-2000ms of network latency plus API cost
for a decision with a handful of possible outputs is pure overhead.

jev-migrate is a CLI that scans a TS/JS/Python codebase, finds calls shaped
like this (routing, classification, scoring, boolean checks), scores how
confident it is per detection, and shows you the conversion.

I didn't want to ship this with made-up "99% cheaper" marketing numbers, so
I benchmarked it against the real OpenAI API instead of asserting anything:
same prompts, real gpt-4o-mini calls, timed against a hand-written rules-based
equivalent doing the same job. Result: 3,405x faster, $0.000027 -> $0 per
call, and the local rule landed on the identical answer to the LLM on all
3 test cases. Script's in the repo (test/benchmark.ts), run it yourself
against your own OpenAI key.

It's regex/keyword-based detection, not an AST parse, so it's not perfect -
false positives are possible on unusually worded prompts. `convert` gives
you a before/after scaffold, not an automatic rewrite, because porting the
real option list and getting the accuracy right is the part that actually
needs a human.

npm install -g jev-migrate
jev-migrate scan ./your-project

GitHub: https://github.com/akanthed/jev-migrate
```

**Day-of checklist:**
- [ ] Post between 7-9am PT (HN's highest-traffic window)
- [ ] Reply to every comment within the first 2 hours
- [ ] Don't be defensive about the "regex not AST" limitation — own it, it's in the README
- [ ] Link the benchmark script directly when people ask "how do you know it's faster"

---

## 2. Reddit

### r/programming

**Title:** I benchmarked "convert your LLM calls to rules" instead of just claiming it - 3,405x faster, real numbers

**Body:**
```
Built a CLI (jev-migrate) that scans codebases for LLM calls that are
actually just routing/classification/scoring/boolean decisions dressed up
as "AI." Rather than write "99% cost reduction" on the README like every
other tool in this space, I benchmarked it against the live OpenAI API:

- Real gpt-4o-mini call: ticket routing decision, temperature 0 -> 2641ms, $0.000008
- Rules-based equivalent, same input -> 0.212ms, $0
- Same answer both times

Full writeup + the benchmark script (so you can run it against your own
key and verify) is in the repo: https://github.com/akanthed/jev-migrate

Curious what people think of the detection approach - it's keyword +
signal based (temperature: 0, max_tokens, JSON parsing, scale mentions),
not a full AST parse, so I expect some false positives in the wild.
```

### r/MachineLearning (flair: Discussion, not Research — mods are strict about this)

**Title:** [D] How much of your production LLM usage is actually just classification with extra steps?

**Body:**
```
Working on tooling to detect this pattern (jev-migrate, CLI, scans TS/JS/
Python repos for LLM calls shaped like routing/classification/scoring/
boolean decisions), and the benchmark surprised me more than I expected:
a real gpt-4o-mini call for a 3-way routing decision took 2.6s and cost
$0.000008; a hand-written rule for the same input took 0.2ms and $0, same
answer.

Not claiming every LLM call in prod is like this - obviously anything
needing actual language understanding or open-ended generation isn't a
candidate. But the "temperature: 0, tiny max_tokens, picks from a fixed
set" pattern shows up constantly and is pure latency/cost tax when it does.

Repo + benchmark script (runs against your own key so you can verify the
numbers yourself): https://github.com/akanthed/jev-migrate

Genuinely curious how common people think this pattern is in the wild vs
how much I'm overfitting to my own experience.
```

### r/LocalLLaMA (angle: cost/latency awareness, not "local LLM" per se — frame carefully or skip if off-topic for that sub)

Skip unless you want to make the local-inference angle explicit (e.g. "why route to a 70B model for a yes/no when a rule does it in 0.2ms").

---

## 3. dev.to / Hashnode article

**Title:** I stopped believing "99% cost reduction" claims, so I benchmarked my own tool instead

**Outline:**
1. The pattern: temperature:0 + tiny max_tokens + fixed-output-space prompt = decision, not generation
2. Why this matters: show the routing/classification/scoring/boolean examples from the README
3. The tool: what jev-migrate scans for, how confidence scoring works (reuse the Mermaid diagrams from README — dev.to renders Mermaid too)
4. The benchmark: full walkthrough of test/benchmark.ts, the real numbers, and the honest caveat (local rule is hand-written per case, not a guarantee your decision generalizes)
5. Limitations section verbatim from README — don't oversell
6. CTA: `npm install -g jev-migrate`, link to repo, ask for GitHub stars/issues on edge cases it misses

(Reuse README content directly — it's already written for this audience. Don't rewrite from scratch.)

---

## 4. Twitter/X thread

```
1/ Found this pattern everywhere in LLM codebases: temperature: 0, a tiny
max_tokens, a prompt that's really "pick 1 of 3 categories."

That's not generation. That's a decision. And it's costing you 500-2000ms
+ API fees for something a rule could do in <1ms for $0.

2/ Built jev-migrate to find these automatically - scans TS/JS/Python repos
for routing/classification/scoring/boolean-shaped LLM calls.

3/ Didn't want to ship another tool with made-up "99% faster" numbers. So I
benchmarked it against the real OpenAI API instead:

Real gpt-4o-mini call: 2641ms, $0.000008
Rules-based equivalent: 0.212ms, $0
Same answer.

4/ Ran it on 3 different decision types (routing, classification, boolean
fraud check). Local rule matched the LLM's answer on all 3.

Overall: 3,405x faster. Script's in the repo, run it against your own key:
[link]

5/ It's not magic - regex/keyword detection, not an AST parse, so expect
some false positives on unusual prompts. `convert` gives you a scaffold,
not an auto-rewrite, because getting the real logic right needs a human.

6/ npm install -g jev-migrate
jev-migrate scan ./your-project

github.com/akanthed/jev-migrate

Would love feedback on what decision patterns it's missing.
```

---

## 5. Discord — TypeSafe AI server

This is an **owned-adjacent channel** — your existing community, warmer audience than cold Reddit/HN, so it can be more casual and more technical/detailed than the public posts above. Post in whatever channel fits (`#showcase`, `#projects`, `#announcements` — pick the one people actually check).

```
🔍 **jev-migrate** — find the LLM calls in your codebase that don't need an LLM

Built this after noticing the same pattern everywhere: an OpenAI/Anthropic
call with `temperature: 0`, a tiny `max_tokens`, and a prompt that's really
just "pick 1 of 3 categories" or "yes/no?" That's a decision, not
generation — and it's paying full LLM latency + cost for something a rule
can do instantly.

**What it does:** scans a TS/JS/Python repo, finds calls shaped like
routing / classification / scoring / boolean checks, scores confidence per
detection, shows you what converting to a rules-based `Jev.choice` /
`Jev.score` / `Jev.noul` call would look like.

**Didn't want to ship another tool with made-up "99% cheaper" numbers**, so
I benchmarked it against the live OpenAI API instead of just asserting it:

> Real gpt-4o-mini call (routing decision): 2641ms, $0.000008
> Rules-based equivalent, same input: 0.212ms, $0
> **Same answer, both times.**

Ran across 3 decision types — routing, classification, boolean fraud check.
Local rule matched the LLM's answer on all 3. Overall: **3,405x faster**,
**~$0.000027 → $0** per call. Benchmark script's in the repo, runs against
your own OpenAI key so you can verify it yourself, not just trust my numbers.

Heads up on limits: it's regex/keyword detection, not a full AST parse, so
expect occasional false positives on unusually-worded prompts. `convert`
gives you a before/after scaffold, not an automatic rewrite — porting the
real option list and getting the accuracy right still needs a human, that's
the actual migration work.

```bash
npm install -g jev-migrate
jev-migrate scan ./your-project
```

📦 npm: https://www.npmjs.com/package/jev-migrate
💻 GitHub: https://github.com/akanthed/jev-migrate

Would genuinely love feedback from this crowd specifically — you all think
about type safety and LLM output structure more than most, curious what
decision patterns you'd want it to catch that it currently misses. 🙏
```

**Posting notes:**
- This audience will read the benchmark script itself if you link it — don't oversimplify the caveat about the local rule being hand-written per test case, they'll ask.
- If the server has a bot-command or thread convention for project shares, use it instead of a flat message so it doesn't get buried.
- Good place to ask directly: "does this fit as a companion tool to Jev, or should detection logic live inside Jev itself?" — that's a real product question this audience can actually answer.

---

## 6. Directory / discoverability submissions

Low-effort, compounding backlinks + discovery surface. Do these once the repo is public and published to npm.

- [ ] **npm** itself — publishing is the biggest one; keywords are already set in package.json
- [ ] **GitHub topics** — add `llm`, `openai`, `anthropic`, `cli-tool`, `developer-tools`, `llmops`, `cost-optimization`, `code-analysis` to the repo settings
- [ ] **Awesome lists** — PR into `awesome-llmops`, `awesome-openai`, `sindresorhus/awesome-nodejs` (CLI tools section), search GitHub for "awesome llm tools" first to find the live list, don't guess a URL
- [ ] **Product Hunt** — optional; CLI dev tools do get traction here (e.g. dev-tool launches), needs a tagline + short demo GIF of the scan output
- [ ] **BetaList** / **TAAFT** (There's An AI For That) — lower priority, more consumer-facing, still free backlink
- [ ] **libhunt / npms.io** — index automatically once published, nothing to submit manually

Don't hand me URLs to guess — when you're ready for this step, paste the actual awesome-list repo links you want a PR against and I'll draft the PR entry.

---

## Before any of this goes out

- [ ] `npm publish` (currently unpublished — badges/install commands above will 404 until then)
- [ ] Push this repo to `https://github.com/akanthed/jev-migrate` (currently local-only)
- [ ] Rotate the OpenAI key used for the benchmark run — it was pasted in plaintext during development chat and should be treated as exposed even though it's not committed anywhere

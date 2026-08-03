# agents-tester.md for LocalStack for AWS Docs

This file is the verification counterpart to `agents.md`. Where the writer agent researches and drafts, this agent independently re-verifies what was produced. It does not trust the writer's audit trail as ground truth — it re-derives ground truth itself.

Read this file fully before reviewing any doc. Read `agents.md` too, so you know what the writer was supposed to do, but treat its conclusions as claims to check, not facts to inherit.

---

## Core Principle

**Re-verify, don't re-read.** If the writer's audit trail says "coverage.json confirms X is supported," that sentence is a claim, not evidence. Open coverage.json yourself and confirm X independently. If you only check that the writer's summary is internally consistent, you have added latency without adding signal.

**Report, don't fix.** This agent does not edit the doc under review. It produces a structured findings report. The writer revises based on findings, or a human decides. Silent fixes collapse the two-agent design back into one agent with extra steps, and destroy the audit trail of who caught what.

**Escalate ambiguity, don't resolve it.** If you can't verify a claim either way, that is a finding to escalate — not a pass, not a fail.

---

## How to Review a Docs Task

Follow this process for every review, in order. Do not skip steps.

### Step 1: Understand what was supposed to happen

Before checking anything, establish:

- Which **product** is this for? (AWS, Snowflake, Azure)
- What **type of doc** is this? (aws service doc, tutorial, configuration, getting-started, changelog entry, etc.)
- Was this an **update** to an existing doc or a **new doc**? Diff against the prior version if one exists.
- Is there a **Linear ticket** or writer audit trail to check claims against? Read it, but treat every claim in it as unverified until you've checked the source yourself.

### Step 2: Re-derive ground truth independently

Do not open the writer's cited sources expecting them to say what the writer claims. Open them cold, form your own read, then compare.

#### EXPLICIT HALT & CONSENT REQUIRED

If your independent research contradicts the doc, or if you find a conflict the writer's audit trail doesn't mention, do not silently mark it pass or fail and move on. Log it as a Blocking finding, state what you found vs. what the doc claims, and where the data thins out. Never resolve the discrepancy on the doc's behalf.

#### Verification Protocols by Doc Type

**For AWS service docs:**
1. **Re-parse LocalStack Coverage independently:** Open `src/data/coverage/<service>.json` yourself. Build your own list of supported / partially supported / missing operations. Then diff it against what the doc claims. Any mismatch is a Blocking finding.
2. **Check every command in the doc actually appears possible per coverage data.** A `lstk aws`, `lstk cdk`, or `lstk terraform` command exercising an operation marked unsupported is a Blocking finding (invented capability).
3. **Cross-Reference Live AWS Docs independently:** Look up the official AWS API reference for each operation mentioned. Confirm payload structures, required parameters, and described behavior match what the doc says — not what the writer's audit trail says it verified. This includes the CLI invocation itself: check each command's flags and arguments against the official [AWS CLI reference](https://docs.aws.amazon.com/cli/latest/reference/), not just that the underlying API operation exists.
4. **Audit the Ecosystem claims:** If the doc links to a `localstack-samples` repo or references a core-repo PR/issue, follow the link and confirm it exists, is not a placeholder, and actually demonstrates what the doc claims it does.

**For configuration or capability docs:**
1. Independently look up each environment variable or config flag mentioned in LocalStack's core source code or release notes. Confirm type, default value, and behavioral impact match the doc — flag any flag/variable you cannot find in source as Blocking (possible invention).
2. Check against sibling docs in `src/content/docs/aws/customization/` for consistency of terminology and structure.

**For tutorials:**
1. Mechanically walk the Prerequisites list against what the steps actually require. Missing a required tool, auth token, or Pro-plan flag is a Major finding.
2. **Live Link Audit:** Actually follow every linked sample repo and external asset. A broken or placeholder URL is a Blocking finding.
3. Confirm each step's stated command and expected output are plausible given the service's actual coverage data (cross-check against the Step 2 process for service docs where applicable).

#### MANDATORY VERIFICATION REPORT

For every doc you review, produce a Verification Report structured as follows:

```markdown
## Verification Report: <doc path>

### Findings
| # | Severity | Location | Finding | Independent Evidence |
|---|----------|----------|---------|----------------------|
| 1 | Blocking | Getting started, step 2 | Doc claims `CreateBucket` supports X; coverage.json shows unsupported | src/data/coverage/s3.json, key "CreateBucket.notes" |
...

### Sources Independently Checked
- Direct URLs to AWS docs you looked up yourself
- Coverage file paths and the exact fields you read
- Any repo links you followed and what you found

### Unverifiable Claims (Escalate)
- Claims you could not confirm or deny with available sources — do not guess

### Build Output
- Paste relevant `npm run build` errors/warnings, or confirm clean build

### Verdict
- PASS / PASS WITH MINOR FINDINGS / FAIL (blocking findings present) / ESCALATE (unverifiable conflict)
```

#### Anti-Hallucination Cross-Check

**Zero-Tolerance for Fictional APIs:** For every `lstk aws`/`lstk cdk`/`lstk terraform` command, CLI flag, config variable, or JSON field in the doc, confirm it exists in LocalStack source, docs, or coverage data. If you cannot find it independently, it is a Blocking finding — regardless of whether the writer's audit trail claims to have verified it.

### Step 3: Check against sibling doc conventions

Independently pull 2–3 comparable docs (same rule the writer used: `s3.mdx` / `lambda.mdx` for service docs, any doc in `aws/tutorials/` for tutorials). Confirm the doc under review actually matches structure, section order, and heading conventions — don't assume the writer's audit trail claim of "matched patterns" is accurate.

### Step 4: Verify writing style and tone compliance

Check against the Voice and Tone rules in `agents.md`:

- Second person, present tense, active voice — flag violations as Major.
- No filler openers ("In this section, we will explore...") — Minor.
- Limitations phrased factually and specifically, not vaguely — Major if a limitation is glossed over or missing entirely where coverage data indicates one exists.
- AWS concepts linked out rather than re-explained — Minor if AWS is re-explained at length instead of linked.

### Step 5: Run the real build

Run `npm run build` yourself. Do not accept the writer's claim that it passed — rerun it.

- Confirm all internal links are root-relative (`/aws/services/s3/`), not relative (`../../s3`). Grep for `](../` as a quick first pass, but confirm findings manually.
- Confirm frontmatter fields are all present in `src/content.config.ts`'s schema. An unknown field is Blocking (build error).
- If the doc was renamed/moved, confirm the old URL was added to `public/_redirects`. Missing redirect is Major.

### Step 6: Severity Categorization Reference

- **Blocking:** broken links, invalid frontmatter, invented CLI flags/APIs/config vars, factual contradictions with coverage data, build failures.
- **Major:** missing required sections (per doc-type template), tone/voice violations, unverified claims presented as fact, missing redirects on renamed docs, incomplete prerequisites in tutorials.
- **Minor:** style nits, inconsistent phrasing vs. sibling docs, filler language.

---

## Doc-Type Structural Checklists

Use these as literal checklists — mark each item present/absent, don't summarize impressionistically.

### Service doc checklist

- [ ] Introduction: 2–4 sentences on what the service does + what LocalStack lets you do + link to API coverage section
- [ ] Getting started: self-contained `lstk aws` walkthrough, real commands, real (verified) output
- [ ] At least one feature/behavior/limitation section with `:::note`/`:::tip` where relevant
- [ ] Resource Browser section present if the service has one (verify by checking the LocalStack Web App or asking, don't assume it's optional)
- [ ] Examples section links to `localstack-samples` (verify each link resolves)
- [ ] Ends with `<FeatureCoverage service="<service-id>" client:load />` and the service id matches an actual coverage file

### Tutorial checklist

- [ ] Introduction states the problem and what the reader builds
- [ ] Architecture diagram present if multiple services are involved
- [ ] Prerequisites bulleted, complete, Pro plan called out if actually required
- [ ] Steps use `###`, each with goal + command + expected output
- [ ] No "Summary" section at the end — ends on last step or "Next steps"

---

## Loop Structure

1. Writer drafts → this agent reviews → Verification Report produced.
2. Writer revises flagged Blocking and Major items.
3. This agent re-reviews only the changed sections plus anything structurally dependent on them (e.g., if coverage claims changed, recheck the coverage cross-reference).
4. Repeat steps 2–3 for at most 2 rounds.
5. If Blocking findings remain after round 2, or if an Unverifiable/Escalate finding exists at any point, stop the loop and escalate to a human with the full Verification Report history. Do not let the writer and tester loop indefinitely on a genuine ambiguity.

---

## What This Agent Never Does

- Never edits the doc directly.
- Never treats the writer's audit trail as a substitute for independent verification.
- Never silently resolves a factual conflict — every conflict is a logged finding.
- Never approves a doc with an open Blocking finding.
- Never invents a source to fill a citation gap — an unfindable source is an Unverifiable finding, not grounds to assume good faith.

---

## Reference

This agent shares the following from `agents.md` and should stay in sync with it if that file changes:

- Repository structure, tech stack, frontmatter schema table, component reference, build commands, and Key Gotchas.
- Doc-type templates (Service doc / Tutorial doc MDX skeletons) — used here as the structural checklist source, not re-duplicated in full.

If `agents.md` changes its templates, conventions, or gotchas, update the checklists in this file to match in the same PR.

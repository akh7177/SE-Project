export const REQUIREMENTS_PROMPT = `You extract software requirements from a scenario. You do not choose an SDLC.

Use only facts stated in the scenario. Leave out anything not stated: no assumptions, domain knowledge, technologies, regulations, security controls, acceptance criteria, or invented numbers. One action per requirement.

Risks: only those stated in the scenario or directly implied by a stated fact.

Capture these as constraints when present: team size/skill, timeline, budget, customer involvement (workshops, feedback), prototyping, requirement clarity/stability, risk, ability to split into modules.

Reply in exactly this format, with no other text:

## Summary
<one sentence>
## Constraints
- C1: <signal from scenario>
## Requirements
- R1: <short statement>
## Risks
- K1: <risk>

Example:
## Summary
Online library system for a small college.
## Constraints
- C1: Team of 3 junior developers
- C2: Deadline: 3 months
- C3: Requirements are clear and fixed
## Requirements
- R1: Students can search books.
- R2: Librarians can add books.
## Risks
- Junior team inexperience`;

export const SDLC_PROMPT = `You choose an SDLC model for a requirements document.

Use ONLY the text between "=== LECTURE NOTES START ===" and "=== LECTURE NOTES END ===" that follows the requirements. Do not use outside knowledge.

Models: Waterfall, V-Shaped, Prototype, Rapid Application Development, Spiral, Iterative.

Steps:
1. Read the Constraints (C#), Requirements (R#), and Risks (K#).
2. Match them against each model's "When to use" points in the lecture notes.
3. Identify the strongest matching "When to use" criteria for each model.
4. Select the model whose criteria are best supported by the document.
5. If multiple models match, prefer the model with distinctive criteria
that are explicitly present in the document and that are not shared by
the alternatives.

Reply in exactly this format, with no other text:

## Signals
- <C#/R#> -> <lecture criterion it matches>
## Chosen SDLC
<Model name>: <one short sentence>
## Runner-up
<Model name>: <one sentence: the criterion it misses or matches less>
## Workflow
<phases of the chosen model, copied exactly from the lecture notes, separated by " -> ">`;
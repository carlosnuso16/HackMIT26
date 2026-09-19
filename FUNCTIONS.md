# CommonGround Function Inventory

## Product promise

Help people affected by a rare condition make the research process more responsive to what they need, while helping clinical-trial teams design studies that people can realistically join and stay in.

This prototype uses fictional conditions and synthetic data only. It is not medical advice, a trial-matching service, or a clinical eligibility decision tool.

## Patient functions

### P1 Join a disease community

A person can enter a condition-specific space and understand the purpose, the fictional-data boundary, and what happens next.

### P2 Choose a public identity

A person can choose a pseudonymous alias and avatar. Their public activity is separated from their private health information.

### P3 Understand data boundaries

A person can see, in plain language, what is public, what is private, what becomes a grouped pattern, and what researchers cannot see.

### P4 Share study-relevant experience

A person can optionally provide structured information about symptoms, treatment context, mobility, travel, remote participation, and procedure preferences.

### P5 Confirm a meaningful boundary before sharing

A person can review a human-readable summary of what will be grouped and affirm that research interest is not consent or eligibility.

### P6 See a collective signal

A person can see how their contribution changes aggregate, privacy-protected community patterns.

### P7 Set research priorities

A person can rank the outcomes and questions they want research to address.

### P8 Participate in priority voting

A person can allocate a limited number of votes and see the community ranking update.

### P9 Discuss research safely

A person can share pseudonymous, moderated research-oriented comments without receiving or giving medical advice.

### P10 Control future contact and disclosure

A person can choose whether they are open to future research updates. Any individual contact or disclosure requires a separate, explicit opt-in.

## Researcher functions

### R1 See only aggregate cohort information

A researcher can view protected totals and distributions; never names, contact details, aliases connected to health data, row-level records, or exports.

### R2 Understand what matters to the community

A researcher can see ranked patient-reported outcomes and questions, with clear context that these are research priorities rather than treatment recommendations.

### R3 Understand participation constraints

A researcher can see grouped signals about travel, remote visits, wearables, procedure comfort, and common logistical barriers.

### R4 Compare study-burden scenarios

A researcher can change a fictional study design assumption and see how the grouped feasibility signal changes.

### R5 Receive a transparent design explanation

For each scenario, a researcher can see why the result changes and which community-level barriers it responds to. This is decision support, not an opaque score.

### R6 Prepare a study concept for review

A researcher can make a mock study-concept brief that names its burden, outcomes, assumptions, and anticipated community impact.

### R7 Send a concept into governance

A study concept moves through a visible sequence: researcher verification, patient-advisory review, ethics review, and then opt-in outreach. It never directly recruits people from the aggregate view.

## Shared safeguards

- Synthetic data is visible everywhere in the MVP.
- Values from groups smaller than five are hidden or combined.
- No medical advice, diagnosis verification, trial match, or final eligibility outcome.
- No public health profiles, ads, or sponsor messaging.
- No individual-level export or contact mechanism.
- Patients retain control of future disclosure.

## Recommended build order

1. P3 — plain-language data boundaries
2. P4 — private participation-preference form
3. P6 / R1 — protected aggregate signal
4. R4 / R5 — transparent study-burden scenario comparison
5. P7 / P8 — patient research priorities and voting
6. R6 / R7 — governed study-concept workflow
7. P2 / P9 / P10 — identity, discussion, and future opt-in

The first real feature should be P3 plus a minimal P4 form, because every later interaction depends on trustworthy data boundaries.

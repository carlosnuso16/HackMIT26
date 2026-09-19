# MVP Build Prompt v0: Rare Disease Research Community

Build a polished, demo-ready web application called **CommonGround** (working title): a patient-centered social research platform that helps people with a diagnosed rare disease form a privacy-preserving, trial-ready cohort and collectively communicate unmet research demand.

This is an MVP for a hackathon. Optimize for a convincing 90-second interactive demo, clear product thinking, emotional credibility, and excellent UI. Do not attempt production medical compliance, real patient verification, real EHR integration, actual clinical eligibility decisions, or real researcher access. Use synthetic data throughout and label it clearly.

## Product thesis

Rare-disease patients are geographically dispersed and often experience research as isolated individuals searching for studies. CommonGround lets verified patients join under public aliases, contribute structured eligibility-style information privately, and immediately see an aggregate portrait of what their community wants and could realistically participate in.

The platform reverses the usual recruitment model. Instead of exposing individual patients to recruiters, it lets a community become legible as a consent-aware research constituency. Researchers initially see only aggregated information. Individual contact or disclosure is outside this MVP and would always require explicit patient opt-in.

## Primary user

A person with a confirmed rare-disease diagnosis who wants to understand the research landscape, see whether others share their priorities and constraints, and contribute to a cohort that could make future research more feasible.

## Core user outcome

Within three minutes, the patient should be able to:

1. Enter a fictional disease community.
2. Understand the purpose and privacy model.
3. Create a public alias.
4. Complete a guided eligibility-style questionnaire.
5. Join the cohort.
6. See how their contribution changes the community's aggregate research-demand dashboard.
7. Vote on which symptoms or outcomes researchers should prioritize.

The emotional payoff is: **“I am rare, but I am not statistically invisible.”**

## Demo disease and data

Use a clearly fictional condition called **Aster Syndrome**, a progressive neuromuscular disorder. Seed the app with approximately 126 synthetic community members. Never imply these are real people.

Example disease characteristics:

- Variable age of onset
- Progressive muscle fatigue
- Episodic pain
- Reduced walking endurance
- Sleep disruption
- Speech or swallowing difficulty in a subset
- Genetic confirmation for some patients
- Patients distributed across multiple countries

Seed plausible but entirely synthetic aggregate data. Include enough variation that the new demo user's answers visibly alter at least one chart, count, or priority ranking.

## Core experience

### 1. Landing page

Create a concise landing page with:

- Headline: “Rare does not have to mean invisible.”
- Supporting line explaining that patients can organize around shared research priorities without exposing individual medical profiles.
- Primary CTA: “Enter the Aster community.”
- A compact trust statement: synthetic demo, private-by-default health answers, aggregate researcher view.
- A preview showing community size, countries represented, and top research priority.

Avoid generic hospital imagery and corporate pharmaceutical aesthetics. The visual identity should feel humane, optimistic, credible, and community-owned.

### 2. Identity and verification simulation

Simulate patient verification without collecting real documents. Show that the account is “verified for demo” and allow the user to select a public alias and simple avatar.

Explain the separation clearly:

- Public: alias, avatar, optional general introduction, votes and discussion activity.
- Private: detailed symptoms, diagnosis information, medications, laboratory information, and participation constraints.
- Researcher-visible: aggregated cohort statistics only.

### 3. Guided health and participation questionnaire

Use a multi-step form with a progress indicator. Keep the language plain and respectful.

Collect synthetic fields in the following sections:

1. Diagnosis
   - Age range
   - Year diagnosed
   - Diagnosis confirmation type: clinical, genetic, other
   - Disease subtype if known

2. Current experience
   - Symptoms experienced
   - Severity for each selected symptom
   - Approximate progression: stable, slowly progressing, rapidly progressing, uncertain
   - Mobility status

3. Treatment context
   - Current treatment categories
   - Prior trial participation
   - Broad comorbidity categories

4. Research participation preferences
   - Willingness to join observational research
   - Willingness to consider interventional trials
   - Maximum travel frequency
   - Maximum travel distance
   - Comfort with remote visits
   - Comfort with wearables
   - Comfort with genetic data
   - Procedures the user would or would not consider

5. Research priorities
   - Rank the three outcomes that matter most
   - Example outcomes: walking endurance, fatigue, pain, independence, sleep, communication, slowing progression

Before submission, provide a readable summary and show exactly which information becomes aggregated. Require an explicit fictional-demo consent checkbox.

### 4. Join-community reveal

After submission, transition into a visually satisfying reveal:

- “You are member 127 of the Aster research community.”
- Show how the user's selected priorities compare with the cohort.
- Animate one aggregate count or chart changing because they joined.
- Do not display an eligibility verdict or imply guaranteed access to treatment.

### 5. Community research-demand dashboard

This is the centerpiece of the MVP. Show aggregate information such as:

- Total verified synthetic members
- Members open to being notified about research
- Members open to observational studies
- Members willing to consider interventional trials
- Geographic distribution
- Remote participation preference
- Travel feasibility
- Most important patient-reported outcomes
- Common participation barriers
- Broad diagnostic-confirmation distribution
- Data completeness indicator

Do not create a mysterious single “patient value” or “trial readiness” score. If a combined readiness indicator is shown, explain its components and label it as cohort feasibility rather than individual eligibility.

Suppress or generalize small cells to model re-identification protection. For the demo, display a note such as “Values below five are grouped to protect members.”

### 6. Research-priority voting

Patients can allocate three votes among proposed research questions or outcomes. Seed proposals such as:

- What causes day-to-day fatigue variability?
- Can home-based monitoring measure disease progression?
- Which intervention best preserves walking endurance?
- What improves sleep disruption?

After voting, update the aggregate ranking. Allow a short pseudonymous discussion thread beneath each priority. Use seeded synthetic comments to make the community feel active.

Keep this feature focused on research priorities, not treatment recommendations or unmoderated medical advice.

### 7. Researcher preview

Include a toggle or separate route labeled “Researcher preview.” This is not the primary user experience.

The researcher can see:

- Aggregated cohort characteristics
- Ranked community priorities
- Broad participation feasibility
- Major logistical barriers
- A hypothetical protocol-fit comparison

The researcher cannot see:

- Names or aliases tied to health data
- Individual medical profiles
- Contact information
- Row-level exports

Include a mock “Propose a study” button, but it may open a simple modal explaining that proposals would require verification, community review, ethics review, and opt-in outreach. Do not build full study submission.

## Primary demo sequence

The intended live demo should follow this path:

1. Open the landing page and establish the problem.
2. Enter the fictional Aster Syndrome community.
3. Select an alias and complete a shortened version of the questionnaire using prefilled demo answers.
4. Review the privacy summary and join.
5. Reveal that the user became member 127.
6. Show their contribution changing the community's top priority or remote-participation statistic.
7. Cast a vote on a research question.
8. Switch to researcher preview and show that the cohort is visible while individuals remain private.

The entire happy path should work without login credentials, external APIs, uploads, or network-dependent data.

## Information architecture

Provide these routes or views:

- `/` — landing page
- `/community/aster` — community overview
- `/join` — alias and guided questionnaire
- `/community/aster/demand` — aggregate research-demand dashboard
- `/community/aster/priorities` — priority voting and discussion
- `/researcher-preview` — aggregate researcher view
- `/privacy` — concise visual explanation of the data boundaries

## Design direction

- Warm editorial design rather than a sterile medical dashboard
- High legibility and accessible contrast
- Responsive on laptop and mobile
- Calm palette with one vivid community accent color
- Rounded but not childish components
- Subtle map, cohort, constellation, or collective-signal motifs
- Charts must include labels and explanatory sentences
- Avoid gamifying disease severity or comparing who is “sicker”
- Avoid stock photos of distressed patients
- Use motion sparingly for the cohort-join reveal and updated aggregates

## Safety and trust requirements

Display these concepts throughout the product in plain language:

- This hackathon experience uses fictional disease and patient data.
- The application does not provide medical advice.
- It does not determine final clinical-trial eligibility.
- Expressing research interest is not informed consent.
- Researcher access is aggregate-only in the MVP.
- Patients control any future individual disclosure.
- Community discussion is not a substitute for a clinician.

Do not allow advertisements, direct sponsor messaging, public individual health profiles, or ranking patients by desirability.

## Technical scope

Build as a modern single-page web application using the existing project stack. If no stack exists, use React, TypeScript, and a lightweight styling system. Keep data local and deterministic using seeded JSON or in-memory state. Persist the demo user's progress in local storage so refreshes do not destroy the demo.

Create reusable components for:

- Navigation
- Privacy badges
- Questionnaire stepper
- Symptom and preference selectors
- Aggregate statistic cards
- Research-priority voting cards
- Accessible charts
- Discussion threads
- Researcher preview panels
- Demo/synthetic-data banner

No production backend, authentication provider, medical-record integration, payment system, or real health data is required.

## Acceptance criteria

The MVP is complete when:

- A user can complete the full happy path without errors.
- All displayed patients and statistics are explicitly synthetic.
- The questionnaire produces a structured profile in application state.
- Submission changes at least one visible community aggregate.
- The user can vote and see the ranking update.
- The researcher preview exposes only aggregate data.
- Privacy boundaries are understandable without reading legal text.
- Empty, loading, success, and validation states are handled.
- The experience is polished enough for a 90-second live demonstration.

## Non-goals

Do not build:

- Real diagnosis verification
- Real trial matching
- Final eligibility determination
- Real patient recruitment
- Direct messaging between sponsors and patients
- EHR or FHIR integration
- Genetic-data ingestion
- Clinical decision support
- A marketplace that lets researchers bid for patients

## Product questions intentionally left open for the next refinement

1. Should the recurring social action be research-priority voting, symptom updates, trial-experience sharing, or research discussion?
2. Should the demo use a fictional condition or a carefully sourced real rare disease?
3. Is community research demand best communicated through willingness counts, outcome rankings, logistical feasibility, or a transparent combination?
4. What level of moderation and advocacy-organization governance should be represented?
5. Should the product eventually match existing trials, solicit new studies, or do both?

Start by implementing the complete patient happy path and aggregate dashboard. Prioritize a coherent experience over feature quantity. When tradeoffs arise, preserve patient agency, privacy, and clarity.

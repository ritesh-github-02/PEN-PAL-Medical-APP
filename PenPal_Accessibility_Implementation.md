# PenPal --- Accessibility Compliance & Implementation Guide

**Project:** PenPal\
**Framework:** Next.js\
**Target:** WCAG 2.1 Level AA\
**Updated:** August 2026

## 1. Purpose

This document is the implementation plan for making PenPal accessible to
people with disabilities. It incorporates the requirements from the
supplied accessibility brief:

-   100% keyboard accessibility for buttons, quiz toggles, S.T.O.R.Y
    sliders, questionnaire cards, and modals.
-   Screen-reader-ready semantic HTML and ARIA.
-   Minimum 4.5:1 contrast for normal text.
-   On-screen transcripts for audio narration.
-   Modal focus management, Escape support, and no unintended keyboard
    traps.

Accessibility must be implemented at the component level and then
verified at page and whole-site level. Automated scans are useful but do
not by themselves prove WCAG conformance.

## 2. U.S. ADA / WCAG Context

WCAG is a W3C technical accessibility standard; the ADA is U.S.
civil-rights law. They should not be treated as interchangeable.

For covered U.S. state and local government entities, the DOJ Title II
web/mobile rule specifies **WCAG 2.1 Level AA** as the technical
standard. The exact legal obligations and deadlines depend on the
organization and deployment, so PenPal's institution should confirm
applicability with its accessibility/legal team.

**Engineering target for PenPal:** WCAG 2.1 Level AA.

## 3. Accessibility Architecture

``` text
                    PENPAL ACCESSIBILITY
                           |
          +----------------+----------------+
          |                |                |
       DESIGN           COMPONENT         QA / CI
          |                |                |
   Colors / type      Buttons / forms    Automated tests
   Focus styles       Modals / sliders   Keyboard tests
   Motion             Quiz / cards       Screen readers
   Spacing            Navigation         Contrast tests
          |                |                |
          +----------------+----------------+
                           |
                    WCAG 2.1 AA TARGET
```

### Design layer

Define accessible color tokens, typography, focus indicators, button
states, form states, spacing, and reduced-motion rules.

### Component layer

Create reusable accessible components:

-   Button
-   Link
-   Modal/Dialog
-   Accordion
-   Quiz option
-   S.T.O.R.Y slider
-   Questionnaire card
-   Text input
-   Checkbox/radio
-   Audio player + transcript
-   Navigation

### QA layer

Run linting, automated accessibility scans, keyboard tests,
screen-reader tests, contrast tests, zoom/reflow tests, and
reduced-motion tests.

------------------------------------------------------------------------

# 4. Keyboard Accessibility

Important WCAG 2.1 criteria include **2.1.1 Keyboard**, **2.1.2 No
Keyboard Trap**, **2.1.3 Keyboard (No Exception)**, **2.4.3 Focus
Order**, and **2.4.7 Focus Visible**.

Every interactive PenPal feature must be usable without a mouse.

  Component     Expected keyboard
  ------------- -----------------------------------------
  Button        Enter / Space
  Link          Enter
  Checkbox      Space
  Radio group   Arrow keys where applicable
  Slider        Arrow keys, Home, End
  Modal         Tab, Shift+Tab, Escape
  Accordion     Enter / Space
  Tabs          Arrow keys according to the tab pattern

### Use native HTML first

Good:

``` tsx
<button type="button" onClick={startQuiz}>
  Start Quiz
</button>
```

Avoid making a `<div>` behave like a button. Native controls provide
correct keyboard and accessibility semantics automatically.

### Focus

Never remove the focus outline without replacing it.

``` css
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 3px;
}
```

Avoid positive `tabindex` values such as `tabindex="5"`. Normally use
native focus behavior, `tabIndex={0}`, or `tabIndex={-1}` only when
programmatic focus is needed.

------------------------------------------------------------------------

# 5. Quiz Toggles

If a quiz option is a toggle, use a real button:

``` tsx
<button
  type="button"
  aria-pressed={selected}
  onClick={() => setSelected(!selected)}
>
  Option A
</button>
```

If the options are mutually exclusive, use radio-button semantics
instead.

Test:

``` text
Tab → reaches option
Enter / Space → activates
Screen reader → announces name and state
Focus → visibly indicated
```

------------------------------------------------------------------------

# 6. S.T.O.R.Y Slider

Prefer a native range input:

``` tsx
<label htmlFor="story-progress">
  Story progress
</label>

<input
  id="story-progress"
  type="range"
  min={0}
  max={100}
  value={progress}
  onChange={(e) => setProgress(Number(e.target.value))}
/>
```

Expected keyboard behavior:

-   Arrow Left/Down: decrease.
-   Arrow Right/Up: increase.
-   Home: minimum.
-   End: maximum.

If a custom slider is unavoidable, follow the WAI-ARIA slider pattern
and expose the accessible name and value (`role="slider"`,
`aria-valuemin`, `aria-valuemax`, `aria-valuenow`) plus complete
keyboard behavior.

------------------------------------------------------------------------

# 7. Semantic HTML and Screen Readers

Prefer:

``` html
<header>
<nav>
<main>
<section>
<article>
<footer>
<h1>
<h2>
<button>
<a>
<form>
<label>
```

Example:

``` tsx
<main>
  <section aria-labelledby="quiz-heading">
    <h1 id="quiz-heading">Medication Safety Quiz</h1>
  </section>
</main>
```

Every page should have a meaningful title, a logical heading hierarchy,
and meaningful landmarks.

Do not use headings only because they look large; use CSS for visual
sizing.

------------------------------------------------------------------------

# 8. Nurse Anna Images, Illustrations, and Icons

Meaningful images need meaningful alternative text.

``` tsx
<Image
  src="/nurse-anna.png"
  width={500}
  height={500}
  alt="Nurse Anna explaining medication safety"
/>
```

Decorative images:

``` tsx
<Image
  src="/decorative-shape.svg"
  width={200}
  height={100}
  alt=""
/>
```

Do not use `alt="image"` unless that is genuinely useful.

For an icon-only button:

``` tsx
<button type="button" aria-label="Open settings">
  <SettingsIcon aria-hidden="true" />
</button>
```

Never put `aria-hidden="true"` on a focusable control.

------------------------------------------------------------------------

# 9. Navigation

Use semantic navigation:

``` tsx
<nav aria-label="Primary navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/stories">Stories</a></li>
    <li><a href="/resources">Resources</a></li>
  </ul>
</nav>
```

For a mobile menu:

``` tsx
<button
  type="button"
  aria-expanded={isOpen}
  aria-controls="mobile-navigation"
  aria-label={isOpen ? "Close navigation" : "Open navigation"}
  onClick={() => setIsOpen(!isOpen)}
>
  <MenuIcon aria-hidden="true" />
</button>
```

Test keyboard access, expanded/collapsed state, focus order, Escape
behavior where applicable, and focus restoration.

------------------------------------------------------------------------

# 10. Modal and Focus Management

When a modal opens:

1.  Save the element that opened it.
2.  Move focus into the modal.
3.  Keep Tab/Shift+Tab inside the modal while it is modal.
4.  Provide an accessible name.
5.  Provide a visible close button.
6.  Support Escape.
7.  Prevent interaction with the underlying page.
8.  On close, return focus to the opener.

Example:

``` tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">Quiz Results</h2>

  <button type="button">
    Continue
  </button>

  <button type="button">
    Close
  </button>
</div>
```

For production, use one well-tested modal/focus-management
implementation rather than creating separate focus traps for every
feature.

Flow:

``` text
Open button
    ↓
Save current focus
    ↓
Open modal
    ↓
Move focus inside
    ↓
Tab / Shift+Tab remain inside
    ↓
Escape / Close
    ↓
Close modal
    ↓
Restore focus to opener
```

------------------------------------------------------------------------

# 11. Forms and Questionnaire Cards

Every input must have a programmatically associated label:

``` tsx
<label htmlFor="first-name">First name</label>
<input id="first-name" name="firstName" type="text" />
```

Help text:

``` tsx
<p id="first-name-help">
  Enter the name you want Nurse Anna to use.
</p>

<input
  id="first-name"
  aria-describedby="first-name-help"
/>
```

Error:

``` tsx
<p id="first-name-error" role="alert">
  Please enter your first name.
</p>

<input
  id="first-name"
  aria-invalid={hasError}
  aria-describedby="first-name-error"
/>
```

Do not communicate errors using red color alone.

If a questionnaire card is interactive, prefer a button or link instead
of a clickable `<div>`.

------------------------------------------------------------------------

# 12. Color Contrast

For WCAG 2.1 AA:

-   Normal text: minimum **4.5:1**.
-   Large text: minimum **3:1**.
-   Relevant non-text UI/focus indicators must also satisfy applicable
    contrast requirements.

Create design tokens and test the actual foreground/background
combinations:

``` css
:root {
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-background: #ffffff;
  --color-primary: #4f46e5;
  --color-focus: #005fcc;
  --color-error: #b91c1c;
  --color-success: #166534;
}
```

These are example values; verify PenPal's final colors with a contrast
checker.

Do not use color as the only way to communicate status:

``` text
✓ Correct
✕ Incorrect
```

is better than green/red alone.

------------------------------------------------------------------------

# 13. Resize, Reflow, and Responsive Accessibility

Test:

-   200% text/zoom.
-   Small mobile viewport.
-   Tablet.
-   Desktop.
-   Large desktop.
-   Long content.
-   Long error messages.

Avoid fixed heights that clip text.

Prefer:

``` css
min-height: 200px;
height: auto;
```

instead of fixed-height content containers that can hide text.

Ensure focus indicators are not clipped and fixed headers do not cover
focused elements.

------------------------------------------------------------------------

# 14. Audio, Video, and Transcripts

The PenPal requirement is that every audio narration has matching
on-screen text.

Example:

``` tsx
<section aria-labelledby="audio-title">
  <h2 id="audio-title">Nurse Anna Introduction</h2>

  <audio controls>
    <source src="/audio/introduction.mp3" type="audio/mpeg" />
  </audio>

  <details>
    <summary>Read transcript</summary>
    <p>Hello. I'm Nurse Anna...</p>
  </details>
</section>
```

The transcript must accurately communicate the meaningful spoken
information.

For video, provide captions where applicable and do not communicate
important information through audio alone.

------------------------------------------------------------------------

# 15. Reduced Motion

Respect the user's operating-system preference:

``` css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Review Nurse Anna animations, page transitions, sliders, loaders, and
decorative effects.

------------------------------------------------------------------------

# 16. Next.js Architecture

Recommended structure:

``` text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── components/
│   ├── accessibility/
│   │   ├── AccessibleModal.tsx
│   │   └── SkipLink.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── quiz/
│   │   ├── Quiz.tsx
│   │   └── QuizOption.tsx
│   ├── story/
│   │   └── StorySlider.tsx
│   └── nurse-anna/
│       └── NurseAnna.tsx
├── styles/
│   └── accessibility.css
└── tests/
    └── accessibility/
```

Build accessibility into reusable components rather than fixing the same
issue separately on every page.

------------------------------------------------------------------------

# 17. Skip Link

``` tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

``` tsx
<main id="main-content">
  ...
</main>
```

``` css
.skip-link {
  position: absolute;
  left: 1rem;
  top: -100px;
  z-index: 9999;
}

.skip-link:focus {
  top: 1rem;
}
```

------------------------------------------------------------------------

# 18. Next.js Page Titles

For App Router:

``` tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medication Safety | PenPal",
  description: "Accessible medication safety resources.",
};
```

Use unique, descriptive titles for pages. This also helps assistive
technology understand client-side route changes.

------------------------------------------------------------------------

# 19. Next.js Images

Use `next/image` where appropriate:

``` tsx
import Image from "next/image";

<Image
  src="/nurse-anna.png"
  width={600}
  height={600}
  alt="Nurse Anna discussing medication safety"
/>
```

Use `alt=""` for purely decorative images.

------------------------------------------------------------------------

# 20. ESLint / Static Accessibility Checks

Use the current Next.js ESLint configuration and
`eslint-plugin-jsx-a11y` support to catch issues such as missing image
alt text and invalid ARIA usage.

Typical command:

``` bash
npm run lint
```

If ESLint is not configured:

``` bash
npm install -D eslint eslint-config-next
```

Do not replace an existing working ESLint configuration blindly;
integrate the accessibility rules into the existing setup.

------------------------------------------------------------------------

# 21. Reusable Accessible Components

### Button

``` tsx
type ButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
    />
  );
}
```

### Toggle

``` tsx
<button
  type="button"
  aria-pressed={enabled}
  onClick={() => setEnabled(v => !v)}
>
  {enabled ? "Enabled" : "Disabled"}
</button>
```

### Accordion

``` tsx
<button
  type="button"
  aria-expanded={isOpen}
  aria-controls="panel-1"
  onClick={() => setIsOpen(!isOpen)}
>
  Medication instructions
</button>

<div id="panel-1" hidden={!isOpen}>
  ...
</div>
```

Centralize these patterns so future PenPal components inherit accessible
behavior.

------------------------------------------------------------------------

# 22. Dynamic Content and Errors

For asynchronous updates, use live regions carefully:

``` tsx
<div aria-live="polite">
  {loading ? "Loading your results…" : results}
</div>
```

For important errors:

``` tsx
<div role="alert">
  We couldn't save your answer. Please try again.
</div>
```

Do not make the entire page a live region.

------------------------------------------------------------------------

# 23. Accessibility Testing

Use multiple layers:

``` text
                    TESTING
                       |
          +------------+------------+
          |            |            |
        Static      Automated     Manual
          |            |            |
       ESLint       axe/scan     Keyboard
       Review       Playwright    Screen reader
                                  Contrast
                                  Zoom/reflow
                                  Motion
```

Recommended tools:

-   `eslint-plugin-jsx-a11y`
-   axe / axe-core
-   Playwright
-   Browser accessibility tools
-   Contrast checker

Automated testing is necessary but not sufficient.

------------------------------------------------------------------------

# 24. Keyboard Test Procedure

For every important page:

1.  Ignore the mouse.
2.  Start at the top.
3.  Press `Tab` through the page.
4.  Verify every interactive element is reachable.
5.  Use `Shift+Tab` backward.
6.  Use Enter/Space where applicable.
7.  Use Arrow keys on sliders/radio groups.
8.  Use Escape on dialogs/overlays.
9.  Verify focus is always visible.
10. Verify no unintended keyboard trap exists.

Test at least:

-   Navigation.
-   Quiz.
-   S.T.O.R.Y.
-   Questionnaire.
-   Nurse Anna interactions.
-   Audio.
-   Modal dialogs.
-   Footer.

------------------------------------------------------------------------

# 25. Screen Reader Test Procedure

Recommended:

-   Windows: NVDA + Chrome/Firefox/Edge.
-   macOS/iOS: VoiceOver + Safari.
-   Android: TalkBack + Chrome.

Verify:

-   Page title.
-   Heading structure.
-   Landmarks.
-   Buttons and links.
-   Image alternatives.
-   Form labels.
-   Errors.
-   Quiz selected state.
-   Slider value.
-   Modal name and focus.
-   Transcript.
-   Dynamic updates.

------------------------------------------------------------------------

# 26. Contrast Test

Maintain a project audit table:

  Foreground        Background        Usage           Ratio Status
  ----------------- ----------------- ------------- ------- --------
  Primary text      Page background   Body              TBD Test
  Secondary text    Page background   Secondary         TBD Test
  Button text       Button            Primary CTA       TBD Test
  Error text        Background        Errors            TBD Test
  Focus indicator   Background        Focus             TBD Test

Never mark a combination compliant until the final rendered combination
has been checked.

------------------------------------------------------------------------

# 27. PenPal Accessibility Matrix

  ----------------------------------------------------------------------------------
  Component       Keyboard     Screen      Contrast    Focus       State/Error
                               Reader                              
  --------------- ------------ ----------- ----------- ----------- -----------------
  Header          Required     Required    Required    Required    N/A

  Navigation      Required     Required    Required    Required    Expanded state

  Button          Required     Required    Required    Required    Disabled/state

  Quiz            Required     Required    Required    Required    Selected/result

  S.T.O.R.Y       Arrow keys   Required    Required    Required    Value
  Slider                                                           

  Questionnaire   Required     Required    Required    Required    Validation

  Modal           Tab/Escape   Required    Required    Required    Open/close

  Nurse Anna      N/A          Alt         N/A         N/A         N/A
  image                                                            

  Audio           Required     Required    Required    Required    Playback

  Transcript      Required     Required    Required    Required    N/A

  Accordion       Required     Required    Required    Required    Expanded
  ----------------------------------------------------------------------------------

------------------------------------------------------------------------

# 28. Definition of Done

A feature is accessibility-complete only when:

### Keyboard

-   [ ] All interactive elements are reachable.
-   [ ] Focus order is logical.
-   [ ] Enter/Space work where required.
-   [ ] Arrow keys work for applicable widgets.
-   [ ] Escape works for applicable overlays.
-   [ ] No unintended keyboard traps.
-   [ ] Focus is visible.

### Screen reader

-   [ ] Page title is meaningful.
-   [ ] Heading hierarchy is logical.
-   [ ] Landmarks are correct.
-   [ ] Meaningful images have useful alt text.
-   [ ] Decorative images have empty alt.
-   [ ] Buttons and links have accessible names.
-   [ ] Forms have labels.
-   [ ] Errors are associated and announced appropriately.
-   [ ] Dynamic states are exposed.

### Visual

-   [ ] Normal text contrast is at least 4.5:1.
-   [ ] Large text contrast is at least 3:1.
-   [ ] Applicable UI/focus contrast requirements pass.
-   [ ] Color is not the only communication method.
-   [ ] Resize/reflow is tested.

### Media

-   [ ] Audio transcripts exist.
-   [ ] Video captions exist where applicable.
-   [ ] Media controls are keyboard accessible.

### Modals

-   [ ] Initial focus is correct.
-   [ ] Focus stays inside while modal is modal.
-   [ ] Escape works where appropriate.
-   [ ] Close control is accessible.
-   [ ] Background is not interactable.
-   [ ] Focus returns to the opener.

### Testing

-   [ ] ESLint passes.
-   [ ] Automated accessibility scans pass or have documented
    exceptions.
-   [ ] Keyboard-only test passes.
-   [ ] Screen-reader test passes.
-   [ ] Contrast test passes.
-   [ ] Mobile/reflow test passes.
-   [ ] Reduced-motion test passes.

------------------------------------------------------------------------

# 29. Implementation Roadmap

## Phase 1 --- Foundation

1.  Confirm legal/accessibility target with the organization.
2.  Establish WCAG 2.1 AA as the engineering target.
3.  Configure ESLint accessibility checks.
4.  Create color tokens.
5.  Create global focus styles.
6.  Add skip link.
7.  Establish semantic page structure.

## Phase 2 --- Components

8.  Button.
9.  Link.
10. Input.
11. Checkbox/Radio.
12. Accordion.
13. Modal.
14. Slider.
15. Audio + transcript.

## Phase 3 --- PenPal Features

16. Navigation.
17. Nurse Anna.
18. Quiz.
19. S.T.O.R.Y.
20. Questionnaire.
21. Results.
22. Audio narration.
23. Remaining interactive features.

## Phase 4 --- QA

24. ESLint.
25. Automated scans.
26. Keyboard-only testing.
27. NVDA.
28. VoiceOver/TalkBack as applicable.
29. Contrast audit.
30. Zoom/reflow.
31. Reduced motion.

## Phase 5 --- Release

32. Fix critical/high issues.
33. Document exceptions.
34. Run regression tests.
35. Complete final accessibility review.
36. Keep accessibility tests in CI for future releases.

------------------------------------------------------------------------

# 30. Git Workflow

``` text
Accessibility issue
       ↓
Identify WCAG criterion
       ↓
Identify PenPal component
       ↓
Implement reusable fix
       ↓
Lint + automated test
       ↓
Keyboard test
       ↓
Screen-reader test
       ↓
Code review
       ↓
Merge
       ↓
Regression test
```

Suggested branches:

``` text
accessibility/keyboard-navigation
accessibility/modal-focus
accessibility/quiz
accessibility/story-slider
accessibility/forms
accessibility/audio-transcripts
accessibility/color-contrast
```

Suggested commit:

``` text
fix(a11y): make quiz controls keyboard accessible
```

------------------------------------------------------------------------

# 31. Accessibility Issue Template

``` text
Title:
[Accessibility] <component> - <problem>

WCAG:
<criterion number and name>

Severity:
Critical / High / Medium / Low

Component:
<PenPal component>

Current behavior:
<what happens now>

Expected behavior:
<what should happen>

Keyboard:
<required interaction>

Screen reader:
<expected announcement>

Implementation:
<technical solution>

Testing:
<how it was tested>

Status:
Open / In Progress / Fixed / Verified
```

------------------------------------------------------------------------

# 32. Example End-to-End Fix

### Before

``` tsx
<div onClick={() => selectAnswer(answer)}>
  {answer.text}
</div>
```

### After

``` tsx
<button
  type="button"
  aria-pressed={selected}
  onClick={() => selectAnswer(answer)}
>
  {answer.text}
</button>
```

### Verification

``` text
Tab → reaches answer
Enter/Space → selects answer
Screen reader → announces answer and state
Focus → clearly visible
```

------------------------------------------------------------------------

# 33. Recommended Release Gate

A PenPal release should not be called accessibility-ready based only on
an automated score.

Minimum evidence:

1.  Code/lint checks.
2.  Automated accessibility scans.
3.  Keyboard-only testing.
4.  Screen-reader testing.
5.  Contrast testing.
6.  Responsive/reflow testing.
7.  Reduced-motion testing.
8.  Manual task testing.
9.  Documented exceptions and owners.

Accessibility is a continuous engineering requirement, not a one-time
final QA task.

------------------------------------------------------------------------

# 34. Official References

-   W3C WCAG 2.1: https://www.w3.org/TR/WCAG21/
-   W3C WAI-ARIA Overview:
    https://www.w3.org/WAI/standards-guidelines/aria/
-   W3C ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
-   W3C Keyboard Interface Guidance:
    https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
-   W3C Modal Dialog Pattern:
    https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
-   W3C Slider Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/slider/
-   U.S. DOJ ADA Web Rule:
    https://www.ada.gov/resources/2024-03-08-web-rule/
-   U.S. DOJ Small Entity Compliance Guide:
    https://www.ada.gov/resources/small-entity-compliance-guide/
-   Next.js Accessibility:
    https://nextjs.org/docs/architecture/accessibility
-   Next.js Accessibility Guide:
    https://nextjs.org/learn/dashboard-app/improving-accessibility

------------------------------------------------------------------------

## Final Note

This is an engineering implementation guide, not legal advice or a legal
certification of ADA compliance. For a U.S. deployment, PenPal's
organization should confirm the specific legal requirements that apply
to its institution.

**Engineering acceptance target: WCAG 2.1 Level AA.**

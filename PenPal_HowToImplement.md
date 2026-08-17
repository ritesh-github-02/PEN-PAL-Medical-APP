# Accessibility Documentation – PenPal & Control Group

**Standard:** WCAG 2.1 Level AA

## 1. Purpose

The goal is to make both websites easy to use for people with disabilities. Users should be able to understand the content and use the website whether they use a mouse, keyboard, screen reader, captions, or other assistive technology.

## 2. Main Accessibility Requirements

### Keyboard Navigation
All important parts of the website should work using a keyboard.

This includes:
- Navigation
- Buttons and links
- Forms
- Questionnaires
- Quiz controls
- S.T.O.R.Y slider
- Audio controls
- Modals

Keyboard focus should always be visible, and users should not get stuck inside any part of the website.

### Screen Readers
The website should have a clear structure that screen readers can understand.

Headings, buttons, links, forms, images, and interactive controls should have clear names and purposes.

### Color Contrast
Text and important interface elements should have enough contrast against their background.

For WCAG 2.1 AA, normal text should generally have a contrast ratio of at least **4.5:1**.

Color should not be the only way to communicate an error, status, or other information.

### Images
Informative images and illustrations should have suitable alternative text.

Decorative images should not add unnecessary information for screen reader users.

### Audio and Captions
Important audio should have a text transcript.

If video is used, captions should be provided so users who cannot hear the audio can understand the content.

### Forms and Errors
Forms should have clear labels and instructions.

When something is entered incorrectly, the user should be told what went wrong and how to correct it.

### Modals
When a modal opens, keyboard focus should move to the modal.

Users should be able to close it, including with the **Escape** key where appropriate. Focus should return to a logical place after it closes.

### Interactive Content
Interactive features should be usable without relying only on a mouse.

For PenPal, this is especially important for:
- Questionnaires
- Quizzes
- S.T.O.R.Y slider
- Progress information
- Audio controls
- Study navigation

### Responsive Accessibility
The websites should remain usable on mobile, tablet, laptop, and desktop screens.

Content should remain readable when users zoom in or increase text size.

### Motion
Animations should not make the website difficult to use. The website should respect users who prefer reduced motion.

## 3. PenPal

The main focus for PenPal is making the complete study journey accessible.

A participant should be able to:
- Enter the study
- Read instructions
- Complete questionnaires
- Use the quiz
- Use the S.T.O.R.Y slider
- Navigate between steps
- Understand errors
- Access audio information through text when needed
- Complete the study without being dependent on a mouse or sight

## 4. Control Group

For Control Group, accessibility should cover the main website experience:

- Navigation
- Headings and page structure
- Links and buttons
- Images
- Forms
- Color contrast
- Keyboard access
- Screen readers
- Responsive layouts
- Any interactive elements

## 5. Testing

Accessibility should be checked during development, not only at the end.

Testing should include:
- Keyboard-only testing
- Screen reader testing
- Color contrast testing
- Mobile and responsive testing
- Zoom testing
- Form and modal testing
- Testing of PenPal's questionnaire, quiz, and S.T.O.R.Y features

Automated tools can help find issues, but manual testing is also needed.

## 6. Final Goal

The final goal is simple: a person with a disability should be able to use PenPal and Control Group without being blocked by the website design or interaction.

Accessibility should be considered whenever new pages, components, or features are added.

**Target: WCAG 2.1 Level AA**

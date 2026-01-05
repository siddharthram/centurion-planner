# Personal OS - Content Repository

This repository contains all the **content** for Personal OS — templates, frameworks, interview scripts, and guides for intentional living across all areas of life.

This content is **platform-agnostic** and can be consumed by:
- The web app (`personal-os-web`)
- A CLI tool
- A mobile app
- Static site generators
- The original markdown file system

---

## Purpose

Personal OS helps you:
- **Reflect regularly** through daily and weekly check-ins
- **Set meaningful goals** across career, relationships, health, meaning, finances, and fun
- **Review quarterly and annually** to track progress and course-correct
- **Capture patterns** about yourself to make better decisions

Separating content from code allows:
- **Non-technical editing**: Content creators can edit templates without touching code
- **Version control**: Track changes to frameworks and templates separately
- **Reusability**: Use the same content across web, CLI, mobile
- **Localization**: Add translations without changing app code

---

## Content Structure

```
personal-os-content/
├── templates/              ← User-facing templates (what users fill out)
│   ├── daily.md           ← 5-minute daily check-in
│   ├── weekly.md          ← 20-minute weekly review
│   ├── quarterly.md       ← 90-minute quarterly review
│   ├── annual.md          ← Half-day annual review
│   ├── north_star.md      ← Core purpose and values
│   ├── principles.md      ← Operating principles
│   └── memory.md          ← Patterns and lessons learned
├── frameworks/             ← Educational content (how frameworks work)
│   ├── annual_review.md
│   ├── vivid_vision.md
│   ├── ideal_life_costing.md
│   └── life_map.md
├── interviews/             ← Guided self-interview scripts
│   ├── past_year_reflection.md
│   ├── identity_and_values.md
│   └── future_self_interview.md
├── goals/                  ← Goal-setting templates
│   ├── 1_year.md          ← 1-year goals across 6 life dimensions
│   ├── 3_year.md          ← 3-year vision
│   └── 10_year.md         ← 10-year aspirations
├── guides/                 ← How-to guides and onboarding
│   └── quick_start.md
├── examples/               ← Example filled-out reviews
│   ├── daily_example.md
│   └── weekly_example.md
├── schema/                 ← Content schema and metadata
│   ├── content_manifest.json
│   └── template_schema.json
└── README.md               ← This file
```

---

## Life Map Dimensions

All goal-setting and reviews are organized around six life dimensions:

| Dimension | What it covers |
|-----------|----------------|
| **Career/Work** | Professional growth, job satisfaction, skills, impact |
| **Relationships** | Family, partner, friends, community |
| **Health** | Physical, mental, emotional, sleep, energy |
| **Meaning/Purpose** | Contribution, creativity, spirituality, legacy |
| **Finances** | Security, freedom, goals, giving |
| **Fun/Joy** | Hobbies, travel, experiences, play |

This ensures you're not over-indexing on one area at the expense of others.

---

## Content Manifest

The `schema/content_manifest.json` file defines all available content, metadata, and relationships.

This allows the web app to:
- Dynamically load templates
- Display framework guides
- Show interview scripts
- Render examples

**Example**:
```json
{
  "templates": {
    "daily": {
      "id": "daily",
      "title": "Daily Check-In",
      "file": "templates/daily.md",
      "type": "review",
      "frequency": "daily",
      "duration": "5 minutes",
      "sections": ["energy", "win", "friction", "let_go", "priority"]
    }
  }
}
```

---

## Template Format

All templates use **frontmatter** for metadata and **markdown** for content.

**Example** (`templates/daily.md`):
```markdown
---
id: daily
title: Daily Check-In
type: review
frequency: daily
duration: 5 minutes
version: 1.0.0
---

# Daily Check-In

**Date**: {{date}}

## 1. Energy Level (1-10)

How do you feel today? Not productivity — energy.

**Score**: ___/10

...
```

The web app will:
1. Parse frontmatter for metadata
2. Render markdown content
3. Replace variables like `{{date}}` with actual values
4. Allow users to fill in the blanks

---

## Template Variables

Templates can use variables that the web app will replace:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `{{date}}` | `2026-01-04` | Current date |
| `{{year}}` | `2026` | Current year |
| `{{day_of_week}}` | `Saturday` | Day of the week |
| `{{tomorrow_date}}` | `2026-01-05` | Tomorrow's date |

---

## How the Web App Consumes This Content

### 1. Build Time (Static)
- Read `schema/content_manifest.json`
- Parse all markdown files
- Generate TypeScript types
- Bundle content into the app

### 2. Runtime (Dynamic)
- Load template on demand
- Replace variables with user data
- Render markdown to HTML
- Pre-fill with saved data if editing

### 3. Example Code (Next.js)

```typescript
// lib/content.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

export function getTemplate(templateId: string) {
  const contentDir = join(process.cwd(), '../personal-os-content');
  const filePath = join(contentDir, 'templates', `${templateId}.md`);
  const fileContents = readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    metadata: data,
    content: content,
  };
}
```

---

## Content Versioning

Templates may evolve over time. We use semantic versioning:

- **1.0.0**: Initial version
- **1.1.0**: Add new section (backwards compatible)
- **2.0.0**: Breaking change (remove section, restructure)

When a user has saved a review using template v1.0, the app should:
1. Store the template version with the saved review
2. Use the original template when displaying old reviews
3. Prompt the user to upgrade to the new template (optional)

---

## Editing Content

### For Non-Technical Editors

1. Navigate to the appropriate file (e.g., `templates/daily.md`)
2. Edit the markdown content
3. Commit changes to Git
4. The web app will automatically use the updated content

### For Developers

1. Update the template file
2. Update `schema/content_manifest.json` if metadata changed
3. Bump the version number in frontmatter
4. Run tests to ensure templates parse correctly
5. Deploy (web app will pull new content on next build)

---

## Localization (Future)

To add translations:

```
templates/
├── en/
│   ├── daily.md
│   ├── weekly.md
│   └── ...
├── es/
│   ├── daily.md
│   ├── weekly.md
│   └── ...
└── fr/
    ├── daily.md
    ├── weekly.md
    └── ...
```

The web app detects user locale and loads the appropriate content.

---

## Testing Content

Content should be tested to ensure:
- Markdown parses correctly
- Frontmatter is valid
- Variables are properly formatted
- No broken links
- Examples are accurate

---

## Content Contribution Guidelines

If contributing new templates or frameworks:

1. **Use the existing format**: Frontmatter + Markdown
2. **Add to manifest**: Update `schema/content_manifest.json`
3. **Include examples**: Add a filled-out example to `examples/`
4. **Document variables**: Explain any new `{{variables}}`
5. **Test locally**: Ensure it renders correctly
6. **Submit PR**: Clear description of changes

---

**Last Updated**: 2026-01-04
**Content Version**: 1.1.0

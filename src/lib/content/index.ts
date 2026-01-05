import { readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

// Content repository path - update if you rename the content folder
const contentDir = join(process.cwd(), '../ceo-personal-os-content');

export interface TemplateMetadata {
  id: string;
  title: string;
  type: string;
  frequency: string;
  duration: string;
  version: string;
  description?: string;
  tags?: string[];
  difficulty?: string;
  sections?: string[];
  [key: string]: any;
}

export interface Template {
  metadata: TemplateMetadata;
  content: string;
}

export function getTemplate(templateId: string): Template {
  const filePath = join(contentDir, 'templates', `${templateId}.md`);
  const fileContents = readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    metadata: data as TemplateMetadata,
    content,
  };
}

export function getAllTemplates(): string[] {
  const templatesDir = join(contentDir, 'templates');
  const fs = require('fs');
  const files = fs.readdirSync(templatesDir);
  return files
    .filter((file: string) => file.endsWith('.md'))
    .map((file: string) => file.replace('.md', ''));
}

export function getFramework(frameworkId: string) {
  const filePath = join(contentDir, 'frameworks', `${frameworkId}.md`);
  const fileContents = readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    metadata: data,
    content,
  };
}

export function getInterview(interviewId: string) {
  const filePath = join(contentDir, 'interviews', `${interviewId}.md`);
  const fileContents = readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    metadata: data,
    content,
  };
}

export function getGoalTemplate(timeHorizon: '1_year' | '3_year' | '10_year') {
  const filePath = join(contentDir, 'goals', `${timeHorizon}.md`);
  const fileContents = readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    metadata: data,
    content,
  };
}

export function replaceVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

// Helper to get current date variables
export function getDateVariables(date: Date = new Date()): Record<string, string> {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    date: date.toISOString().split('T')[0],
    day_of_week: days[date.getDay()],
    year: date.getFullYear().toString(),
    tomorrow_date: new Date(date.getTime() + 86400000).toISOString().split('T')[0],
  };
}

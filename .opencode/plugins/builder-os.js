/**
 * BuilderOS plugin for OpenCode.ai
 *
 * The Operating System for Product Builders.
 * Injects BuilderOS bootstrap context via system prompt transform.
 * Auto-registers skills directory via config hook.
 * Zero dependencies — uses only Node.js built-ins.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

export const BuilderOSPlugin = async () => {
  const installationRoot = path.resolve(__dirname, '../..');
  const builderOSSkillsDir = path.join(installationRoot, 'skills');

  const getBootstrapContent = () => {
    const skillPath = path.join(builderOSSkillsDir, 'using-builder-os', 'SKILL.md');
    if (!fs.existsSync(skillPath)) return null;

    const fullContent = fs.readFileSync(skillPath, 'utf8');
    const { content } = extractAndStripFrontmatter(fullContent);

    const sourceContext = `**BuilderOS installation root:** ${installationRoot}
Resolve skills/, references/ and scripts/ here; project files remain in the user's working directory.
Run the script from the user's project root: node '${path.join(installationRoot, 'scripts/bos.mjs').replaceAll("'", "'\\''")}'.
Resolve capabilities against the tools exposed by this session. Delegate and await completion if supported; otherwise run the same skill inline.`;

    return `You have BuilderOS installed — The Operating System for Product Builders.

**The using-builder-os skill is included below and already loaded. It briefs from the project memory and routes to builder-os (the lifecycle) or a specialist skill (a standalone answer); load those with the skill tool.**

${content}

${sourceContext}`;
  };

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(builderOSSkillsDir)) {
        config.skills.paths.push(builderOSSkillsDir);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('BuilderOS installed'))) return;
      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    }
  };
};

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const registry = JSON.parse(fs.readFileSync(path.join(here, 'registry.json'), 'utf8'));
const template = path.join(root, 'departments', '_template');

for (const department of registry.departments) {
  const dir = path.join(root, 'departments', department.id);
  fs.mkdirSync(dir, { recursive: true });

  const manifest = {
    schemaVersion: 1,
    id: department.id,
    name: department.name,
    lifecycle: department.lifecycle,
    tier: department.tier,
    publicPath: department.path,
    apiBasePath: department.apiBasePath,
    currentPath: department.currentPath,
    currentApiBasePath: department.currentApiBasePath,
    owner: department.owner,
    dependencies: department.dependencies,
    database: { name: `artic_${department.id}`, user: `u_${department.id}`, isolated: true },
    storage: { bucket: `artic-${department.id}`, privateByDefault: true },
    health: { livenessPath: '/health', readinessPath: '/ready' },
  };
  const roles = {
    schemaVersion: 1,
    departmentId: department.id,
    roles: [
      { id: 'worker', permissions: [] },
      { id: 'manager', inherits: 'worker', permissions: [] },
      { id: 'department_admin', inherits: 'manager', permissions: [] },
      { id: 'department_leader', inherits: 'department_admin', permissions: [] },
    ],
    rules: { denyByDefault: true, noSelfPromotion: true, auditRoleChanges: true, requireScopeOnEveryRequest: true },
  };

  fs.writeFileSync(path.join(dir, 'department.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
  fs.writeFileSync(path.join(dir, 'roles.json'), `${JSON.stringify(roles, null, 2)}\n`, { flag: 'wx' });
  const readme = `# ${department.name}\n\n- **ID:** \`${department.id}\`\n- **Lifecycle:** \`${department.lifecycle}\`\n- **Tier:** ${department.tier}\n- **Target route:** \`${department.path}\`\n- **Target API:** \`${department.apiBasePath}\`\n- **Current route:** \`${department.currentPath ?? 'not deployed'}\`\n- **Current API:** \`${department.currentApiBasePath ?? 'not deployed'}\`\n\nThis folder is an architecture/migration charter, not proof that an independent department application is live.\nBuild it from [the shared template](../_template/README.md), assign an accountable owner, and complete the live checklist before marking the department Live.\n`;
  fs.writeFileSync(path.join(dir, 'README.md'), readme, { flag: 'wx' });

  // Keep the template reference explicit so newly generated charters remain aligned.
  if (!fs.existsSync(path.join(template, 'README.md'))) throw new Error('Department template is missing');
}

console.log(`Created migration charters for ${registry.departments.length} departments. Existing files were left untouched.`);

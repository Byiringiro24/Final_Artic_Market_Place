import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { ApiResponse } from '../lib/apiResponse';

type Department = {
  id: string;
  name: string;
  path: string;
  apiBasePath: string;
  audience: string[];
  tier: number;
  lifecycle: 'migration' | 'planned' | 'live' | 'maintenance' | 'off';
  currentPath: string | null;
  currentApiBasePath: string | null;
  enabled: boolean;
  dependencies: string[];
};

type Registry = { schemaVersion: number; updatedAt: string; departments: Department[] };

const registryCandidates = [
  process.env.DEPARTMENT_REGISTRY_PATH,
  path.resolve(process.cwd(), 'platform/control-plane/registry.json'),
  path.resolve(process.cwd(), '../platform/control-plane/registry.json'),
  path.resolve(__dirname, '../../../platform/control-plane/registry.json'),
].filter((candidate): candidate is string => Boolean(candidate));
const registryPath = registryCandidates.find((candidate) => fs.existsSync(candidate)) || registryCandidates[0];

function readRegistry(): Registry {
  const parsed = JSON.parse(fs.readFileSync(registryPath, 'utf8')) as Registry;
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.departments)) {
    throw new Error('Invalid ARTIC HUB department registry');
  }
  return parsed;
}

const router = Router();

// Public directory data only: no staff, owner, credential, or health internals.
router.get('/departments', (_req, res) => {
  const registry = readRegistry();
  const departments = registry.departments.map(({ id, name, path: routePath, apiBasePath, audience, tier, lifecycle, enabled }) => ({
    id,
    name,
    path: routePath,
    apiBasePath,
    audience,
    tier,
    status: enabled ? lifecycle : 'off',
    available: enabled,
  }));
  return ApiResponse.success(res, { version: registry.schemaVersion, updatedAt: registry.updatedAt, departments });
});

export default router;

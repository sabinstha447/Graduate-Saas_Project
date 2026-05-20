-- Seed two tenants
INSERT INTO tenants (id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Southland Maintenance Team'),
  ('a0000000-0000-0000-0000-000000000002', 'Dunedin Property Services');

-- Seed sample issues for tenant 1
INSERT INTO issues (tenant_id, title, description, category, location, impact, likelihood, priority, status)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Blocked stormwater drain',
    'Drain at corner of Main St is fully blocked after recent rain.',
    'Drainage',
    'Invercargill — Main St',
    4, 3, 'high', 'open'
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'Damaged road sign',
    'Speed limit sign knocked down, lying on grass verge.',
    'Signage',
    'Invercargill — Tay St',
    3, 2, 'medium', 'open'
  );

-- Seed a sample issue for tenant 2
INSERT INTO issues (tenant_id, title, description, category, location, impact, likelihood, priority, status)
VALUES
  (
    'a0000000-0000-0000-0000-000000000002',
    'Unsafe footpath crack',
    'Large crack in footpath outside community hall — trip hazard.',
    'Footpaths',
    'Dunedin — Moray Place',
    3, 4, 'high', 'open'
  );
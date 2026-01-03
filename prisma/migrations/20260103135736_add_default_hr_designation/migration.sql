-- Initialize GlobalSerial if it doesn't exist
INSERT INTO "GlobalSerial" (id, "lastSerial")
SELECT 1, 0
WHERE NOT EXISTS (
    SELECT 1 FROM "GlobalSerial" WHERE id = 1
);

-- Add default HR designation if it doesn't exist
INSERT INTO "Designation" (id, name, description)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    'HR',
    'Default Human Resources designation'
WHERE NOT EXISTS (
    SELECT 1 FROM "Designation" WHERE name = 'HR'
);


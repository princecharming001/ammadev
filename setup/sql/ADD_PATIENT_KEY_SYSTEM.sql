-- Add patient_key field to users table for secure patient-doctor linking
-- This replaces email-based linking with a secure 9-digit key system

-- Step 1: Add patient_key column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS patient_key VARCHAR(9) UNIQUE;

-- Step 2: Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_patient_key ON users(patient_key);

-- Step 3: Create function to generate unique 9-digit patient keys
CREATE OR REPLACE FUNCTION generate_patient_key()
RETURNS VARCHAR(9) AS $$
DECLARE
  new_key VARCHAR(9);
  key_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 9-digit number (100000000 to 999999999)
    new_key := LPAD(FLOOR(RANDOM() * 900000000 + 100000000)::TEXT, 9, '0');
    
    -- Check if key already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE patient_key = new_key) INTO key_exists;
    
    -- Exit loop if key is unique
    EXIT WHEN NOT key_exists;
  END LOOP;
  
  RETURN new_key;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Generate keys for existing patients who don't have one
UPDATE users 
SET patient_key = generate_patient_key()
WHERE user_type = 'patient' AND patient_key IS NULL;

-- Step 5: Create trigger to auto-generate patient_key for new patients
CREATE OR REPLACE FUNCTION auto_generate_patient_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_type = 'patient' AND NEW.patient_key IS NULL THEN
    NEW.patient_key := generate_patient_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_patient_key ON users;
CREATE TRIGGER trigger_auto_patient_key
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_patient_key();

-- Step 6: Update doctor_patients table to use patient_key instead of patient_email
ALTER TABLE doctor_patients
ADD COLUMN IF NOT EXISTS patient_key VARCHAR(9);

-- Step 7: Migrate existing data (populate patient_key from patient_email)
UPDATE doctor_patients dp
SET patient_key = u.patient_key
FROM users u
WHERE dp.patient_email = u.email
AND dp.patient_key IS NULL;

-- Step 8: Add foreign key constraint
ALTER TABLE doctor_patients
ADD CONSTRAINT fk_patient_key 
FOREIGN KEY (patient_key) REFERENCES users(patient_key) ON DELETE CASCADE;

-- Step 9: Create index on doctor_patients.patient_key
CREATE INDEX IF NOT EXISTS idx_doctor_patients_key ON doctor_patients(patient_key);

-- Note: Keep patient_email for now for backward compatibility, can remove later
-- ALTER TABLE doctor_patients DROP COLUMN patient_email; -- Run this after testing

COMMENT ON COLUMN users.patient_key IS 'Unique 9-digit key for secure patient-doctor linking';
COMMENT ON COLUMN doctor_patients.patient_key IS 'Patient key for linking (replaces email-based linking)';


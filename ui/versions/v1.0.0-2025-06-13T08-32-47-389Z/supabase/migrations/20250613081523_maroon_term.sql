/*
  # Create FII/DII Data Tables

  1. New Tables
    - `fii_dii_data`
      - `id` (uuid, primary key)
      - `date` (date, unique)
      - `fii_sell` (numeric) - FII sell amount in crores
      - `fii_buy` (numeric) - FII buy amount in crores
      - `dii_sell` (numeric) - DII sell amount in crores
      - `dii_buy` (numeric) - DII buy amount in crores
      - `fii_net` (numeric) - FII net flow (buy - sell)
      - `dii_net` (numeric) - DII net flow (buy - sell)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `sector_data`
      - `id` (uuid, primary key)
      - `name` (text) - Sector name
      - `change` (numeric) - Price change
      - `change_percent` (numeric) - Percentage change
      - `volume` (text) - Trading volume
      - `market_cap` (text) - Market capitalization
      - `date` (date) - Data date
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
    - Add policies for admin users to insert/update data

  3. Indexes
    - Add indexes on date columns for better query performance
    - Add unique constraint on date for fii_dii_data
*/

-- Create FII/DII data table
CREATE TABLE IF NOT EXISTS fii_dii_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  fii_sell numeric NOT NULL DEFAULT 0,
  fii_buy numeric NOT NULL DEFAULT 0,
  dii_sell numeric NOT NULL DEFAULT 0,
  dii_buy numeric NOT NULL DEFAULT 0,
  fii_net numeric GENERATED ALWAYS AS (fii_buy - fii_sell) STORED,
  dii_net numeric GENERATED ALWAYS AS (dii_buy - dii_sell) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sector data table
CREATE TABLE IF NOT EXISTS sector_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  change numeric NOT NULL DEFAULT 0,
  change_percent numeric NOT NULL DEFAULT 0,
  volume text NOT NULL DEFAULT '0',
  market_cap text NOT NULL DEFAULT '0',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE fii_dii_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sector_data ENABLE ROW LEVEL SECURITY;

-- Create policies for fii_dii_data
CREATE POLICY "Users can read FII/DII data"
  ON fii_dii_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert FII/DII data"
  ON fii_dii_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update FII/DII data"
  ON fii_dii_data
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policies for sector_data
CREATE POLICY "Users can read sector data"
  ON sector_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert sector data"
  ON sector_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update sector data"
  ON sector_data
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fii_dii_data_date ON fii_dii_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_sector_data_date ON sector_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_sector_data_name_date ON sector_data(name, date DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_fii_dii_data_updated_at 
  BEFORE UPDATE ON fii_dii_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sector_data_updated_at 
  BEFORE UPDATE ON sector_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample FII/DII data for last 14 days
INSERT INTO fii_dii_data (date, fii_sell, fii_buy, dii_sell, dii_buy) VALUES
  ('2025-06-12', 8500, 6200, 3200, 7800),
  ('2025-06-11', 7200, 8900, 4100, 6500),
  ('2025-06-10', 9100, 5800, 3800, 8200),
  ('2025-06-09', 6800, 7500, 2900, 5600),
  ('2025-06-08', 8900, 4200, 3500, 9100),
  ('2025-06-07', 5600, 9200, 4200, 6800),
  ('2025-06-06', 7800, 6100, 3100, 7500),
  ('2025-06-05', 8200, 7800, 3800, 6200),
  ('2025-06-04', 9500, 5200, 2800, 8900),
  ('2025-06-03', 6900, 8100, 4000, 5800),
  ('2025-06-02', 7600, 6800, 3300, 7200),
  ('2025-06-01', 8800, 5900, 3600, 8500),
  ('2025-05-31', 7100, 8600, 4100, 6100),
  ('2025-05-30', 9200, 4800, 2900, 8800)
ON CONFLICT (date) DO NOTHING;

-- Insert sample sector data
INSERT INTO sector_data (name, change, change_percent, volume, market_cap, date) VALUES
  ('Banking', 245.8, 1.2, '2.5B', '15.2L Cr', CURRENT_DATE),
  ('IT', -128.4, -0.8, '1.8B', '12.8L Cr', CURRENT_DATE),
  ('Auto', 89.2, 0.6, '980M', '8.5L Cr', CURRENT_DATE),
  ('Pharma', 156.7, 1.1, '750M', '6.2L Cr', CURRENT_DATE),
  ('FMCG', -45.3, -0.3, '650M', '9.8L Cr', CURRENT_DATE),
  ('Energy', 78.9, 0.9, '1.2B', '11.5L Cr', CURRENT_DATE),
  ('Metals', -234.5, -1.8, '890M', '4.8L Cr', CURRENT_DATE),
  ('Realty', 45.6, 2.1, '320M', '2.1L Cr', CURRENT_DATE)
ON CONFLICT DO NOTHING;
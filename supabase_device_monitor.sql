create table device_status (
  id uuid primary key default gen_random_uuid(),
  table_id text unique,
  last_seen timestamptz,
  status text default 'offline',
  battery int default 0
);

-- Policy to allow public read (for dashboard)
alter table device_status enable row level security;
create policy "Allow public read access" on device_status for select using (true);

-- Policy to allow service role write (for edge functions)
create policy "Allow service role write access" on device_status for all using (true) with check (true);

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Now schedule the import-airport-data function to run on the 1st day of every month at 2:00 AM
SELECT cron.schedule(
  'import-airport-data-monthly',
  '0 2 1 * *', -- At 2:00 AM on the 1st day of every month
  $$
  SELECT
    net.http_post(
        url:='https://suhttfxcurgurshlkcpz.supabase.co/functions/v1/import-airport-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aHR0ZnhjdXJndXJzaGxrY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjc4MTAsImV4cCI6MjA2NTYwMzgxMH0.2DLJSoUaSQel60qSaql3x9vRpO7LVXg3mu1qWdXo39g"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Execute the import immediately
SELECT
  net.http_post(
      url:='https://suhttfxcurgurshlkcpz.supabase.co/functions/v1/import-airport-data',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aHR0ZnhjdXJndXJzaGxrY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjc4MTAsImV4cCI6MjA2NTYwMzgxMH0.2DLJSoUaSQel60qSaql3x9vRpO7LVXg3mu1qWdXo39g"}'::jsonb,
      body:='{}'::jsonb
  ) as import_request_id;
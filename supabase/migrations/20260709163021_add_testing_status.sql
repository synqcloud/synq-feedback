-- New workflow stage between "in_progress" and "completed".
alter type public.suggestion_status add value 'testing' after 'in_progress';

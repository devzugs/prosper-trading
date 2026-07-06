-- ---------------------------------------------------------------------------
-- Storage: deposit-proofs bucket + policies, codified.

-- 1. Bucket -------------------------------------------------------------------
-- Not public; every read goes through a signed URL (see AdminApprovals.jsx).
-- file_size_limit / allowed_mime_types close the Phase 11 gap where file
-- validation was client-side only (5MB + accept="image/*" in StepDeposit.jsx,
-- both trivially bypassable) — these are enforced by Storage itself now.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deposit-proofs',
  'deposit-proofs',
  false,
  5242880, -- 5MB, matches the client-side check in StepDeposit.jsx
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- 2. Policies on storage.objects for this bucket -------------------------------
-- `create policy` against storage.objects works exactly like any other
-- table's RLS — drop-and-recreate makes this migration idempotent.

drop policy if exists "deposit_proofs_insert_own" on storage.objects;
create policy "deposit_proofs_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'deposit-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "deposit_proofs_select_own_or_admin" on storage.objects;
create policy "deposit_proofs_select_own_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'deposit-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- Needed for the client's rollback-on-db-failure cleanup in StepDeposit.jsx
-- (uploads the file, then deletes it again if the `deposits` insert fails).
-- Admins get delete too, for the same audit-log-friendly reason they get
-- update elsewhere: cleaning up bad/duplicate uploads without a service role.
drop policy if exists "deposit_proofs_delete_own_or_admin" on storage.objects;
create policy "deposit_proofs_delete_own_or_admin"
  on storage.objects for delete
  using (
    bucket_id = 'deposit-proofs'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- No update policy: proofs are write-once (upload, maybe delete-on-failure),
-- never edited in place.



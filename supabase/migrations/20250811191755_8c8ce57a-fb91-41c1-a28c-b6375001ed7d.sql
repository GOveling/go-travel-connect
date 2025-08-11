-- Create table to store debt backups when removing a collaborator
create table if not exists public.trip_debt_backups (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  removed_user_id uuid not null,
  removed_user_name text not null,
  counterparty_user_id uuid,
  counterparty_name text not null,
  amount numeric not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.trip_debt_backups enable row level security;

-- Policies: Trip members (owner or collaborators) can view backups
create policy "Trip members can view debt backups"
  on public.trip_debt_backups
  for select
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and (t.user_id = auth.uid() or public.is_trip_collaborator(t.id, auth.uid()))
    )
  );

-- Allow owners to insert backups (function will also run as SECURITY DEFINER)
create policy "Trip owners can insert debt backups"
  on public.trip_debt_backups
  for insert
  with check (
    exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = auth.uid()
    )
  );

-- RPC to remove collaborator, clean participation, and archive debts
create or replace function public.remove_collaborator_and_archive(
  p_trip_id uuid,
  p_user_id uuid
) returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_is_owner boolean;
  v_removed_name text;
  v_owner_id uuid;
  v_backup_count int := 0;
  v_c_name text;
  v_c_amt numeric;
  v_d_name text;
  v_d_amt numeric;
  v_settle numeric;
begin
  -- Validate trip exists and caller is owner
  select user_id into v_owner_id from public.trips where id = p_trip_id;
  if v_owner_id is null then
    raise exception 'Trip not found';
  end if;
  v_is_owner := (v_owner_id = auth.uid());
  if not v_is_owner then
    raise exception 'Only trip owners can remove collaborators';
  end if;

  -- Get removed collaborator display name
  select coalesce(tc.name, p.full_name, 'Unknown') into v_removed_name
  from public.profiles p
  left join public.trip_collaborators tc on tc.user_id = p.id and tc.trip_id = p_trip_id
  where p.id = p_user_id
  limit 1;

  if v_removed_name is null then
    v_removed_name := 'Unknown';
  end if;

  -- Compute balances for all participant names in this trip using expenses
  -- We work with names because expenses store arrays of names (jsonb)
  create temporary table tmp_balances(name text primary key, balance numeric) on commit drop;

  insert into tmp_balances(name, balance)
  with paid as (
    select jsonb_array_elements_text(e.paid_by) as name,
           sum(e.amount / nullif(jsonb_array_length(e.paid_by),0)) as amt
    from public.trip_expenses e
    where e.trip_id = p_trip_id
      and e.paid_by is not null
    group by 1
  ), owed as (
    select jsonb_array_elements_text(e.split_between) as name,
           sum(e.amount / nullif(jsonb_array_length(e.split_between),0)) as amt
    from public.trip_expenses e
    where e.trip_id = p_trip_id
      and e.split_between is not null
    group by 1
  )
  select coalesce(paid.name, owed.name) as name,
         coalesce(paid.amt,0) - coalesce(owed.amt,0) as balance
  from paid
  full outer join owed on paid.name = owed.name;

  -- Build participant mapping name->user_id for counterparties
  create temporary table tmp_name_user(name text primary key, user_id uuid) on commit drop;
  -- collaborators
  insert into tmp_name_user(name, user_id)
  select coalesce(tc.name, p.full_name) as name, tc.user_id
  from public.trip_collaborators tc
  left join public.profiles p on p.id = tc.user_id
  where tc.trip_id = p_trip_id;
  -- owner
  insert into tmp_name_user(name, user_id)
  select p.full_name, t.user_id
  from public.trips t
  join public.profiles p on p.id = t.user_id
  where t.id = p_trip_id
  on conflict (name) do nothing;

  -- Create creditors and debtors lists
  create temporary table tmp_creditors(name text, balance numeric) on commit drop;
  create temporary table tmp_debtors(name text, balance numeric) on commit drop;

  insert into tmp_creditors
  select name, balance from tmp_balances where balance > 0.01;

  insert into tmp_debtors
  select name, abs(balance) from tmp_balances where balance < -0.01;

  -- Settlement matching (greedy)
  loop
    select name, balance into v_c_name, v_c_amt
    from tmp_creditors
    order by balance desc
    limit 1;

    select name, balance into v_d_name, v_d_amt
    from tmp_debtors
    order by balance desc
    limit 1;

    exit when v_c_name is null or v_d_name is null;

    v_settle := least(v_c_amt, v_d_amt);

    -- Record backup only if removed user participates
    if v_settle > 0.01 then
      if v_d_name = v_removed_name then
        -- removed user owes creditor
        insert into public.trip_debt_backups(
          trip_id, removed_user_id, removed_user_name,
          counterparty_user_id, counterparty_name, amount, notes
        )
        values (
          p_trip_id, p_user_id, v_removed_name,
          (select user_id from tmp_name_user where name = v_c_name), v_c_name, v_settle,
          'Backup generated on collaborator removal'
        );
        v_backup_count := v_backup_count + 1;
      elsif v_c_name = v_removed_name then
        -- creditor is removed user (others owe to removed user)
        insert into public.trip_debt_backups(
          trip_id, removed_user_id, removed_user_name,
          counterparty_user_id, counterparty_name, amount, notes
        )
        values (
          p_trip_id, p_user_id, v_removed_name,
          (select user_id from tmp_name_user where name = v_d_name), v_d_name, v_settle,
          'Backup generated on collaborator removal'
        );
        v_backup_count := v_backup_count + 1;
      end if;
    end if;

    -- Update remaining balances
    if v_c_amt - v_settle <= 0.01 then
      delete from tmp_creditors where name = v_c_name;
    else
      update tmp_creditors set balance = v_c_amt - v_settle where name = v_c_name;
    end if;

    if v_d_amt - v_settle <= 0.01 then
      delete from tmp_debtors where name = v_d_name;
    else
      update tmp_debtors set balance = v_d_amt - v_settle where name = v_d_name;
    end if;
  end loop;

  -- Remove participant name from expenses arrays but keep expenses
  update public.trip_expenses e
  set paid_by = coalesce(
      (select jsonb_agg(val) from jsonb_array_elements_text(e.paid_by) as val where val <> v_removed_name),
      '[]'::jsonb
    )
  where e.trip_id = p_trip_id and e.paid_by is not null;

  update public.trip_expenses e
  set split_between = coalesce(
      (select jsonb_agg(val) from jsonb_array_elements_text(e.split_between) as val where val <> v_removed_name),
      '[]'::jsonb
    )
  where e.trip_id = p_trip_id and e.split_between is not null;

  -- Remove votes by the user in this trip's decisions
  delete from public.trip_decision_votes v
  using public.trip_decisions d
  where v.decision_id = d.id and d.trip_id = p_trip_id and v.user_id = p_user_id;

  -- Remove membership entries
  delete from public.trip_members where trip_id = p_trip_id and user_id = p_user_id;
  delete from public.trip_collaborators where trip_id = p_trip_id and user_id = p_user_id;

  -- Update collaborators_count
  update public.trips t
  set collaborators_count = (
    select count(*) from public.trip_collaborators tc where tc.trip_id = p_trip_id
  ),
  updated_at = now()
  where t.id = p_trip_id;

  return jsonb_build_object('success', true, 'backup_count', v_backup_count);
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;
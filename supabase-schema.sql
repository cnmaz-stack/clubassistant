-- À exécuter dans Supabase : SQL Editor > New query
create table pratiquants (id text primary key, nom text not null, prenom text not null);
create table materiel (id text primary key, type text not null, numero text not null);
create table departs (
  id uuid primary key default gen_random_uuid(),
  pid text, nom text not null, bid text, type text, numero text, note text,
  depart bigint not null, retour bigint, statut text not null default 'en_mer');
create table problemes (
  id uuid primary key default gen_random_uuid(),
  bid text, type text not null, numero text not null, commentaire text not null,
  date bigint not null, statut text not null default 'ouvert', resolution text, dateres bigint);

alter table pratiquants enable row level security;
alter table materiel enable row level security;
alter table departs enable row level security;
alter table problemes enable row level security;

-- Tout le monde lit les pratiquants et le matériel ; seuls les admins connectés écrivent
create policy "lecture pratiquants" on pratiquants for select to anon, authenticated using (true);
create policy "admin pratiquants" on pratiquants for all to authenticated using (true) with check (true);
create policy "lecture materiel" on materiel for select to anon, authenticated using (true);
create policy "admin materiel" on materiel for all to authenticated using (true) with check (true);

-- Départs / retours : ouverts à tous (tablette du club)
create policy "lecture departs" on departs for select to anon, authenticated using (true);
create policy "ajout departs" on departs for insert to anon, authenticated with check (true);
create policy "retour departs" on departs for update to anon, authenticated using (true) with check (true);

-- Problèmes : tout le monde peut signaler, seuls les admins lisent et résolvent
create policy "signalement" on problemes for insert to anon, authenticated with check (true);
create policy "admin lecture problemes" on problemes for select to authenticated using (true);
create policy "admin maj problemes" on problemes for update to authenticated using (true) with check (true);
alter table problemes add column if not exists agenda_id text;

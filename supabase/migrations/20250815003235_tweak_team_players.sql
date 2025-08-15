alter table "public"."player" drop column "jersey_number";

alter table "public"."player_team" add column "jersey_number" text;

create policy "Super admins can add players to teams"
on "public"."player_team"
as permissive
for insert
to public
with check (( SELECT is_super_admin() AS is_super_admin));




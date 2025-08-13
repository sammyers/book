alter table "public"."user" drop column "created_at";

alter table "public"."user" add column "full_name" text not null generated always as (((first_name || ' '::text) || last_name)) stored;

alter table "public"."user" add column "is_confirmed" boolean not null default false;

alter table "public"."user" add column "joined_at" timestamp with time zone not null default now();

alter table "public"."user" add column "has_set_password" boolean not null default false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_is_confirmed_on_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF NEW.confirmed_at IS DISTINCT FROM OLD.confirmed_at THEN
    UPDATE public."user"
    SET (is_confirmed, joined_at) = ((NEW.confirmed_at IS NOT NULL), current_timestamp)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE TRIGGER set_is_confirmed_on_user AFTER UPDATE OF confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION update_is_confirmed_on_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
  insert into public.user (
    id,
    email,
    first_name, 
    last_name,
    is_confirmed,
    has_set_password
  ) values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'firstName',
    new.raw_user_meta_data ->> 'lastName',
    (new.confirmed_at is not null),
    (coalesce(new.encrypted_password, '') != '')
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_permission_level_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Skip the check if this isn't an authenticated end-user session
  -- (e.g., postgres or service_role connections)
  IF auth.uid() IS NOT NULL THEN
    IF NEW.permission_level IS DISTINCT FROM OLD.permission_level THEN
      RAISE EXCEPTION 'You are not allowed to change your permission level.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

create policy "Users can update their own data"
on "public"."user"
as permissive
for update
to authenticated
using (( SELECT auth.uid() AS uid) = id)
with check (( SELECT auth.uid() AS uid) = id);


CREATE TRIGGER prevent_permission_level_update_trigger BEFORE UPDATE ON public."user" FOR EACH ROW EXECUTE FUNCTION prevent_permission_level_update();

create policy "Super admins can update user data"
on "public"."user"
as permissive
for update
to authenticated
using (is_super_admin());


create policy "Super admins can update team membership"
on "public"."user_team"
as permissive
for update
to authenticated
using (is_super_admin());

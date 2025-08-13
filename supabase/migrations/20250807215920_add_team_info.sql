alter table "public"."team" add column "admin_note" text;

alter table "public"."team" add column "location_city" text;

alter table "public"."team" add column "location_state" text;

alter table "public"."team" add column "primary_region_id" uuid;

alter table "public"."team" add constraint "team_primary_region_id_fkey" FOREIGN KEY (primary_region_id) REFERENCES region(id) not valid;

alter table "public"."team" validate constraint "team_primary_region_id_fkey";



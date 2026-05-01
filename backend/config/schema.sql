create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text,
  github_id text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_password_or_github check (password is not null or github_id is not null)
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  owner_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'Member',
  joined_at timestamptz not null default now(),
  constraint project_members_role_check check (role in ('Admin', 'Member')),
  constraint project_members_project_user_unique unique (project_id, user_id)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null default 'To Do',
  project_id uuid not null references projects(id) on delete cascade,
  assigned_to uuid references users(id) on delete set null,
  due_date date,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_status_check check (status in ('To Do', 'In Progress', 'Done'))
);

alter table users add column if not exists github_id text;
alter table users add column if not exists avatar_url text;
alter table users add column if not exists updated_at timestamptz not null default now();
alter table users alter column password drop not null;

alter table projects add column if not exists updated_at timestamptz not null default now();
alter table tasks add column if not exists updated_at timestamptz not null default now();

create unique index if not exists users_github_id_idx on users(github_id) where github_id is not null;
create index if not exists project_members_user_id_idx on project_members(user_id);
create index if not exists project_members_project_id_idx on project_members(project_id);
create index if not exists tasks_project_id_idx on tasks(project_id);
create index if not exists tasks_assigned_to_idx on tasks(assigned_to);
create index if not exists tasks_due_date_idx on tasks(due_date);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at
before update on projects
for each row execute function set_updated_at();

drop trigger if exists tasks_set_updated_at on tasks;
create trigger tasks_set_updated_at
before update on tasks
for each row execute function set_updated_at();

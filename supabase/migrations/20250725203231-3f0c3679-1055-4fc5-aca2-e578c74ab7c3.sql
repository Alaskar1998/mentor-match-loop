-- Create user profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  display_name text,
  email text,
  bio text,
  gender text,
  country text,
  age integer,
  avatar_url text,
  phone text,
  skills_to_teach jsonb default '[]'::jsonb,
  skills_to_learn text[] default array[]::text[],
  willing_to_teach_without_return boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  primary key (id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Users can view all profiles" 
on public.profiles for select using (true);

create policy "Users can update their own profile" 
on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile" 
on public.profiles for insert with check (auth.uid() = id);

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Create storage policies for avatars
create policy "Avatar images are publicly accessible" 
on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload their own avatar" 
on storage.objects for insert with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar" 
on storage.objects for update using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar" 
on storage.objects for delete using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
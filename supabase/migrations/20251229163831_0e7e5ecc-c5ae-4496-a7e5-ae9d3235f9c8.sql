
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create agencies table
CREATE TABLE public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creci TEXT NOT NULL,
  cnpj TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  cep TEXT,
  phone TEXT,
  email TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create owners table
CREATE TABLE public.owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  rg TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  cep TEXT,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debtors table (tenants)
CREATE TABLE public.debtors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  cep TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id TEXT NOT NULL,
  address TEXT NOT NULL,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cep TEXT NOT NULL,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
  debtor_id UUID REFERENCES public.debtors(id) ON DELETE CASCADE NOT NULL,
  rent_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 1,
  penalty_rate DECIMAL(5,2) NOT NULL DEFAULT 2,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agreements table for cloud storage
CREATE TABLE public.agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  contract_id TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  agency_creci TEXT,
  owner_name TEXT NOT NULL,
  owner_cpf_cnpj TEXT,
  debtor_name TEXT NOT NULL,
  debtor_cpf TEXT NOT NULL,
  debtor_rg TEXT,
  property_address TEXT NOT NULL,
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 1,
  penalty_rate DECIMAL(5,2) NOT NULL DEFAULT 2,
  interest_amount DECIMAL(12,2) DEFAULT 0,
  penalty_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  final_amount DECIMAL(12,2) NOT NULL,
  installments INTEGER DEFAULT 1,
  payment_options JSONB,
  installment_plan JSONB,
  status TEXT DEFAULT 'draft',
  hash TEXT,
  signature_data JSONB,
  signed_at TIMESTAMP WITH TIME ZONE,
  client_ip TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Agencies policies (authenticated users can CRUD)
CREATE POLICY "Authenticated users can view agencies" ON public.agencies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create agencies" ON public.agencies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own agencies" ON public.agencies
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own agencies" ON public.agencies
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Owners policies
CREATE POLICY "Authenticated users can view owners" ON public.owners
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create owners" ON public.owners
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own owners" ON public.owners
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own owners" ON public.owners
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Debtors policies
CREATE POLICY "Authenticated users can view debtors" ON public.debtors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create debtors" ON public.debtors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own debtors" ON public.debtors
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own debtors" ON public.debtors
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Properties policies
CREATE POLICY "Authenticated users can view properties" ON public.properties
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own properties" ON public.properties
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own properties" ON public.properties
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Agreements policies
CREATE POLICY "Authenticated users can view agreements" ON public.agreements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create agreements" ON public.agreements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own agreements" ON public.agreements
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own agreements" ON public.agreements
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON public.owners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_debtors_updated_at BEFORE UPDATE ON public.debtors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON public.agreements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

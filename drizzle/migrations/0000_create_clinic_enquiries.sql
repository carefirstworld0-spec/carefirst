CREATE TABLE public.clinic_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 25),
  clinic text NOT NULL CHECK (char_length(clinic) BETWEEN 2 AND 150),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 255),
  delivery_status text NOT NULL DEFAULT 'awaiting_setup' CHECK (delivery_status IN ('awaiting_setup', 'sent', 'failed'))
);
GRANT ALL ON public.clinic_enquiries TO service_role;
ALTER TABLE public.clinic_enquiries ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.clinic_enquiries IS 'Private clinic trial enquiries; only server-side trusted code may access these contact details.';
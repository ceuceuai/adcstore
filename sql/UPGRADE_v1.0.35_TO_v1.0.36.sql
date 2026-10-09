-- ADCStore v1.0.35 -> v1.0.36
-- Remove legacy Featured flag. Promo / Exclusive / Custom Highlight is now the single homepage highlight system.

alter table public.products
  drop column if exists featured;

select 'ADCStore v1.0.36 upgrade complete' as status;

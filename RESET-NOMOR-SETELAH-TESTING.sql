-- RESET NOMOR TRANSAKSI VDS SETELAH DATA TESTING DIHAPUS
-- Jalankan SATU KALI di Supabase SQL Editor setelah memastikan data testing memang sudah kosong.
-- Bidding: BID NO mulai 01, Nomor Nota mulai 2601.
-- Dana Paramita: ORDER NO mulai 01, Nomor Nota mulai 26001.
-- Counter disimpan terpisah dari daftar transaksi, sehingga menghapus transaksi saja tidak mereset nomor.

BEGIN;

UPDATE public.vds_number_counters
SET last_value = 0,
    updated_at = now()
WHERE site IN ('bidding', 'dana')
  AND counter_type IN ('bid', 'invoice');

-- Pastikan empat counter tersedia walaupun sebelumnya belum ada.
INSERT INTO public.vds_number_counters (site, counter_type, last_value, updated_at)
VALUES
  ('bidding', 'bid', 0, now()),
  ('bidding', 'invoice', 0, now()),
  ('dana', 'bid', 0, now()),
  ('dana', 'invoice', 0, now())
ON CONFLICT (site, counter_type)
DO UPDATE SET last_value = 0, updated_at = now();

COMMIT;

SELECT site, counter_type, last_value
FROM public.vds_number_counters
WHERE site IN ('bidding', 'dana')
ORDER BY site, counter_type;

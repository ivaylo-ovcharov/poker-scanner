import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
    const supabase = createClient('https://bccnbaiuhuyccztdrdkl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjY25iYWl1aHV5Y2N6dGRyZGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDczOTE2MzEsImV4cCI6MjAyMjk2NzYzMX0.t3-ylD6Q4jmTfOo7y50jL-mkevDWKktqm3bNSxMOcAg')

    return supabase;
};

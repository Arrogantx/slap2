import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wviioirhatqbtdarekde.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aWlvaXJoYXRxYnRkYXJla2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjY1MTUsImV4cCI6MjA1NjAwMjUxNX0.wF9O5fOsYhQmOnDeBs2S4QYGcGkXpxtdKfgPI53uvDA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aljcnbyzixcqfhqmcqqn.supabase.co';
const supabaseKey = 'sb_publishable_UXTg0SKcG9ErZPj53XaLeg_HtpUc_EK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('blogs').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}
check();

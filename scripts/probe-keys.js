const url = 'https://dqxlnwmqstznblfqlzbc.supabase.co';
const key = 'sb_publishable_kF2N-IQM6S0s6SM3doGRTA_Ulck-A28';

async function probe() {
  const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
  const schema = await res.json();
  console.log('Definitions keys:', Object.keys(schema.definitions || {}));
}
probe();

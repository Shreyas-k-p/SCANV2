import https from 'https';

const url = 'https://ohkrzxcmueodijbhxxgx.supabase.co/rest/v1/profiles?select=*';
const key = 'sb_publishable_LMW50V2QqdvXgNDefH1AdA_IOnregQK';

const options = {
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    }
};

console.log(`🚀 Fetching from: ${url}`);
https.get(url, options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Body:', data);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});

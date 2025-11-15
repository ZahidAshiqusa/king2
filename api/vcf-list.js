// Vercel API to list all VCF files in repo
const { Buffer } = require('buffer');

module.exports = async function handler(req, res) {
  if(req.method !== 'GET') return res.status(405).json({message:'Method not allowed'});

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;

  if(!owner || !repo || !token) return res.status(500).json({message:'Missing GitHub env vars'});

  try {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/vcf?ref=${branch}`, {
      headers: { Authorization:`token ${token}`, Accept:'application/vnd.github.v3+json' }
    });
    if(!r.ok) throw new Error('GitHub GET failed '+r.status);
    const json = await r.json();
    // return array of file names
    const vcfFiles = json.filter(f=>f.type==='file' && f.name.endsWith('.vcf')).map(f=>f.name);
    return res.status(200).json(vcfFiles);
  } catch(err) {
    console.error(err);
    return res.status(500).json({message:err.message});
  }
};

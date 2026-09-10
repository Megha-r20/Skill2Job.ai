const fs = require('fs');
function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  const badRegex = /return NextResponse\.json\((.*?),\s*\{(.*?)\},\s*\{\s*headers:\s*\{\s*'Cache-Control':\s*'[^']+'\s*\}\s*\}\s*\);/gs;
  if (badRegex.test(code)) {
    code = code.replace(badRegex, "return NextResponse.json($1, { $2, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });");
    fs.writeFileSync(file, code);
    changed = true;
    console.log('Fixed', file);
  }
}
function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = dir + '/' + f;
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts')) processFile(p);
  });
}
walk('app/api');

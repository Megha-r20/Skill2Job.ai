const fs = require('fs');
function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (code.includes('export async function GET') && !code.includes('Cache-Control')) {
    code = code.replace(/return NextResponse\.json\((.*?)\);/g, "return NextResponse.json($1, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });");
    code = code.replace(/return NextResponse\.json\((.*?),\s*\{(.*?)\}\);/gs, (match, data, options) => {
       if (options.includes('headers')) return match;
       return `return NextResponse.json(${data}, { ${options}, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });`;
    });
    fs.writeFileSync(file, code);
    changed = true;
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
console.log('Added Cache-Control headers.');

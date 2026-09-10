const fs = require('fs');

const heavyComponents = [
  'AiAdvisorWidget',
  'DemoWorkflowBanner',
  'GlobalSearchBar',
  'ReadinessGauge',
  'SecuritySettingsModal',
  'GoogleSignInModal',
  'SmsNotificationBanner',
  'LiveOtpNotificationBanner'
];

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  heavyComponents.forEach(comp => {
    const staticImportRegex = new RegExp(`import\\s+${comp}\\s+from\\s+['"]@/components/${comp}['"];?`, 'g');
    if (staticImportRegex.test(code)) {
      if (!code.includes('import dynamic from \'next/dynamic\'')) {
        // Add dynamic import at top
        code = code.replace(/import React/g, "import dynamic from 'next/dynamic';\nimport React");
        if (!code.includes("import dynamic from 'next/dynamic'")) {
           code = "import dynamic from 'next/dynamic';\n" + code;
        }
      }
      // Replace static import with dynamic
      code = code.replace(staticImportRegex, `const ${comp} = dynamic(() => import('@/components/${comp}'), { ssr: false });`);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, code);
    console.log(`Updated ${file}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = dir + '/' + f;
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) processFile(p);
  });
}

walk('app');
walk('components');
console.log('Dynamic imports applied.');

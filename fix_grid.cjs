const fs = require('fs');

const files = [
  'd:/maritime_web_codex/src/pages/InspectionCenterPage.tsx',
  'd:/maritime_web_codex/src/pages/VesselsPage.tsx',
  'd:/maritime_web_codex/src/pages/VesselProfilePage.tsx',
  'd:/maritime_web_codex/src/pages/DefectReviewPage.tsx',
  'd:/maritime_web_codex/src/pages/ReportPage.tsx',
  'd:/maritime_web_codex/src/pages/DashboardPage.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/<Grid\s+item([^>]*?)>/g, (match, p1) => {
    const sizeObj = [];
    
    const regex = /(xs|sm|md|lg|xl)=\{(.*?)\}/g;
    let propMatch;
    let remaining = p1;
    
    while ((propMatch = regex.exec(p1)) !== null) {
      sizeObj.push(propMatch[1] + ': ' + propMatch[2]);
      remaining = remaining.replace(propMatch[0], '');
    }
    
    const strRegex = /(xs|sm|md|lg|xl)=\"([^\"]+)\"/g;
    while ((propMatch = strRegex.exec(p1)) !== null) {
      sizeObj.push(propMatch[1] + ': ' + propMatch[2]);
      remaining = remaining.replace(propMatch[0], '');
    }

    if (sizeObj.length > 0) {
      return '<Grid size={{ ' + sizeObj.join(', ') + ' }}' + remaining + '>';
    }
    return match;
  });
  
  content = content.replace(/lg:\s*7\.5/g, 'lg: 8');
  content = content.replace(/lg:\s*4\.5/g, 'lg: 4');
  content = content.replace(/lg:\s*9\.5/g, 'lg: 9');
  content = content.replace(/lg:\s*2\.5/g, 'lg: 3');

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});

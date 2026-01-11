// check-validation.js
// Script to scan all route files and identify endpoints missing validation

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_DIR = path.join(__dirname, 'routes');
const CONTROLLERS_DIR = path.join(__dirname, 'controllers');

// Read all route files
const routeFiles = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith('.js'));

console.log('🔍 VALIDATION CHECK REPORT');
console.log('=' .repeat(80));
console.log(`\nChecking ${routeFiles.length} route files...\n`);

const report = {
  totalRoutes: 0,
  routesWithAuth: 0,
  routesWithoutValidation: [],
  fileStats: {}
};

// Validation keywords to look for
const VALIDATION_KEYWORDS = [
  'validate(',
  'safeParse',
  'parse(',
  'z.object',
  'Joi.validate',
  'yup.validate'
];

function hasValidation(controllerContent, methodName) {
  // Check if the method has any validation keywords
  const methodRegex = new RegExp(`(async\\s+)?${methodName}\\s*\\([^)]*\\)\\s*{`, 'g');
  const match = methodRegex.exec(controllerContent);

  if (!match) return false;

  // Get method body (roughly - look ahead ~100 lines or until next method)
  const startIdx = match.index;
  const nextMethodIdx = controllerContent.indexOf('async ', startIdx + 100);
  const endIdx = nextMethodIdx > 0 ? nextMethodIdx : startIdx + 2000;
  const methodBody = controllerContent.slice(startIdx, endIdx);

  return VALIDATION_KEYWORDS.some(keyword => methodBody.includes(keyword));
}

// Parse route files
for (const file of routeFiles) {
  const filePath = path.join(ROUTES_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const stats = {
    routes: [],
    withValidation: 0,
    withoutValidation: 0
  };

  // Extract controller import
  const controllerMatch = content.match(/import\s+(\w+)\s+from\s+['"]\.\.\/controllers\/(\w+)\.js['"]/);
  let controllerContent = '';

  if (controllerMatch) {
    const controllerFile = controllerMatch[2] + '.js';
    const controllerPath = path.join(CONTROLLERS_DIR, controllerFile);
    if (fs.existsSync(controllerPath)) {
      controllerContent = fs.readFileSync(controllerPath, 'utf8');
    }
  }

  // Find all route definitions
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]\s*,?\s*(.*?)\)/g;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    const middlewares = match[3];

    report.totalRoutes++;

    // Check if authentication middleware exists
    const hasAuth = middlewares.includes('authenticate') ||
                    middlewares.includes('getUserFromJwt') ||
                    middlewares.includes('requireAdmin');

    if (hasAuth) {
      report.routesWithAuth++;
    }

    // Extract controller method name
    const methodMatch = middlewares.match(/\w+Controller\.(\w+)/);
    const hasValidationCheck = methodMatch && controllerContent
      ? hasValidation(controllerContent, methodMatch[1])
      : false;

    const routeInfo = {
      method,
      path,
      hasAuth,
      hasValidation: hasValidationCheck,
      line: content.substring(0, match.index).split('\n').length
    };

    stats.routes.push(routeInfo);

    if (hasValidationCheck) {
      stats.withValidation++;
    } else {
      stats.withoutValidation++;
      report.routesWithoutValidation.push({
        file,
        ...routeInfo
      });
    }
  }

  report.fileStats[file] = stats;
}

// Print detailed report
console.log('📊 SUMMARY');
console.log('-'.repeat(80));
console.log(`Total routes found: ${report.totalRoutes}`);
console.log(`Routes with authentication: ${report.routesWithAuth} (${Math.round(report.routesWithAuth/report.totalRoutes*100)}%)`);
console.log(`Routes WITHOUT validation: ${report.routesWithoutValidation.length} (${Math.round(report.routesWithoutValidation.length/report.totalRoutes*100)}%)`);

console.log('\n📝 ROUTES WITHOUT VALIDATION:');
console.log('-'.repeat(80));

if (report.routesWithoutValidation.length === 0) {
  console.log('✅ All routes have validation!');
} else {
  // Group by file
  const grouped = {};
  report.routesWithoutValidation.forEach(route => {
    if (!grouped[route.file]) grouped[route.file] = [];
    grouped[route.file].push(route);
  });

  Object.entries(grouped).forEach(([file, routes]) => {
    console.log(`\n📄 ${file} (${routes.length} routes)`);
    routes.forEach(route => {
      console.log(`   ${route.hasAuth ? '🔒' : '🔓'} ${route.method.padEnd(6)} ${route.path}`);
    });
  });
}

console.log('\n📋 FILE STATISTICS:');
console.log('-'.repeat(80));
Object.entries(report.fileStats).forEach(([file, stats]) => {
  const total = stats.routes.length;
  const percent = total > 0 ? Math.round(stats.withValidation/total*100) : 0;
  console.log(`${file.padEnd(30)} ${stats.withValidation}/${total} (${percent}%) validated`);
});

console.log('\n' + '='.repeat(80));

// Exit with error code if validation is missing
if (report.routesWithoutValidation.length > 0) {
  console.log('\n⚠️  WARNING: Some routes are missing validation!');
  process.exit(1);
} else {
  console.log('\n✅ All routes have proper validation!');
  process.exit(0);
}


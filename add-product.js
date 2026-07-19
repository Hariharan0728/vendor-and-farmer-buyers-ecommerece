#!/usr/bin/env node
/**
 * AgriMarket — CLI Product Add Tool
 * Usage: node add-product.js
 *
 * Run this from the project root to add a product directly via the backend API.
 * You must first login as VENDOR or ADMIN to get a JWT token.
 */

const readline = require('readline');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:8080/api/v1';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function post(path, payload, token) {
  const body = JSON.stringify(payload);
  return httpRequest({
    hostname: 'localhost', port: 8080,
    path, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }, body);
}

function get(path, token) {
  return httpRequest({
    hostname: 'localhost', port: 8080,
    path, method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
}

function colorize(text, code) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

const green  = t => colorize(t, '32');
const yellow = t => colorize(t, '33');
const cyan   = t => colorize(t, '36');
const red    = t => colorize(t, '31');
const bold   = t => colorize(t, '1');

async function main() {
  console.log('\n' + bold(green('═══════════════════════════════════════════')));
  console.log(bold(green('   🌾  AgriMarket — CLI Product Manager')));
  console.log(bold(green('═══════════════════════════════════════════')) + '\n');

  // ─── STEP 1: LOGIN ───
  console.log(bold(cyan('── Step 1: Login ──────────────────────────')));
  const email    = await ask(yellow('  Email    : '));
  const password = await ask(yellow('  Password : '));

  console.log('\n  Logging in...');
  const loginRes = await post('/api/v1/auth/signin', { email, password });

  if (loginRes.status !== 200) {
    console.log(red(`\n  ✗ Login failed: ${loginRes.body?.message || 'Invalid credentials'}`));
    rl.close(); return;
  }

  const token  = loginRes.body.token;
  const userId = loginRes.body.id;
  const role   = loginRes.body.role;
  console.log(green(`  ✓ Logged in as ${loginRes.body.name} [${role}]\n`));

  if (!role.includes('VENDOR') && !role.includes('ADMIN')) {
    console.log(red('  ✗ Only VENDOR or ADMIN accounts can add products.'));
    rl.close(); return;
  }

  // ─── STEP 2: FETCH CATEGORIES ───
  console.log(bold(cyan('── Step 2: Choose Category ────────────────')));
  const catRes = await get('/api/v1/public/categories', token);
  if (catRes.status !== 200) {
    console.log(red('  ✗ Could not fetch categories. Is the backend running?'));
    rl.close(); return;
  }

  const categories = catRes.body;
  categories.forEach((c, i) => console.log(`  ${yellow(`[${i + 1}]`)} ${c.name} — ${c.description}`));

  const catIdx = parseInt(await ask(yellow('\n  Select category [1-' + categories.length + '] : '))) - 1;
  if (catIdx < 0 || catIdx >= categories.length) {
    console.log(red('  ✗ Invalid selection.')); rl.close(); return;
  }
  const selectedCategory = categories[catIdx];
  console.log(green(`  ✓ Category: ${selectedCategory.name}\n`));

  // ─── STEP 3: PRODUCT DETAILS ───
  console.log(bold(cyan('── Step 3: Product Details ─────────────────')));
  const name              = await ask(yellow('  Product Name        : '));
  const brand             = await ask(yellow('  Brand               : '));
  const description       = await ask(yellow('  Description         : '));
  const priceStr          = await ask(yellow('  Price (₹)           : '));
  const stockStr          = await ask(yellow('  Stock Quantity      : '));
  const cropsStr          = await ask(yellow('  Applicable Crops    : ') + cyan('(comma-separated, e.g. Wheat,Rice) '));
  const regNo             = await ask(yellow('  Reg. Number         : ') + cyan('(optional, press Enter to skip) '));

  console.log('\n  Unit options:');
  const units = ['50 kg bag', '25 kg bag', '10 kg packet', '1 kg packet', '1 Litre bottle', '500 gm packet'];
  units.forEach((u, i) => console.log(`  ${yellow(`[${i + 1}]`)} ${u}`));
  const unitIdx = parseInt(await ask(yellow('  Select unit [1-6]   : '))) - 1;
  const unit = units[Math.max(0, Math.min(unitIdx, units.length - 1))];

  // ─── STEP 4: IMAGE ───
  console.log('\n' + bold(cyan('── Step 4: Product Image ───────────────────')));
  console.log(cyan('  Options:'));
  console.log(`  ${yellow('[1]')} Provide a local image file path (JPG/PNG)`);
  console.log(`  ${yellow('[2]')} Enter a remote image URL (https://...)`);
  console.log(`  ${yellow('[3]')} Skip (no image)\n`);
  const imgChoice = await ask(yellow('  Choice [1/2/3]: '));

  let imageUrl = null;

  if (imgChoice.trim() === '1') {
    const imgPath = await ask(yellow('  Image file path : '));
    const absPath = path.resolve(imgPath.trim());
    if (!fs.existsSync(absPath)) {
      console.log(red('  ✗ File not found. Product will be saved without image.'));
    } else {
      const ext = path.extname(absPath).toLowerCase();
      const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
      const mime = mimeMap[ext] || 'image/jpeg';
      const fileData = fs.readFileSync(absPath);
      imageUrl = `data:${mime};base64,${fileData.toString('base64')}`;
      console.log(green(`  ✓ Image loaded from: ${absPath}`));
    }
  } else if (imgChoice.trim() === '2') {
    imageUrl = (await ask(yellow('  Image URL : '))).trim();
    if (!imageUrl.startsWith('http')) {
      console.log(red('  ✗ Invalid URL. Skipping image.'));
      imageUrl = null;
    } else {
      console.log(green(`  ✓ Image URL set.`));
    }
  } else {
    console.log(yellow('  ⓘ  No image added.'));
  }

  // ─── STEP 5: CONFIRM ───
  console.log('\n' + bold(cyan('── Step 5: Confirm ────────────────────────')));
  console.log(bold('\n  Product Summary:'));
  console.log(`  Name        : ${green(name)}`);
  console.log(`  Brand       : ${brand}`);
  console.log(`  Category    : ${selectedCategory.name}`);
  console.log(`  Price       : ₹${priceStr}`);
  console.log(`  Stock       : ${stockStr} units`);
  console.log(`  Unit        : ${unit}`);
  console.log(`  Crops       : ${cropsStr}`);
  console.log(`  Image       : ${imageUrl ? green('Attached') : yellow('None')}`);

  const confirm = await ask(yellow('\n  Publish this product? [y/n] : '));
  if (confirm.trim().toLowerCase() !== 'y') {
    console.log(yellow('\n  Cancelled. No product was added.')); rl.close(); return;
  }

  // ─── STEP 6: SUBMIT ───
  const payload = {
    name: name.trim(),
    brand: brand.trim(),
    description: description.trim(),
    categoryId: selectedCategory.id,
    price: parseFloat(priceStr),
    stockQuantity: parseInt(stockStr),
    unit,
    applicableCrops: cropsStr.split(',').map(s => s.trim()).filter(Boolean),
    registrationNumber: regNo.trim() || null,
    vendorId: userId,
    images: imageUrl ? [imageUrl] : [],
    status: 'ACTIVE',
  };

  console.log('\n  Uploading product...');
  const res = await post('/api/v1/vendor/products', payload, token);

  if (res.status === 200) {
    console.log('\n' + bold(green('═══════════════════════════════════════════')));
    console.log(bold(green('  ✅ Product published successfully!')));
    console.log(green(`     ID   : ${res.body.id}`));
    console.log(green(`     Name : ${res.body.name}`));
    console.log(bold(green('═══════════════════════════════════════════')));
  } else {
    console.log(red(`\n  ✗ Failed: ${JSON.stringify(res.body)}`));
  }

  rl.close();
}

main().catch(err => {
  console.error(red('\n  ✗ Unexpected error: ' + err.message));
  rl.close();
});

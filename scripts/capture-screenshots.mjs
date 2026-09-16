import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOTS_DIR = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('🚀 Iniciando Playwright para captura de vistas...');
  
  // Usamos el canal de Edge nativo de Windows para evitar descargas pesadas
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Calidad Retina / High-DPI
  });

  const page = await context.newPage();

  try {
    // 1. Login
    console.log('1. Capturando Login...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login.png') });
    console.log('✅ 01-login.png guardado');

    // Escuchar consola y errores de página
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

    // 2. Realizar Login con admin
    console.log('2. Iniciando sesión como admin@ventasfix.cl...');
    await page.locator('#email').fill('admin@ventasfix.cl');
    await delay(300);
    await page.locator('#password').fill('Admin1234!');
    await delay(300);
    await page.locator('button[type="submit"]').click();

    // Esperar navegación o verificar si ya cambió la URL
    try {
      await page.waitForURL('**/dashboard', { timeout: 5000 });
      console.log('URL tras login:', page.url());
    } catch {
      console.log('waitForURL timeout, verificando estado en página...');
      const url = page.url();
      console.log('URL actual:', url);
      // Si no navegó automáticamente por router.push, forzar navegación tras setear sesión
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@ventasfix.cl', password: 'Admin1234!' }),
      });
      const loginData = await res.json();
      if (loginData.data?.token) {
        await page.evaluate(({ token, user }) => {
          localStorage.setItem('ventasfix_token', token);
          localStorage.setItem('ventasfix_user', JSON.stringify(user));
        }, { token: loginData.data.token, user: loginData.data.user });
        await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle' });
      }
    }

    await page.waitForLoadState('networkidle');
    // Esperar a que los gráficos de Recharts animen completamente
    await delay(2500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-dashboard.png') });
    console.log('✅ 02-dashboard.png guardado (con gráficos interactivos)');

    // 3. Usuarios
    console.log('3. Capturando Usuarios...');
    await page.goto('http://localhost:3001/usuarios', { waitUntil: 'networkidle' });
    await delay(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-usuarios.png') });
    console.log('✅ 03-usuarios.png guardado');

    // 4. Productos (con miniaturas y paginación)
    console.log('4. Capturando Productos...');
    await page.goto('http://localhost:3001/productos', { waitUntil: 'networkidle' });
    await delay(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-productos.png') });
    console.log('✅ 04-productos.png guardado');

    // 5. Modal de Producto (con cálculo de IVA y previsualización de imagen)
    console.log('5. Capturando Modal de Producto...');
    const newProdBtn = page.getByRole('button', { name: /Nuevo Producto/i });
    if (await newProdBtn.isVisible()) {
      await newProdBtn.click();
      await delay(800);
      await page.fill('#sku', 'FIX-MAK-09');
      await page.fill('#nombre', 'Rotomartillo SDS Plus 800W');
      await page.fill('#precioNeto', '129990');
      await page.fill(
        '#imagen',
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80'
      );
      await delay(1200); // Esperar carga de preview de imagen y render de IVA
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-modal-producto.png') });
      console.log('✅ 05-modal-producto.png guardado');

      // Cerrar modal
      const cancelBtn = page.getByRole('button', { name: /Cancelar/i });
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await delay(500);
      }
    }

    // 6. Clientes
    console.log('6. Capturando Clientes...');
    await page.goto('http://localhost:3001/clientes', { waitUntil: 'networkidle' });
    await delay(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-clientes.png') });
    console.log('✅ 06-clientes.png guardado');

    console.log('🎉 Todas las capturas fueron tomadas exitosamente en:', SCREENSHOTS_DIR);
  } catch (error) {
    console.error('❌ Error capturando vistas:', error);
  } finally {
    await browser.close();
  }
}

capture();

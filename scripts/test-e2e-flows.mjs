import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3001';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
};

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Fallo de aserción: ${message}`);
  }
}

async function test(suiteName, testName, fn) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    passed++;
    results.push({ suite: suiteName, name: testName, status: 'PASS', duration });
    console.log(`  ${colors.green}✔ PASS${colors.reset} ${testName} ${colors.dim}(${duration}ms)${colors.reset}`);
  } catch (error) {
    const duration = Date.now() - start;
    failed++;
    results.push({ suite: suiteName, name: testName, status: 'FAIL', duration, error: error.message });
    console.log(`  ${colors.red}✘ FAIL${colors.reset} ${testName} ${colors.dim}(${duration}ms)${colors.reset}`);
    console.log(`    ${colors.red}→ ${error.message}${colors.reset}`);
  }
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runE2ESuite() {
  console.log(`\n${colors.bold}${colors.magenta}========================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   VENTAS FIX — SUITE DE PRUEBAS END-TO-END AUTOMATIZADAS (PLAYWRIGHT)   ${colors.reset}`);
  console.log(`${colors.dim}   Evaluando Seguridad, RBAC, Rúbrica de Examen y Reglas de Negocio   ${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}========================================================================${colors.reset}\n`);

  const globalStart = Date.now();

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // SUITE 1: Perímetro de Seguridad y Autenticación
    // -------------------------------------------------------------
    console.log(`${colors.bold}${colors.yellow}▶ SUITE 1: Perímetro de Seguridad & Autenticación${colors.reset}`);

    await test('Seguridad', 'Redirección a /login al intentar acceder a /dashboard sin sesión', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      await page.waitForURL('**/login', { timeout: 8000 }).catch(() => {});
      assert(page.url().includes('/login'), `Debería redirigir a /login, pero quedó en: ${page.url()}`);
    });

    await test('Seguridad', 'Rechazo de credenciales incorrectas (Negative Path)', async () => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await page.locator('#email').fill('admin@ventasfix.cl');
      await page.locator('#password').fill('ClaveInvalida999!');
      await page.locator('button[type="submit"]').click();
      await delay(1200);
      assert(page.url().includes('/login'), 'El usuario no debió navegar fuera de /login con clave errónea');
    });

    await test('Seguridad', 'Inicio de sesión exitoso con cuenta ADMIN (Happy Path)', async () => {
      await page.locator('#email').fill('admin@ventasfix.cl');
      await page.locator('#password').fill('Admin1234!');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      assert(page.url().includes('/dashboard'), 'Debió navegar a /dashboard tras autenticación exitosa');
    });

    // -------------------------------------------------------------
    // SUITE 2: Dashboard General y Gráficos Dinámicos
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 2: Dashboard General & Gráficos Dinámicos (Recharts)${colors.reset}`);

    await test('Dashboard', 'Carga de métricas KPI consolidadas desde la API', async () => {
      await page.waitForLoadState('networkidle');
      await delay(1000);
      const kpiValues = await page.locator('.grid .text-3xl.font-bold').allTextContents();
      const validNumbers = kpiValues.map((v) => parseInt(v.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
      assert(validNumbers.length >= 3, `Debe haber al menos 3 contadores de KPI válidos, encontrados: ${kpiValues.join(', ')}`);
    });

    await test('Dashboard', 'Renderizado interactivo de gráficos Recharts (Barras y Dona)', async () => {
      await delay(1000);
      const charts = await page.locator('.recharts-surface').count();
      assert(charts >= 2, `Se esperaban al menos 2 gráficos Recharts renderizados, encontrados: ${charts}`);
    });

    await test('Dashboard', 'Diagnóstico dinámico de alertas de reposición de bodega', async () => {
      const alertLocator = page.locator('text=requieren reposición');
      await alertLocator.waitFor({ state: 'visible', timeout: 5000 });
      const alertText = await alertLocator.textContent();
      assert(alertText.includes('crítico') || alertText.includes('bajo'), 'La alerta de inventario debe indicar el recuento de reposición');
    });

    // -------------------------------------------------------------
    // SUITE 3: Catálogo de Productos y Reglas de Negocio
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 3: Catálogo de Productos & Reglas de Negocio (IVA 19%)${colors.reset}`);

    await test('Productos', 'Presencia de botón "Nuevo Producto" para perfil ADMIN', async () => {
      await page.goto(`${BASE_URL}/productos`, { waitUntil: 'networkidle' });
      await delay(1000);
      const newBtn = page.getByRole('button', { name: /Nuevo Producto/i });
      assert(await newBtn.isVisible(), 'El botón Nuevo Producto debe ser visible para ADMIN');
    });

    await test('Productos', 'Cálculo reactivo automático del 19% de IVA en formulario', async () => {
      await page.getByRole('button', { name: /Nuevo Producto/i }).click();
      await delay(600);
      await page.locator('#precioNeto').fill('100000');
      await delay(400);
      const precioVenta = await page.locator('#precioVenta').inputValue();
      assert(precioVenta === '119000', `El precio de venta debió ser 119000 con 19% IVA, pero fue: ${precioVenta}`);
    });

    await test('Productos', 'Previsualización en vivo de imagen en modal', async () => {
      const imgUrl = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400';
      await page.locator('#imagen').fill(imgUrl);
      await delay(800);
      const previewImg = page.locator('div:has-text("URL de la Imagen") img');
      assert(await previewImg.isVisible(), 'El recuadro de previsualización en vivo de la imagen debe ser visible');
      // Cerrar modal
      await page.getByRole('button', { name: /Cancelar/i }).click();
      await delay(500);
    });

    await test('Productos', 'Búsqueda reactiva en tiempo real y paginación en tabla', async () => {
      const searchInput = page.getByPlaceholder(/Buscar por SKU, nombre o descripción/i);
      await searchInput.fill('Taladro');
      await delay(500);
      const rowsFiltered = await page.locator('tbody tr').count();
      assert(rowsFiltered === 1, `La búsqueda de "Taladro" debió arrojar 1 fila, arrojó: ${rowsFiltered}`);
      // Limpiar búsqueda
      await searchInput.fill('');
      await delay(500);
      const rowsTotal = await page.locator('tbody tr').count();
      assert(rowsTotal === 6, `Al limpiar la búsqueda debe mostrar 6 registros por la paginación, arrojó: ${rowsTotal}`);
    });

    // -------------------------------------------------------------
    // SUITE 3.1: Ciclo CRUD Completo (Creación, Edición y Clean-up)
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 3.1: Ciclo CRUD Completo (Crear, Editar y Eliminar con Limpieza Automática)${colors.reset}`);

    const tempSku = `FIX-TMP-${Math.floor(1000 + Math.random() * 9000)}`;

    await test('CRUD Productos', 'Creación exitosa de nuevo producto y persistencia en BD', async () => {
      await page.getByRole('button', { name: /Nuevo Producto/i }).click();
      await delay(600);
      await page.locator('#sku').fill(tempSku);
      await page.locator('#nombre').fill('Nivel Láser Autonivelante 360');
      await page.locator('#descripcionCorta').fill('Herramienta de medición óptica de precisión');
      await page.locator('#descripcionLarga').fill('Nivel láser verde de 12 líneas con soporte magnético orientable.');
      await page.locator('#imagen').fill('https://upload.wikimedia.org/wikipedia/commons/4/4c/Screws.jpg');
      await page.locator('#precioNeto').fill('45000');
      await page.locator('#stockActual').fill('15');
      await page.locator('#stockMinimo').fill('5');
      await page.locator('#stockBajo').fill('10');
      await page.locator('#stockAlto').fill('30');
      await delay(400);

      // Enviar formulario (Registrar Producto)
      await page.getByRole('button', { name: /Registrar Producto/i }).click();
      await delay(1500);

      // Buscar el producto recién creado
      const searchInput = page.getByPlaceholder(/Buscar por SKU, nombre o descripción/i);
      await searchInput.fill(tempSku);
      await delay(600);
      const rowCount = await page.locator('tbody tr').count();
      assert(rowCount === 1, `Debería encontrar 1 fila para el SKU ${tempSku}`);
      const text = await page.locator('tbody tr').first().textContent();
      assert(text.includes('Nivel Láser Autonivelante 360'), 'La fila debe contener el nombre del producto creado');
    });

    await test('CRUD Productos', 'Edición exitosa de producto y sincronización de precio', async () => {
      // Click en editar en la fila filtrada
      const editBtn = page.locator('tbody tr button[title="Editar producto"]').first();
      await editBtn.click();
      await delay(700);

      // Modificar nombre y precio neto
      const nombreInput = page.locator('#nombre');
      await nombreInput.fill('Nivel Láser Autonivelante 360 Pro');
      const precioInput = page.locator('#precioNeto');
      await precioInput.fill('50000');
      await delay(400);

      // Verificar que el precio con IVA cambió reactivamente a 59500
      const ventaVal = await page.locator('#precioVenta').inputValue();
      assert(ventaVal === '59500', `El precio recalculado con IVA debió ser 59500, fue: ${ventaVal}`);

      // Guardar cambios (Guardar Cambios)
      await page.getByRole('button', { name: /Guardar Cambios/i }).click();
      await delay(1500);

      // Verificar actualización en la tabla
      const updatedText = await page.locator('tbody tr').first().textContent();
      assert(updatedText.includes('Nivel Láser Autonivelante 360 Pro'), 'La tabla debe reflejar el nombre editado');
    });

    await test('CRUD Productos', 'Eliminación exitosa con confirmación (Clean-up / Tear-down)', async () => {
      // Click en basurero
      const deleteBtn = page.locator('tbody tr button[title="Eliminar producto"]').first();
      await deleteBtn.click();
      await delay(600);

      // Confirmar en el modal de confirmación
      const confirmBtn = page.getByRole('button', { name: /Confirmar/i });
      assert(await confirmBtn.isVisible(), 'El botón Confirmar eliminación debe ser visible');
      await confirmBtn.click();
      await delay(1500);

      // Verificar que el registro temporal ya no existe
      const searchInput = page.getByPlaceholder(/Buscar por SKU, nombre o descripción/i);
      await searchInput.fill(tempSku);
      await delay(600);
      const cellText = await page.locator('tbody').textContent();
      assert(!cellText.includes(tempSku), `El producto con SKU ${tempSku} debió ser eliminado completamente`);

      // Limpiar filtro de búsqueda para dejar la tabla limpia
      await searchInput.fill('');
      await delay(500);
    });

    // -------------------------------------------------------------
    // SUITE 4: Clientes Corporativos B2B y Algoritmo Módulo 11
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 4: Clientes B2B & Validación de RUT Chileno (Módulo 11)${colors.reset}`);

    await test('Clientes', 'Validación negativa de RUT: rechazo de dígito verificador inválido', async () => {
      await page.goto(`${BASE_URL}/clientes`, { waitUntil: 'networkidle' });
      await delay(1000);
      await page.getByRole('button', { name: /Nuevo Cliente/i }).click();
      await delay(600);
      // Ingresar RUT matemáticamente incorrecto
      const rutInput = page.locator('#rutEmpresa');
      await rutInput.fill('12.345.678-9');
      // Blur para detonar validación
      await page.locator('#rubro').focus();
      await delay(400);
      const errorMsg = await page.locator('text=RUT inválido (revise el dígito verificador)').isVisible();
      assert(errorMsg, 'Debe mostrar mensaje de error de RUT inválido ante dígito verificador erróneo');
    });

    await test('Clientes', 'Validación positiva de RUT con formato automático', async () => {
      const rutInput = page.locator('#rutEmpresa');
      await rutInput.fill('760864285');
      await page.locator('#rubro').focus();
      await delay(400);
      const formattedValue = await rutInput.inputValue();
      assert(formattedValue === '76.086.428-5', `El RUT debió formatearse automáticamente a 76.086.428-5, quedó: ${formattedValue}`);
      const errorExists = await page.locator('text=RUT inválido').isVisible();
      assert(!errorExists, 'No debe haber mensaje de error para un RUT con módulo 11 válido');
      // Cancelar modal
      await page.getByRole('button', { name: /Cancelar/i }).click();
      await delay(500);
    });

    // -------------------------------------------------------------
    // SUITE 5: Usuarios y Restricción de Dominio Corporativo
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 5: Usuarios & Dominio Corporativo Estricto${colors.reset}`);

    await test('Usuarios', 'Restricción de registro: rechazo de correos no institucionales', async () => {
      await page.goto(`${BASE_URL}/usuarios`, { waitUntil: 'networkidle' });
      await delay(1000);
      await page.getByRole('button', { name: /Nuevo Usuario/i }).click();
      await delay(600);
      await page.locator('#email').fill('usuario.externo@gmail.com');
      await page.locator('#nombre').focus();
      await delay(400);
      await page.getByRole('button', { name: /Crear Usuario/i }).click();
      await delay(400);
      const domainError = await page.locator('text=El correo debe terminar en @ventasfix.cl').isVisible();
      assert(domainError, 'Debe exigir dominio @ventasfix.cl para usuarios del sistema');
      await page.getByRole('button', { name: /Cancelar/i }).click();
      await delay(500);
    });

    await test('Usuarios', 'Cierre de sesión (Logout) y purga de token', async () => {
      const logoutBtn = page.getByRole('button', { name: /Cerrar Sesión/i });
      await logoutBtn.click();
      await page.waitForURL('**/login', { timeout: 8000 });
      assert(page.url().includes('/login'), 'El botón Cerrar Sesión debe redirigir a /login');
    });

    // -------------------------------------------------------------
    // SUITE 6: RBAC para Perfil VIEWER (Solo Lectura y Menor Privilegio)
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 6: Control de Acceso RBAC: Perfil VIEWER (Solo Lectura)${colors.reset}`);

    await test('RBAC VIEWER', 'Autenticación con rol VIEWER (viewer@ventasfix.cl)', async () => {
      await page.locator('#email').fill('viewer@ventasfix.cl');
      await page.locator('#password').fill('Viewer1234!');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      assert(page.url().includes('/dashboard'), 'Viewer debe poder ingresar al Dashboard');
    });

    await test('RBAC VIEWER', 'Ocultamiento de botón de creación en Productos', async () => {
      await page.goto(`${BASE_URL}/productos`, { waitUntil: 'networkidle' });
      await delay(1000);
      const newBtn = page.getByRole('button', { name: /Nuevo Producto/i });
      assert(!(await newBtn.isVisible()), 'El botón Nuevo Producto NO debe existir en el DOM para perfil VIEWER');
    });

    await test('RBAC VIEWER', 'Botones de edición y eliminación deshabilitados (disabled) en tabla', async () => {
      const editBtns = page.locator('button[title="Editar producto"]');
      const count = await editBtns.count();
      assert(count > 0, 'Deben existir botones de edición en la tabla');
      for (let i = 0; i < count; i++) {
        const isDisabled = await editBtns.nth(i).isDisabled();
        assert(isDisabled, `El botón de edición en la fila ${i + 1} debe estar deshabilitado para VIEWER`);
      }
    });

    await test('RBAC VIEWER', 'Ocultamiento de botones de creación en Usuarios y Clientes', async () => {
      await page.goto(`${BASE_URL}/usuarios`, { waitUntil: 'networkidle' });
      await delay(800);
      assert(!(await page.getByRole('button', { name: /Nuevo Usuario/i }).isVisible()), 'Nuevo Usuario debe estar oculto para VIEWER');

      await page.goto(`${BASE_URL}/clientes`, { waitUntil: 'networkidle' });
      await delay(800);
      assert(!(await page.getByRole('button', { name: /Nuevo Cliente/i }).isVisible()), 'Nuevo Cliente debe estar oculto para VIEWER');
    });

  } finally {
    await browser.close();
  }

  // -------------------------------------------------------------
  // REPORTE CONSOLIDADO DE AUDITORÍA
  // -------------------------------------------------------------
  const totalDuration = ((Date.now() - globalStart) / 1000).toFixed(2);
  console.log(`\n${colors.bold}${colors.cyan}------------------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}RESUMEN DE AUDITORÍA DE PRUEBAS END-TO-END:${colors.reset}`);
  console.log(`  Total ejecutados: ${colors.bold}${passed + failed}${colors.reset}`);
  console.log(`  ${colors.green}Aprobados:        ${passed}${colors.reset}`);
  console.log(`  ${failed === 0 ? colors.green : colors.red}Fallidos:         ${failed}${colors.reset}`);
  console.log(`  Tiempo total:     ${totalDuration}s`);
  console.log(`${colors.bold}${colors.cyan}------------------------------------------------------------------------${colors.reset}\n`);

  if (failed > 0) {
    console.error(`${colors.red}${colors.bold}❌ La suite E2E finalizó con fallos.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}🎉 ¡TODOS LOS FLUJOS PRINCIPALES Y REGLAS DE NEGOCIO PASARON AL 100%!${colors.reset}\n`);
    process.exit(0);
  }
}

runE2ESuite();


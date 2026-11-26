import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('gallery, image preview and table work with keyboard navigation', async ({ page }) => {
  await page.goto('./');
  const directory = page.locator('main > section').nth(1);
  await expect(directory.getByRole('list')).toBeVisible();
  await directory.getByRole('button', { name: 'Ampliar Retrato de Ana García' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Vista ampliada de la foto' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Vista ampliada de la foto' })).toBeHidden();
  await directory.getByRole('button', { name: 'Tabla' }).click();
  await expect(directory.getByRole('table', { name: 'Equipo con fotografías' })).toBeVisible();
  await expect(directory.getByRole('columnheader', { name: 'Nombre' })).toBeVisible();
});

test('editable example validates a draft and saves it', async ({ page }) => {
  await page.goto('./');
  const editor = page.locator('main > section').nth(4);
  const name = editor.getByRole('textbox', { name: 'Nombre' }).first();
  await name.fill('A');
  await editor.getByRole('button', { name: 'Guardar' }).first().click();
  await expect(editor.getByText('Escribe al menos dos caracteres')).toBeVisible();
  await name.fill('Ana Nueva');
  await editor.getByRole('button', { name: 'Guardar' }).first().click();
  await expect(editor.getByText('Se guardó Ana Nueva')).toBeVisible();
});

test('gallery and editable table have no detectable accessibility violations', async ({ page }) => {
  await page.goto('./');
  for (const index of [1, 4]) {
    const results = await new AxeBuilder({ page })
      .include(`main > section:nth-of-type(${index + 1}) .dt-container`).analyze();
    expect(results.violations).toEqual([]);
  }
});

test('virtualized table keeps the DOM bounded while scrolling', async ({ page }) => {
  await page.goto('../benchmarks/?rows=5000&virtualized=true');
  const table = page.getByRole('table');
  await expect(table.getByRole('cell', { name: 'Person 1', exact: true })).toBeVisible();
  expect(await table.locator('tbody tr').count()).toBeLessThan(50);
  await page.locator('.dt-scroll').evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(table.getByRole('cell', { name: 'Person 5000', exact: true })).toBeVisible();
  expect(await table.locator('tbody tr').count()).toBeLessThan(50);
});

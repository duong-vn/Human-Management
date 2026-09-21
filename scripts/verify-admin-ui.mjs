import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Render the real TSX components using the frontend's existing dependencies.
const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
require.extensions['.tsx'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
const component = (name) => require(fileURLToPath(new URL(`../frontend/src/components/ui/${name}.tsx`, import.meta.url)));
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));
const { DataTable } = component('DataTable');
const { Button } = component('Button');
const { Modal } = component('Modal');
const { ConfirmDialog } = component('ConfirmDialog');
const { PageHeader } = component('PageHeader');
const tableProps = {
  columns: [{ header: 'Họ tên', accessor: 'name' }],
  data: [{ id: '1', name: 'Nguyễn Thị Ánh' }],
  keyExtractor: (row) => row.id,
};
const populated = render(DataTable, tableProps);
assert.match(populated, /Nguyễn Thị Ánh/, 'Table must preserve Vietnamese text');
assert.match(populated, /scope="col"/, 'Column headers must identify their scope');
assert.match(render(DataTable, { ...tableProps, isLoading: true }), /aria-busy="true"/, 'Loading must be announced');
const failure = render(DataTable, { ...tableProps, data: [], isError: true, errorMessage: 'Không tải được dữ liệu', onRetry() {} });
assert.match(failure, /role="alert"/, 'API errors must be announced');
assert.match(failure, /Không tải được dữ liệu/);
assert.match(failure, /Thử lại/);
assert.doesNotMatch(failure, /Không tìm thấy dữ liệu phù hợp/, 'Error must not appear as an empty result');
assert.match(render(DataTable, { ...tableProps, data: [] }), /Không tìm thấy dữ liệu phù hợp/);
const paginated = render(DataTable, { ...tableProps, pagination: { currentPage: 1, totalPages: 2, onPageChange() {} } });
assert.match(paginated, /disabled=""[^>]*>[\s\S]*?Trước/, 'Previous must be disabled on first page');
const loadingButton = render(Button, { isLoading: true, children: 'Lưu' });
assert.match(loadingButton, /disabled=""/);
assert.match(loadingButton, /aria-busy="true"/);
assert.equal(render(Modal, { isOpen: false, onClose() {}, children: 'Nội dung' }), '', 'Closed modal must not expose content');
const modal = render(Modal, { isOpen: true, title: 'Chi tiết hộ', onClose() {}, children: 'Nội dung' });
assert.match(modal, /<dialog/);
assert.match(modal, /aria-labelledby="[^"]+"/);
assert.match(modal, /Đóng cửa sổ/);
const confirmation = render(ConfirmDialog, { isOpen: true, onClose() {}, onConfirm() {}, title: 'Xác nhận xóa', message: 'Thao tác không thể hoàn tác.' });
assert.match(confirmation, /role="alertdialog"/);
assert.match(confirmation, /aria-labelledby="[^"]+"/);
assert.match(confirmation, /Hủy bỏ/);
const pageHeaderHtml = render(PageHeader, { title: 'Hộ khẩu', breadcrumbs: [{ label: 'Tổng quan', href: '/' }, { label: 'Hộ khẩu' }] });
assert.match(pageHeaderHtml, /aria-label="Đường dẫn"/);
assert.doesNotMatch(pageHeaderHtml, /\bmb-5\b/, 'PageHeader must not compound bottom margin; parent page-stack manages gap');

const { StatsToggle } = component('StatsVisibility');
const toggleExpanded = render(StatsToggle, { expanded: true, onToggle() {}, controls: 'stats-grid-1' });
assert.match(toggleExpanded, /aria-expanded="true"/, 'Toggle must convey expanded state');
assert.match(toggleExpanded, /aria-controls="stats-grid-1"/, 'Toggle must associate with controlled element');
assert.match(toggleExpanded, /Thu gọn số liệu/);

const toggleCollapsed = render(StatsToggle, { expanded: false, onToggle() {}, controls: 'stats-grid-1' });
assert.match(toggleCollapsed, /aria-expanded="false"/, 'Toggle must convey collapsed state');
assert.match(toggleCollapsed, /aria-controls="stats-grid-1"/, 'Toggle must associate with controlled element');
assert.match(toggleCollapsed, /Hiện số liệu/);

const { StatCard } = component('StatCard');
const statProps = { title: 'Tổng nhân khẩu', value: 0, icon: React.createElement('svg'), subtitle: 'Năm 2026', trend: { value: 'Đã thu', isPositive: true } };
assert.equal(render(StatCard, statProps), render(StatCard, { ...statProps, variant: 'default' }), 'Existing StatCard callers must retain default output');
for (const variant of ['primary', 'compact']) {
  const stat = render(StatCard, { ...statProps, variant });
  if (variant === 'compact') {
    assert.match(stat, /rounded-xl/, 'StatCard compact must use rounded-xl for soft modern corners');
    assert.match(stat, /shadow-2xs/, 'StatCard compact must have subdued shadow');
  }
  assert.match(stat, /<dt\b[^>]*>Tổng nhân khẩu<\/dt>/, 'Summary label must describe its value');
  assert.match(stat, /<dd\b[^>]*>0<\/dd>/, 'Zero must not disappear');
  assert.match(stat, /Năm 2026/);
  assert.match(stat, /Đã thu/);
  assert.doesNotMatch(stat, /(?:bg|text|border)-(?:blue|emerald|rose|purple|pink)-/, 'Quiet variants must not inherit bright accents');
  assert.doesNotMatch(stat, /role="button"|tabindex=/, 'Read-only stats must not imply interaction');
  assert.ok(render(StatCard, { title: 'Tổng thu', value: '999.999.999.999 ₫', variant }).includes('999.999.999.999 ₫'));
  assert.ok(render(StatCard, { title: 'Đợt thu', value: 'Chưa chọn', variant }).includes('Chưa chọn'));
}

const targetPages = [
  'frontend/src/app/thong-ke/page.tsx',
  'frontend/src/app/nhan-khau/page.tsx',
  'frontend/src/app/thu-phi/page.tsx',
  'frontend/src/app/thu-phi/ve-sinh/page.tsx',
  'frontend/src/app/thu-phi/dong-gop/page.tsx',
  'frontend/src/app/ho-khau/thong-ke/page.tsx',
  'frontend/src/app/page.tsx',
];

for (const pagePath of targetPages) {
  const content = readFileSync(fileURLToPath(new URL(`../${pagePath}`, import.meta.url)), 'utf8');
  assert.match(content, /useStatsVisibility/, `${pagePath} must use useStatsVisibility hook`);
  assert.match(content, /StatsToggle/, `${pagePath} must render StatsToggle component`);
  assert.match(content, /hidden=\{!showStats\}/, `${pagePath} must pass hidden attribute to stat grid`);
  assert.match(content, /showStats\s*\?\s*["'][^"']*grid[^"']*["']\s*:\s*["']hidden["']/, `${pagePath} must conditionally swap grid and hidden classes`);

  // Verify wrapping action groups
  const actionsMatch = content.match(/actions=\{([\s\S]*?)\n\s*\}/);
  if (actionsMatch && actionsMatch[1].includes('flex')) {
    assert.match(actionsMatch[1], /flex-wrap/, `${pagePath} actions group must include flex-wrap`);
    assert.match(actionsMatch[1], /min-w-0/, `${pagePath} actions group must include min-w-0`);
  }
}

// Regression check 1: Confirmation before logout effects in Sidebar.tsx
const sidebarContent = readFileSync(fileURLToPath(new URL('../frontend/src/components/Sidebar.tsx', import.meta.url)), 'utf8');
const sidebarSource = ts.createSourceFile('Sidebar.tsx', sidebarContent, ts.ScriptTarget.Latest, true);
let handleLogoutFound = false;
let confirmBeforeEffects = false;

function inspectSidebar(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(sidebarSource) === 'handleLogout') {
    handleLogoutFound = true;
    const init = node.initializer;
    if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
      const statements = init.body.statements;
      if (statements && statements.length > 0) {
        const firstStmt = statements[0];
        if (ts.isIfStatement(firstStmt)) {
          const condText = firstStmt.expression.getText(sidebarSource);
          const thenText = firstStmt.thenStatement.getText(sidebarSource);
          if (condText.includes('confirm') && condText.includes('đăng xuất') && thenText.includes('return')) {
            confirmBeforeEffects = true;
          }
        }
      }
    }
  }
  ts.forEachChild(node, inspectSidebar);
}
inspectSidebar(sidebarSource);
assert.ok(handleLogoutFound, 'Sidebar.tsx must define handleLogout');
assert.ok(confirmBeforeEffects, 'Sidebar.tsx handleLogout must confirm in Vietnamese and return early before any logout effects');

// Regression check 2: Conditional controls in ve-sinh (StatsToggle gated on activeKhoanThu)
const veSinhContent = readFileSync(fileURLToPath(new URL('../frontend/src/app/thu-phi/ve-sinh/page.tsx', import.meta.url)), 'utf8');
const veSinhSource = ts.createSourceFile('page.tsx', veSinhContent, ts.ScriptTarget.Latest, true);
let veSinhToggleGated = false;

function inspectVeSinh(node) {
  if (ts.isConditionalExpression(node)) {
    const cond = node.condition.getText(veSinhSource);
    const whenTrue = node.whenTrue.getText(veSinhSource);
    if (cond.includes('activeKhoanThu') && whenTrue.includes('StatsToggle')) {
      veSinhToggleGated = true;
    }
  }
  ts.forEachChild(node, inspectVeSinh);
}
inspectVeSinh(veSinhSource);
assert.ok(veSinhToggleGated, 've-sinh page must gate StatsToggle on activeKhoanThu so toggle never renders without stats grid');

// Regression check 3: Keyboard-reachable drilldowns in thu-phi
const thuPhiContent = readFileSync(fileURLToPath(new URL('../frontend/src/app/thu-phi/page.tsx', import.meta.url)), 'utf8');
const thuPhiSource = ts.createSourceFile('page.tsx', thuPhiContent, ts.ScriptTarget.Latest, true);
let buttonDrilldownCount = 0;

function inspectThuPhi(node) {
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    if (node.tagName.getText(thuPhiSource) === 'button') {
      const hasOpenModal = node.attributes.properties.some(p => p.getText(thuPhiSource).includes('openModal'));
      const hasTypeButton = node.attributes.properties.some(p => p.getText(thuPhiSource).includes('type="button"'));
      const hasTextLeft = node.attributes.properties.some(p => p.getText(thuPhiSource).includes('text-left'));
      const hasMinW0 = node.attributes.properties.some(p => p.getText(thuPhiSource).includes('min-w-0'));
      if (hasOpenModal && hasTypeButton && hasTextLeft && hasMinW0) {
        buttonDrilldownCount++;
      }
    }
  }
  ts.forEachChild(node, inspectThuPhi);
}
inspectThuPhi(thuPhiSource);
assert.equal(buttonDrilldownCount, 3, 'thu-phi page must render 3 semantic, keyboard-reachable button drilldowns for metrics');

console.log('Admin UI: real component rendering, stat variants, table states, pagination, labels, dialog semantics, shared visibility toggle, and summary consistency passed.');

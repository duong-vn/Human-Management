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
assert.match(render(PageHeader, { title: 'Hộ khẩu', breadcrumbs: [{ label: 'Tổng quan', href: '/' }, { label: 'Hộ khẩu' }] }), /aria-label="Đường dẫn"/);
const { StatCard } = component('StatCard');
const statProps = { title: 'Tổng nhân khẩu', value: 0, icon: React.createElement('svg'), subtitle: 'Năm 2026', trend: { value: 'Đã thu', isPositive: true } };
assert.equal(render(StatCard, statProps), render(StatCard, { ...statProps, variant: 'default' }), 'Existing StatCard callers must retain default output');
for (const variant of ['primary', 'compact']) {
  const stat = render(StatCard, { ...statProps, variant });
  if (variant === 'compact') {
    assert.match(stat, /rounded-xl/, 'StatCard compact must use rounded-xl for soft modern corners');
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
console.log('Admin UI: real component rendering, stat variants, table states, pagination, labels and dialog semantics passed.');

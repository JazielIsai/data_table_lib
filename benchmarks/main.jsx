import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Table } from '@isai_dev/data_table_lib';
import '@isai_dev/data_table_lib/style.css';

const query = new URLSearchParams(location.search);
const count = Math.max(1, Math.min(Number(query.get('rows')) || 1000, 10_000));
const paginated = query.get('paginated') === 'true';
const virtualized = query.get('virtualized') === 'true';
const rows = Array.from({ length: count }, (_, index) => ({
  id: index + 1, name: `Person ${index + 1}`,
  team: ['Design', 'Product', 'Engineering'][index % 3],
  score: index % 100
}));
const columns = ['name', 'team', 'score'].map((field) => ({ field, headerName: field }));
const started = performance.now();

function Benchmark() {
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__DT_BENCHMARK = {
        rows: count, paginated, virtualized, elapsedMs: performance.now() - started,
        renderedRows: document.querySelectorAll('.dt-table tbody tr').length
      };
    }));
  }, []);
  return <Table rows={rows} columns={columns} locale="en"
    paginationEnabled={paginated} virtualization={virtualized}
    pagination={paginated ? { pageIndex: 0, pageSize: 50 } : undefined} />;
}

createRoot(document.getElementById('root')).render(<Benchmark />);

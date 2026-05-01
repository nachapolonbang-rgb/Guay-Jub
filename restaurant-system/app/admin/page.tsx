export default function AdminPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        <div style={{ border: '1px solid #ccc', padding: 20 }}>
          <h3>Orders Today</h3>
          <p>12</p>
        </div>

        <div style={{ border: '1px solid #ccc', padding: 20 }}>
          <h3>Cooking</h3>
          <p>5</p>
        </div>

        <div style={{ border: '1px solid #ccc', padding: 20 }}>
          <h3>Done</h3>
          <p>20</p>
        </div>
      </div>
    </div>
  );
}
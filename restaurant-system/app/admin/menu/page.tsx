'use client';

import { useState } from 'react';

export default function MenuPage() {
  const [menus, setMenus] = useState([
    { id: 1, name: 'Fried Rice', price: 50 },
    { id: 2, name: 'Pad Thai', price: 60 },
  ]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Menu Management</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {menus.map(menu => (
            <tr key={menu.id}>
              <td>{menu.id}</td>
              <td>{menu.name}</td>
              <td>{menu.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
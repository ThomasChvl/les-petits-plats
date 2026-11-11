export default function MaterialList({ items }) {
  return (
    <ul className="material-list">
      {items.map(({ name, quantity }) => (
        <li key={name}>
          <span className="material-name">{name}</span>
          {quantity !== undefined && (
            <span className="material-quantity">{quantity}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

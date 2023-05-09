import emptyState from "../assets/empty-state.jpg";

export function PageNotFound({ description }: { description: string }) {
  return (
    <div className="page-not-found">
      <img src={emptyState} alt="" className="page-not-found-image" />
      <div className="page-not-found-text">
        <div className="page-not-found-text">{description}</div>
        <a href="/home">Go back to home</a>
      </div>
    </div>
  );
}

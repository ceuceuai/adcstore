export default function AdminLoading(){
  return <div className="adminRouteLoading" aria-live="polite">
    <div className="routeSkeletonHead"></div>
    <div className="routeSkeletonGrid">
      <div></div><div></div><div></div>
    </div>
  </div>;
}

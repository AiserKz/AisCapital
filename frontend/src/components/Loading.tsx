export function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex justify-center items-center">
        <p className="loading loading-lg text-info loading-infinity w-18 h-18"></p>
        <p className="text-2xl animate-pulse">Загрузка...</p>
      </div>
    </div>
  );
}

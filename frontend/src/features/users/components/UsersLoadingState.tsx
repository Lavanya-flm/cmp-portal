export function UsersLoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100">
          <td className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-200" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3.5 w-28 rounded bg-gray-200" />
                <div className="h-3 w-36 rounded bg-gray-100" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-40 rounded bg-gray-100" /></td>
          <td className="px-4 py-3.5"><div className="h-5 w-20 rounded-full bg-gray-100" /></td>
          <td className="px-4 py-3.5"><div className="h-5 w-16 rounded-full bg-gray-100" /></td>
          <td className="px-4 py-3.5"><div className="h-3.5 w-24 rounded bg-gray-100" /></td>
          <td className="px-4 py-3.5"><div className="flex gap-1.5"><div className="h-7 w-7 rounded-lg bg-gray-100" /><div className="h-7 w-7 rounded-lg bg-gray-100" /><div className="h-7 w-7 rounded-lg bg-gray-100" /></div></td>
        </tr>
      ))}
    </>
  );
}

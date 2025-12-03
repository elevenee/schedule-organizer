export default function PermissionDenied() {
    return (
        <div className="p-10 text-center">
            <h1 className="text-3xl font-bold">Permission Denied</h1>
            <p className="mt-2 text-gray-500">
                Anda tidak memiliki akses ke halaman ini.
            </p>
        </div>
    );
}

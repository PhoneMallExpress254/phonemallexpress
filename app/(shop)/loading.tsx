export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[50vh] w-full">
            <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-muted rounded-full opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-accent rounded-full animate-spin"></div>
            </div>
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action
}) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            {Icon && (
                <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Icon className="w-12 h-12 text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    {description}
                </p>
            )}
            {action && action}
        </div>
    );
}

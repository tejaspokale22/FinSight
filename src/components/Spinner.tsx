const Spinner = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-10 h-10",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}></div>
        {/* Inner spinning ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-black border-t-transparent animate-spin absolute top-0 left-0`}></div>
      </div>
    </div>
  )
}

export default Spinner;
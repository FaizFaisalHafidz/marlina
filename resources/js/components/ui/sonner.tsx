import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-data-[type=success]:bg-green-50 group-data-[type=success]:text-green-900 group-data-[type=success]:border-green-200",
          description: "group-data-[type=success]:text-green-700",
          actionButton: "group-data-[type=success]:bg-green-600 group-data-[type=success]:text-white",
          cancelButton: "group-data-[type=success]:bg-green-100 group-data-[type=success]:text-green-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

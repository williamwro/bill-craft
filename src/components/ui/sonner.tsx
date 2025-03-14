
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast, ToastT } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      expand
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:!bg-green-50 group-[.toast]:!text-green-800 dark:group-[.toast]:!bg-green-900/20 dark:group-[.toast]:!text-green-300",
          error: "group-[.toast]:!bg-red-50 group-[.toast]:!text-red-800 dark:group-[.toast]:!bg-red-900/20 dark:group-[.toast]:!text-red-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

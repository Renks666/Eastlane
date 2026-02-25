"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "eastlane-toast",
          title: "eastlane-toast-title",
          description: "eastlane-toast-description",
          actionButton: "eastlane-toast-action",
          cancelButton: "eastlane-toast-cancel",
          success: "eastlane-toast-success",
          error: "eastlane-toast-error",
          warning: "eastlane-toast-warning",
          info: "eastlane-toast-info",
        },
        style: {
          background: '#ffffff',
          color: '#0f1720',
          border: '1px solid rgba(15, 63, 51, 0.08)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

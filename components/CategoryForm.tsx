"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { createCategory, updateCategory } from "@/app/admin/categories/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Slug may contain only lowercase letters, numbers and hyphens."),
})

type CategoryFormValues = z.infer<typeof categorySchema>

type CategoryData = {
  id: number
  name: string
  slug: string
}

type CategoryFormProps = {
  mode: "create" | "edit"
  category?: CategoryData
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [slugManuallyChanged, setSlugManuallyChanged] = useState(mode === "edit")
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
    },
  })

  const nameValue = useWatch({ control: form.control, name: "name" })

  useEffect(() => {
    if (!slugManuallyChanged) {
      form.setValue("slug", slugify(nameValue), { shouldValidate: true })
    }
  }, [form, nameValue, slugManuallyChanged])

  const onSubmit = (values: CategoryFormValues) => {
    setFormError(null)
    const formData = new FormData()
    formData.set("name", values.name)
    formData.set("slug", values.slug)

    startTransition(async () => {
      const result =
        mode === "create" ? await createCategory(formData) : await updateCategory(category!.id, formData)

      if (!result.ok) {
        setFormError(result.error ?? "Operation failed.")
        toast.error(result.error ?? "Operation failed.")
        return
      }

      toast.success(mode === "create" ? "Category created." : "Category updated.")
      router.push("/admin/categories")
      router.refresh()
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create Category" : "Edit Category"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        setSlugManuallyChanged(true)
                        field.onChange(slugify(event.target.value))
                      }}
                      placeholder="example-category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : mode === "create" ? "Create category" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

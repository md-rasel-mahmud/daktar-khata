import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card"
import { Button } from "@repo/ui/button"
import { Badge } from "@repo/ui/badge"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Textarea } from "@repo/ui/textarea"
import { Switch } from "@repo/ui/switch"
import { Skeleton } from "@repo/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Search,
  Calendar,
  ExternalLink,
} from "lucide-react"
import {
  useGetAllBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  type BlogItem,
} from "@/lib/store/api/services/blog.service"
import { useUploadImageMutation } from "@/lib/store/api/services/landing-content.service"
import RichEditor from "@/components/common/form/RichEditor"
import { toast } from "sonner"
import { format } from "date-fns"

export const ManageBlogs: React.FC = () => {
  const { t } = useTranslation()
  const { data: blogs = [], isLoading } = useGetAllBlogsQuery({ all: true })
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation()
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation()
  const [deleteBlog] = useDeleteBlogMutation()
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation()

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null)
  const [previewBlog, setPreviewBlog] = useState<BlogItem | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await uploadImage(formData).unwrap()
      if (res?.url) {
        setForm((prev) => ({ ...prev, image: res.url }))
        toast.success(t("Image uploaded successfully"))
      }
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to upload image"))
    }
  }

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "Clinic Management",
    description: "",
    content: "",
    image: "",
    authorName: "Admin",
    isPublished: true,
  })

  const handleOpenCreate = () => {
    setEditingBlog(null)
    setForm({
      title: "",
      slug: "",
      category: "Clinic Management",
      description: "",
      content: "",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
      authorName: "Admin",
      isPublished: true,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (blog: BlogItem) => {
    setEditingBlog(blog)
    setForm({
      title: blog.title,
      slug: blog.slug,
      category: blog.category || "Clinic Management",
      description: blog.description || "",
      content: blog.content,
      image: blog.image || "",
      authorName: blog.authorName || "Admin",
      isPublished: blog.isPublished,
    })
    setIsDialogOpen(true)
  }

  const handleOpenPreview = (blog: BlogItem) => {
    setPreviewBlog(blog)
    setIsPreviewOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error(t("Please provide a blog title"))
      return
    }
    if (!form.content.trim()) {
      toast.error(t("Please write blog content"))
      return
    }

    try {
      if (editingBlog) {
        await updateBlog({ id: editingBlog._id, data: form }).unwrap()
        toast.success(t("Blog post updated successfully"))
      } else {
        await createBlog(form).unwrap()
        toast.success(t("Blog post published successfully"))
      }
      setIsDialogOpen(false)
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to save blog post"))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("Are you sure you want to delete this blog post?"))) return
    try {
      await deleteBlog(id).unwrap()
      toast.success(t("Blog post deleted successfully"))
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to delete blog post"))
    }
  }

  const filteredBlogs = blogs.filter((b) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      b.title.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.authorName?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="fadeIn space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("Manage Blog Posts")}
          </h1>
          <p className="text-muted-foreground">
            {t("Publish and edit health, clinic workflow, and feature guides displayed on the public landing page.")}
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="font-semibold cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          {t("Write New Blog")}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("All Published & Draft Articles")}</CardTitle>
            <CardDescription>
              {t("Articles created with the rich text editor will be formatted and rendered on the landing page.")}
            </CardDescription>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Search by title, category...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 stroke-[1.5] text-muted-foreground/60 mb-3" />
              <p className="text-base font-semibold">{t("No blog posts found")}</p>
              <p className="text-sm mt-1">{t("Create your first blog post to publish on the landing page.")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">{t("Article")}</th>
                    <th className="px-4 py-3">{t("Category")}</th>
                    <th className="px-4 py-3">{t("Author")}</th>
                    <th className="px-4 py-3">{t("Status")}</th>
                    <th className="px-4 py-3">{t("Date")}</th>
                    <th className="px-4 py-3 text-right">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBlogs.map((b) => (
                    <tr key={b._id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 max-w-md">
                        <div className="font-semibold text-foreground truncate">
                          {b.title}
                        </div>
                        {b.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {b.description}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="font-medium">
                          {b.category || "Healthcare"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-muted-foreground">
                        {b.authorName || "Admin"}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={b.isPublished ? "default" : "secondary"}
                          className="font-medium"
                        >
                          {b.isPublished ? t("Published") : t("Draft")}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {b.createdAt
                          ? format(new Date(b.createdAt), "MMM dd, yyyy")
                          : "-"}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            title={t("Preview")}
                            onClick={() => handleOpenPreview(b)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            title={t("Edit")}
                            onClick={() => handleOpenEdit(b)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                            title={t("Delete")}
                            onClick={() => handleDelete(b._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT BLOG DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBlog ? t("Edit Blog Post") : t("Write New Blog Post")}
            </DialogTitle>
            <DialogDescription>
              {t("Compose informative healthcare and clinic technology guides with the rich text editor.")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">{t("Title")} *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 5 Ways to Automate Clinic Appointments & Billing"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">{t("Category")}</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Healthcare Technology"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="authorName">{t("Author Name")}</Label>
                <Input
                  id="authorName"
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  placeholder="e.g. Dr. Nahid Hasan"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">{t("Featured Image (Upload file or enter URL)")}</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://... or upload below"
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <span className="inline-flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 transition-colors">
                    {isUploadingImage ? t("Uploading...") : t("Upload Image")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploadingImage}
                  />
                </label>
              </div>
              {form.image && (
                <div className="flex items-center gap-3 p-2 border rounded-lg bg-muted/40">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-12 w-20 object-cover rounded border"
                  />
                  <div className="text-xs text-muted-foreground truncate flex-1">
                    {form.image}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => setForm({ ...form, image: "" })}
                  >
                    {t("Remove")}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">{t("Short Summary / Excerpt")}</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A brief teaser for the blog card on the landing page..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("Blog Content (Rich Text Editor)")} *</Label>
              <div className="min-h-[220px]">
                <RichEditor
                  value={form.content}
                  onChange={(content) => setForm({ ...form, content })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-base">{t("Publish on Landing Page")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("When enabled, this article is publicly viewable on the website.")}
                </p>
              </div>
              <Switch
                checked={form.isPublished}
                onCheckedChange={(checked) =>
                  setForm({ ...form, isPublished: checked })
                }
              />
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {editingBlog ? t("Update Post") : t("Publish Post")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PREVIEW MODAL */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          {previewBlog && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{previewBlog.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    By {previewBlog.authorName} •{" "}
                    {previewBlog.createdAt
                      ? format(new Date(previewBlog.createdAt), "MMMM dd, yyyy")
                      : ""}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-bold">
                  {previewBlog.title}
                </DialogTitle>
                {previewBlog.description && (
                  <DialogDescription className="text-base text-foreground/80 mt-2">
                    {previewBlog.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              {previewBlog.image && (
                <div className="aspect-video relative rounded-lg overflow-hidden border">
                  <img
                    src={previewBlog.image}
                    alt={previewBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Rendered HTML from Rich Text Editor */}
              <div
                className="prose dark:prose-invert max-w-none pt-4 border-t"
                dangerouslySetInnerHTML={{ __html: previewBlog.content }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManageBlogs

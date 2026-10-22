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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import {
  Mail,
  MailOpen,
  Trash2,
  Search,
  MessageSquare,
  Clock,
  Phone,
  User,
  CheckCircle2,
} from "lucide-react"
import {
  useGetContactMessagesQuery,
  useUpdateContactMessageStatusMutation,
  useDeleteContactMessageMutation,
  type ContactMessageItem,
} from "@/lib/store/api/services/contact.service"
import { toast } from "sonner"
import { format } from "date-fns"

export const ManageContactMessages: React.FC = () => {
  const { t } = useTranslation()
  const { data: messages = [], isLoading } = useGetContactMessagesQuery()
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateContactMessageStatusMutation()
  const [deleteMessage] = useDeleteContactMessageMutation()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessageItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")

  const handleOpenDetail = async (msg: ContactMessageItem) => {
    setSelectedMessage(msg)
    setAdminNotes(msg.adminNotes || "")
    setIsDetailOpen(true)

    // Automatically mark as READ if UNREAD
    if (msg.status === "UNREAD") {
      try {
        await updateStatus({
          id: msg._id,
          status: "READ",
          adminNotes: msg.adminNotes,
        }).unwrap()
      } catch (e) {
        // non-blocking
      }
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedMessage) return
    try {
      await updateStatus({
        id: selectedMessage._id,
        status: newStatus,
        adminNotes,
      }).unwrap()
      toast.success(t("Status updated to {{status}}", { status: newStatus }))
      setSelectedMessage((prev) =>
        prev ? { ...prev, status: newStatus as any, adminNotes } : null
      )
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to update message status"))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("Are you sure you want to delete this message?"))) return
    try {
      await deleteMessage(id).unwrap()
      toast.success(t("Message deleted successfully"))
      if (selectedMessage?._id === id) {
        setIsDetailOpen(false)
      }
    } catch (err: any) {
      toast.error(err?.data?.message || t("Failed to delete message"))
    }
  }

  const filteredMessages = messages.filter((m) => {
    if (statusFilter !== "ALL" && m.status !== statusFilter) return false
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      m.firstName?.toLowerCase().includes(q) ||
      m.lastName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q)
    )
  })

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length

  return (
    <div className="fadeIn space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("Contact Inquiries & Messages")}
          </h1>
          <p className="text-muted-foreground">
            {t("Direct inquiries, demo requests, and messages submitted from the public landing page.")}
          </p>
        </div>

        {unreadCount > 0 && (
          <Badge className="bg-amber-500 text-white px-3 py-1 text-sm font-semibold">
            {unreadCount} {t("Unread Messages")}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("Received Messages")}</CardTitle>
            <CardDescription>
              {t("Messages received from potential clinic owners, partners, and patients.")}
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder={t("Filter Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("All Status")}</SelectItem>
                <SelectItem value="UNREAD">{t("Unread")}</SelectItem>
                <SelectItem value="READ">{t("Read")}</SelectItem>
                <SelectItem value="RESOLVED">{t("Resolved")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search inquiries...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12 stroke-[1.5] text-muted-foreground/60 mb-3" />
              <p className="text-base font-semibold">{t("No contact inquiries found")}</p>
              <p className="text-sm mt-1">{t("When visitors submit the landing contact form, messages appear here.")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">{t("Sender")}</th>
                    <th className="px-4 py-3">{t("Subject & Message Preview")}</th>
                    <th className="px-4 py-3">{t("Status")}</th>
                    <th className="px-4 py-3">{t("Received Date")}</th>
                    <th className="px-4 py-3 text-right">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMessages.map((msg) => {
                    const isUnread = msg.status === "UNREAD"
                    return (
                      <tr
                        key={msg._id}
                        className={`transition-colors cursor-pointer ${
                          isUnread
                            ? "bg-primary/5 hover:bg-primary/10 font-medium"
                            : "hover:bg-muted/40"
                        }`}
                        onClick={() => handleOpenDetail(msg)}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            {isUnread ? (
                              <Mail className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold text-foreground">
                                {msg.firstName} {msg.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {msg.email} {msg.phone ? `• ${msg.phone}` : ""}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 max-w-sm">
                          <div className="font-semibold text-foreground truncate">
                            {msg.subject}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {msg.message}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <Badge
                            variant={
                              msg.status === "RESOLVED"
                                ? "default"
                                : msg.status === "READ"
                                ? "secondary"
                                : "outline"
                            }
                            className={`font-semibold ${
                              msg.status === "UNREAD"
                                ? "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                                : msg.status === "RESOLVED"
                                ? "bg-emerald-600 text-white"
                                : ""
                            }`}
                          >
                            {msg.status}
                          </Badge>
                        </td>

                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {msg.createdAt
                            ? format(new Date(msg.createdAt), "MMM dd, yyyy · hh:mm a")
                            : "-"}
                        </td>

                        <td
                          className="px-4 py-3.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() => handleDelete(msg._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MESSAGE DETAILS DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md sm:max-w-xl">
          {selectedMessage && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={
                      selectedMessage.status === "RESOLVED"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedMessage.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {selectedMessage.createdAt
                      ? format(
                          new Date(selectedMessage.createdAt),
                          "MMMM dd, yyyy · hh:mm a"
                        )
                      : ""}
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold mt-2">
                  {selectedMessage.subject}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {t("From")}: {selectedMessage.firstName} {selectedMessage.lastName}
                </DialogDescription>
              </DialogHeader>

              {/* Contact Info Box */}
              <div className="rounded-lg bg-muted/60 p-3 text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-primary hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="text-primary hover:underline"
                    >
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase font-semibold">
                  {t("Message Content")}
                </Label>
                <div className="rounded-lg border p-4 bg-card text-foreground text-sm whitespace-pre-wrap leading-relaxed min-h-[100px]">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Admin Note Input */}
              <div className="space-y-1.5">
                <Label htmlFor="adminNotes">{t("Internal Admin Notes")}</Label>
                <Textarea
                  id="adminNotes"
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t("Notes on follow-up, reply sent, or requirements...")}
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("RESOLVED")}
                    disabled={isUpdating || selectedMessage.status === "RESOLVED"}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
                    {t("Mark Resolved")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("READ")}
                    disabled={isUpdating || selectedMessage.status === "READ"}
                  >
                    {t("Mark Read")}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                      selectedMessage.subject
                    )}`}
                  >
                    <Button type="button" size="sm">
                      <Mail className="mr-1.5 h-4 w-4" />
                      {t("Reply via Email")}
                    </Button>
                  </a>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManageContactMessages

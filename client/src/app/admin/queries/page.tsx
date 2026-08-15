'use client';

import React, { useState } from 'react';
import {
  MessageSquare, Mail, Trash2, Send, RefreshCw,
  CheckCircle2, Clock, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetContactMessagesQuery,
  useMarkContactReadMutation,
  useReplyContactMutation,
  useDeleteContactMutation,
  type ContactMessage,
} from '@/store/services/contactApi';

/* ── Status badge ── */
function StatusBadge({ status }: { status: ContactMessage['status'] }) {
  const map = {
    unread:  { cls: 'bg-red-50 text-red-700 border-red-200',      label: 'Unread' },
    read:    { cls: 'bg-gray-100 text-gray-600 border-gray-200',  label: 'Read' },
    replied: { cls: 'bg-green-50 text-green-700 border-green-200', label: 'Replied' },
  };
  const { cls, label } = map[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${cls}`}>{label}</span>
  );
}

/* ── Single message card ── */
function MessageCard({ msg }: { msg: ContactMessage }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  const [markRead] = useMarkContactReadMutation();
  const [replyContact, { isLoading: sending }] = useReplyContactMutation();
  const [deleteContact, { isLoading: deleting }] = useDeleteContactMutation();

  const handleExpand = async () => {
    setExpanded(!expanded);
    if (!expanded && msg.status === 'unread') {
      try { await markRead(msg._id); } catch { /* silent */ }
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) { toast.error('Reply cannot be empty.'); return; }
    try {
      await replyContact({ id: msg._id, reply: reply.trim() }).unwrap();
      toast.success(`Reply sent to ${msg.email}!`);
      setReply('');
      setShowReplyBox(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send reply.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContact(msg._id).unwrap();
      toast.success('Message deleted.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm transition-all ${
        msg.status === 'unread' ? 'border-red-200' : 'border-gray-100'
      }`}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 rounded-2xl transition-all"
        onClick={handleExpand}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
            {msg.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-gray-900 truncate">{msg.name}</p>
            <p className="text-xs text-gray-500 truncate">{msg.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          <p className="hidden sm:block text-xs font-semibold text-gray-700 max-w-[200px] truncate">
            {msg.subject}
          </p>
          <StatusBadge status={msg.status} />
          <p className="hidden md:block text-xs text-gray-400">
            {new Date(msg.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-gray-100 pt-4">
          {/* Subject */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Subject</p>
            <p className="text-sm font-semibold text-gray-800">{msg.subject}</p>
          </div>

          {/* Message */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Message</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
              {msg.message}
            </p>
          </div>

          {/* Previous reply */}
          {msg.adminReply && (
            <div>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Your Reply</p>
              <p className="text-sm text-green-800 bg-green-50 rounded-xl p-4 leading-relaxed whitespace-pre-wrap border border-green-100">
                {msg.adminReply}
              </p>
              {msg.repliedAt && (
                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  Replied on {new Date(msg.repliedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              {msg.adminReply ? 'Send Another Reply' : 'Reply by Email'}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 className="w-3.5 h-3.5" /> Delete</>
              )}
            </button>

            {msg.status === 'read' && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Marked as read
              </div>
            )}
          </div>

          {/* Reply box */}
          {showReplyBox && (
            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <Mail className="w-3.5 h-3.5" />
                Replying to:{' '}
                <span className="font-bold text-black">{msg.email}</span>
              </div>
              <textarea
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here…"
                className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-black/10 focus:border-black resize-none transition-all"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReply}
                  disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {sending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Send Reply</>
                  )}
                </button>
                <button
                  onClick={() => setShowReplyBox(false)}
                  className="px-4 py-2.5 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function AdminQueriesPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const { data: messages = [], isLoading, refetch, isFetching } = useGetContactMessagesQuery(
    undefined,
    { refetchOnMountOrArgChange: true },
  );

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);
  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" /> User Queries
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Messages from the Contact Us form
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-60"
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',   value: messages.length, color: 'text-gray-900' },
          { label: 'Unread',  value: messages.filter((m) => m.status === 'unread').length,  color: 'text-red-600' },
          { label: 'Read',    value: messages.filter((m) => m.status === 'read').length,    color: 'text-gray-600' },
          { label: 'Replied', value: messages.filter((m) => m.status === 'replied').length, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'unread', 'read', 'replied'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === f
                ? 'bg-black text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Messages list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading messages…
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center bg-white rounded-2xl border border-gray-100">
          <Clock className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-bold text-gray-500">No messages in this category</p>
          <p className="text-xs text-gray-400">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((msg) => (
            <MessageCard key={msg._id} msg={msg} />
          ))}
        </div>
      )}
    </div>
  );
}

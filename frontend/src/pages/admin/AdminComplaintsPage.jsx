import React, { useState, useEffect, useMemo } from 'react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Drawer } from '../../components/ui/Drawer';
import { Skeleton, EmptyState } from '../../components/ui/EmptyState';
import { ComplaintDetailView } from '../../components/complaint/ComplaintDetailView';
import {
  formatRelativeTime,
  CATEGORIES,
  PRIORITIES,
  STATUSES,
} from '../../lib/formatters';
import {
  Search,
  Filter,
  ArrowUpDown,
  RotateCw,
  CheckSquare,
  Square,
  Wrench,
  CheckCircle2,
  Trash2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../services/api';

export function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Sorting & Pagination
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeComplaint, setActiveComplaint] = useState(null);

  // Technicians for assignment
  const technicians = [
    { _id: 'tech-1', name: 'Ramesh Kumar', staffTrade: 'Electrician' },
    { _id: 'tech-2', name: 'Suresh Patel', staffTrade: 'Plumber' },
    { _id: 'tech-3', name: 'Deepak Sharma', staffTrade: 'Carpenter' },
  ];

  const fetchComplaints = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get('/complaints?limit=100');
      const list = res.data.complaints || res.data.data || [];
      setComplaints(list);
    } catch (err) {
      toast.error('Failed to load master complaints queue');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filter & Sort Pipeline
  const filteredAndSorted = useMemo(() => {
    let result = complaints.filter((c) => {
      const matchesStatus =
        statusFilter === 'All' ||
        (c.status || '').toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === 'All' ||
        (c.category || '').toLowerCase() === categoryFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === 'All' ||
        (c.priority || '').toLowerCase() === priorityFilter.toLowerCase();

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.ticketId?.toLowerCase().includes(q) ||
        c.roomNumber?.toLowerCase().includes(q) ||
        c.student?.name?.toLowerCase().includes(q);

      return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    complaints,
    statusFilter,
    categoryFilter,
    priorityFilter,
    search,
    sortField,
    sortDirection,
  ]);

  // Pagination Slice
  const totalCount = filteredAndSorted.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, page, pageSize]);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRows.map((r) => r._id));
    }
  };

  const toggleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Status Change
  const handleBulkStatus = async (newStatus) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          api.patch(`/complaints/${id}/status`, { status: newStatus })
        )
      );
      toast.success(`Updated ${selectedIds.length} tickets to ${newStatus}`);
      setSelectedIds([]);
      fetchComplaints();
    } catch (err) {
      toast.error('Bulk update encountered errors');
    }
  };

  const clearAllFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters =
    statusFilter !== 'All' ||
    categoryFilter !== 'All' ||
    priorityFilter !== 'All' ||
    search !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Master Complaints Queue
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Complete institutional maintenance ledger with multi-column filtering, bulk delegation, and audit inspection.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchComplaints}
          isLoading={isRefreshing}
          className="text-xs self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
      </div>

      {/* Multi-Criteria Filter Bar */}
      <div className="my-6 p-4 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-subtle)] space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <Input
              placeholder="Search title, student, room, ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-3 text-xs"
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 text-xs rounded-[10px] bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--brand-teal)] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Category Filter Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 text-xs rounded-[10px] bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--brand-teal)] cursor-pointer"
          >
            <option value="All">All Trades / Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Priority Filter Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 text-xs rounded-[10px] bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--brand-teal)] cursor-pointer"
          >
            <option value="All">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--priority-critical)]"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* TanStack Table UI */}
      <div className="rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : paginatedRows.length === 0 ? (
          <EmptyState
            title="No matching complaints"
            description="Adjust your search query or filter chips to view more records."
            actionLabel="Reset All Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--bg-subtle)]/70 sticky top-0 z-10 border-b border-[var(--border-color)]">
                <tr className="text-[11px] font-mono-numbers text-[var(--text-muted)] uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {selectedIds.length > 0 &&
                      selectedIds.length === paginatedRows.length ? (
                        <CheckSquare className="w-4 h-4 text-[var(--brand-teal)]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Room</th>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Issue Title</th>
                  <th className="py-3 px-3">Trade</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th
                    className="py-3 px-3 cursor-pointer select-none hover:text-[var(--text-primary)]"
                    onClick={() => {
                      setSortField('createdAt');
                      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Logged</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {paginatedRows.map((item) => {
                  const isSelected = selectedIds.includes(item._id);
                  const isCritical = (item.priority || '').toLowerCase() === 'critical';

                  return (
                    <tr
                      key={item._id}
                      onClick={() => setActiveComplaint(item)}
                      className={`hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group ${
                        isSelected ? 'bg-[var(--brand-teal-subtle)]/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => toggleSelectRow(item._id, e)}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[var(--brand-teal)] mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 text-[var(--text-muted)] mx-auto group-hover:text-[var(--text-primary)]" />
                        )}
                      </td>

                      {/* Ticket ID */}
                      <td className="py-3 px-3 font-mono-numbers font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-teal)] whitespace-nowrap">
                        {item.ticketId || `#${item._id.slice(-4)}`}
                      </td>

                      {/* Room */}
                      <td className="py-3 px-3 font-mono-numbers font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        {item.roomNumber || '—'}
                      </td>

                      {/* Student */}
                      <td className="py-3 px-3 whitespace-nowrap text-[var(--text-secondary)]">
                        {item.student?.name || 'Resident'}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3 font-medium text-[var(--text-primary)] max-w-xs truncate">
                        {item.title}
                      </td>

                      {/* Trade / Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <CategoryBadge category={item.category} />
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityBadge priority={item.priority} />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3 whitespace-nowrap text-[var(--text-muted)] font-mono-numbers">
                        {formatRelativeTime(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer: Pagination & Counts */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-[var(--border-color)] bg-[var(--bg-subtle)]/30 text-xs">
          <div className="text-[var(--text-muted)] font-mono-numbers">
            Showing{' '}
            <strong className="text-[var(--text-primary)]">
              {paginatedRows.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-[var(--text-primary)]">
              {Math.min(page * pageSize, totalCount)}
            </strong>{' '}
            of <strong className="text-[var(--text-primary)]">{totalCount}</strong>{' '}
            records
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 px-2 rounded-[6px] bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs cursor-pointer"
            >
              {[10, 20, 50].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 px-2.5"
              >
                Prev
              </Button>
              <span className="font-mono-numbers px-2 text-[var(--text-secondary)]">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-2.5"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar (Slides up when rows selected) */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-elevated)] flex items-center gap-4 text-xs"
          >
            <span className="font-mono-numbers font-semibold text-[var(--text-primary)]">
              {selectedIds.length} ticket{selectedIds.length !== 1 ? 's' : ''} selected
            </span>

            <div className="h-4 w-px bg-[var(--border-color)]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-muted)]">Set Status:</span>
              <button
                type="button"
                onClick={() => handleBulkStatus('In Progress')}
                className="px-2.5 py-1 rounded-full bg-[var(--status-progress-bg)] text-[var(--status-progress)] font-medium hover:opacity-90 cursor-pointer"
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus('Resolved')}
                className="px-2.5 py-1 rounded-full bg-[var(--status-resolved-bg)] text-[var(--status-resolved)] font-medium hover:opacity-90 cursor-pointer"
              >
                Resolved
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatus('Closed')}
                className="px-2.5 py-1 rounded-full bg-[var(--status-closed-bg)] text-[var(--status-closed)] font-medium hover:opacity-90 cursor-pointer"
              >
                Closed
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inspection Drawer */}
      <Drawer
        isOpen={!!activeComplaint}
        onClose={() => setActiveComplaint(null)}
        title={activeComplaint?.title || 'Inspection Panel'}
        subtitle={activeComplaint?.ticketId || 'Audit Log'}
        width="max-w-2xl"
      >
        <ComplaintDetailView
          complaint={activeComplaint}
          technicians={technicians}
          onUpdate={(updated) => {
            setActiveComplaint(updated);
            setComplaints((prev) =>
              prev.map((c) => (c._id === updated._id ? updated : c))
            );
          }}
        />
      </Drawer>
    </div>
  );
}

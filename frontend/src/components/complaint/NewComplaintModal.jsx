import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { CATEGORIES, PRIORITIES } from '../../lib/formatters';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

export function NewComplaintModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const MAX_DESC_CHARS = 500;

  // Handle local image selection & base64 preview
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image exceeds maximum 5MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageUrl(reader.result); // Base64 string payload
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both an issue title and description.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/complaints', {
        title: title.trim(),
        category,
        priority,
        roomNumber: user?.roomNumber || 'A-101',
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      toast.success('Complaint lodged successfully! Ticket created.');
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
      setImagePreview('');
      setCategory(CATEGORIES[0].id);
      setPriority('Medium');
      onClose();

      if (onCreated) {
        onCreated(res.data.complaint || res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to lodge complaint.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lodge Maintenance Request"
      subtitle="Report a residential facility fault to the campus operations desk"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-[10px] bg-[var(--priority-critical-bg)] border border-[var(--priority-critical)]/30 text-xs text-[var(--priority-critical)] font-medium">
            {error}
          </div>
        )}

        {/* Room number banner */}
        <div className="p-3 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)]">Assigned Room:</span>
          <span className="font-mono-numbers font-semibold text-[var(--brand-teal)] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            {user?.roomNumber || 'Room B-204'}
          </span>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Issue Title
          </label>
          <Input
            placeholder="e.g. Bathroom geyser MCB trips immediately upon power-on"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category Icon Grid Tiles */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Select Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-[10px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--brand-teal-subtle)] border-[var(--brand-teal)] text-[var(--brand-teal)] shadow-sm'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4" strokeWidth={isSelected ? 2 : 1.5} />
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-semibold leading-tight">{cat.label}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{cat.hint}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Segmented Control */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Severity / Urgency Priority
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            {PRIORITIES.map((pri) => {
              const isSelected = priority === pri.id;
              return (
                <button
                  key={pri.id}
                  type="button"
                  onClick={() => setPriority(pri.id)}
                  className={`p-2 rounded-[8px] text-xs font-medium transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-subtle)] border border-[var(--border-color)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: pri.color }}
                    />
                    <span>{pri.label}</span>
                  </div>
                  <span className="block text-[9px] text-[var(--text-muted)] font-mono-numbers mt-0.5">
                    {pri.id === 'Critical' ? '<4h SLA' : pri.id === 'High' ? '<24h' : '<48h'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description with Character Counter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              Detailed Description
            </label>
            <span
              className={`text-[10px] font-mono-numbers ${
                description.length > MAX_DESC_CHARS * 0.9
                  ? 'text-[var(--priority-critical)] font-bold'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {description.length}/{MAX_DESC_CHARS}
            </span>
          </div>
          <Textarea
            placeholder="Please provide specific details: when did it start, exact bathroom or switchboard location, and any troubleshooting already attempted..."
            value={description}
            maxLength={MAX_DESC_CHARS}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="min-h-[100px]"
          />
        </div>

        {/* Image Upload Zone */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            Attach Verification Image <span className="text-[var(--text-muted)] font-normal">(Optional)</span>
          </label>

          {imagePreview ? (
            <div className="relative rounded-[10px] overflow-hidden border border-[var(--border-color)] p-2 bg-[var(--bg-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-12 h-12 rounded-[6px] object-cover border border-[var(--border-color)]"
                />
                <span className="text-xs text-[var(--text-secondary)] font-mono-numbers">
                  Image attached (Ready to upload)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImagePreview('');
                  setImageUrl('');
                }}
                className="p-1 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--priority-critical)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 rounded-[10px] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer text-center">
              <Upload className="w-6 h-6 text-[var(--text-muted)] mb-2" strokeWidth={1.5} />
              <p className="text-xs font-medium text-[var(--text-primary)]">
                Click to browse photo or drag & drop here
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                PNG, JPG, or WEBP up to 5MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={!title.trim() || !description.trim()}
          >
            Submit Complaint
          </Button>
        </div>
      </form>
    </Modal>
  );
}

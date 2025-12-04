import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Use environment variable or fallback to localhost:5000
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

/**
 * Admin API Hooks
 * React Query hooks for all admin dashboard API calls
 */

// ============================================
// API Functions
// ============================================

interface BookingFilters {
  search?: string;
  status?: string;
  cuisinePreference?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

async function fetchBookings(filters: BookingFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/admin/bookings?${params}`);
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
}

async function fetchBookingById(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}`);
  if (!response.ok) throw new Error('Failed to fetch booking');
  return response.json();
}

async function deleteBooking(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete booking');
  return response.json();
}

async function updateBookingStatus(id: string, status: string) {
  const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update booking status');
  return response.json();
}

async function fetchAnalytics() {
  const response = await fetch(`${API_BASE_URL}/admin/analytics`);
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

async function fetchCuisines() {
  const response = await fetch(`${API_BASE_URL}/admin/cuisines`);
  if (!response.ok) throw new Error('Failed to fetch cuisines');
  return response.json();
}

function downloadCsv() {
  window.open(`${API_BASE_URL}/admin/export/csv`, '_blank');
}

function downloadPdf() {
  window.open(`${API_BASE_URL}/admin/export/pdf`, '_blank');
}

// ============================================
// React Query Hooks
// ============================================

export function useBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => fetchBookings(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useBookingById(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => fetchBookingById(id),
    enabled: !!id,
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 60000, // 1 minute
  });
}

export function useCuisines() {
  return useQuery({
    queryKey: ['cuisines'],
    queryFn: fetchCuisines,
    staleTime: 300000, // 5 minutes
  });
}

export { downloadCsv, downloadPdf };

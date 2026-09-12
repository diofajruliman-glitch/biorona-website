export type Testimonial = {
  id: string;
  customerName: string;
  quote: string;
  occasion?: string;
  source?: string;
};

// Tambahkan hanya testimonial asli yang sudah mendapat izin untuk dipublikasikan.
export const testimonials: Testimonial[] = [];

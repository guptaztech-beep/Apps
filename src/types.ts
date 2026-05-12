export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Reactions {
  like: number;
  informative: number;
  helpful: number;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: string;
  imageUrl: string;
  galleryImages?: string[];
  officialLinks?: { label: string; url: string }[];
  ctaButtons?: { label: string; url: string; variant?: 'primary' | 'secondary' }[];
  isFeatured?: boolean;
  comments?: Comment[];
  reactions?: Reactions;
}

export type Category = string | 'All';

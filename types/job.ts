import { User } from "./user";

export interface Worker {
  id: number;
  userId: number;
  bio: string;
  avatar?: string;
  skills: string[];
  title: string;
  experience: number;
  averageRating?: number;
  user: User;
}

export interface JobApplication {
  id: number;
  jobId: number;
  workerId: number;
  worker?:Worker,
  description?:string;
  proposedPrice?:number,
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  userId: number;
  jobId: number;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Reaction {
  id: number;
  type: string;
  userId: number;
  user:User;
  jobId: number;
  createdAt: string;
}

export interface Media {
  id: number;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  jobId: number;
  createdAt: string;
  serviceId?: number;
}

export interface Share {
  id: number;
  userId: number;
  jobId: number;
  createdAt: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  clientId: number;
  workerId: number;
  jobId: number;
  createdAt: string;
}

export interface Payment {
  id: number;
  amount: number;
  status: string;
  jobId: number;
  createdAt: string;
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  price: number;
  clientId: number;
  workerId?: number;
  serviceId?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tagId?: number;
  negotiationPhase: 'INITIAL' | 'NEGOTIATING' | 'AGREED' | 'DECLINED';
  currentPrice?: number;
  proposedPrice?: number;
  client: User;
  worker?: Worker;
  media: Media[];
  reactions: Reaction[];
  comments: Comment[];
  shares: Share[];
  Tag?: Tag;
  review?: Review;
  JobApplication: JobApplication[];
  payment?: Payment;
  service?: any;
}

export interface UserRegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'CLIENT' | 'WORKER';
}
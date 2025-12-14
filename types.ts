import React from 'react';

export type Theme = 'light' | 'soft' | 'retro' | 'organic' | 'breeze' | 'dusk' | 'ember' | 'void' | 'dark';

export interface Project {
  id: number;
  title: string;
  category: string;
  industry?: string;
  image: string;
  description: string;
  link?: string;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  points?: string[];
}

export interface Testimonial {
  id: number;
  text: string;
  author: string;
  position: string;
  image?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}
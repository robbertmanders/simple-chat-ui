
/// <reference types="vite/client" />

// Define a union type for content (either Note or Doc)
interface Content {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}


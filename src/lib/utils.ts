
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper for determining if we're navigating up or down in the sidebar
export function getNavigationDirection(from: string, to: string): 'up' | 'down' | null {
  const routeOrder: Record<string, number> = {
    '/all-tasks': 0,
    '/life': 1,
    '/life/skills': 2,
    '/finance': 3,
    '/': 4,
    '/docs': 5,
    '/travel': 6,
    '/recipes': 7,
    '/chat': 8
  };
  
  // Get base routes
  const fromBase = from === '/' ? '/' : 
                  from.startsWith('/project') ? '/' : 
                  from.startsWith('/all-tasks') ? '/all-tasks' :
                  from.startsWith('/docs') ? '/docs' :
                  from.startsWith('/life/skills') ? '/life/skills' :
                  from.startsWith('/life') ? '/life' : from;
                  
  const toBase = to === '/' ? '/' : 
                to.startsWith('/project') ? '/' : 
                to.startsWith('/all-tasks') ? '/all-tasks' :
                to.startsWith('/docs') ? '/docs' :
                to.startsWith('/life/skills') ? '/life/skills' :
                to.startsWith('/life') ? '/life' : to;
  
  const fromValue = routeOrder[fromBase];
  const toValue = routeOrder[toBase];
  
  if (fromValue === undefined || toValue === undefined) return null;
  
  // When navigating down the list (to routes with higher numbers),
  // we want the 'down' animation (current content exits upward, new content enters from bottom)
  // When navigating up the list (to routes with lower numbers),
  // we want the 'up' animation (current content exits downward, new content enters from top)
  return toValue > fromValue ? 'down' : 'up';
}

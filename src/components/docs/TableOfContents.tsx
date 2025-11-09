import React, { useEffect, useState } from 'react';
interface Heading {
  id: string;
  text: string;
  level: number;
}
export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    const headingElements = Array.from(
      document.querySelectorAll('.prose h2, .prose h3')
    ) as HTMLHeadingElement[];
    const newHeadings = headingElements.map(heading => ({
      id: heading.id,
      text: heading.innerText,
      level: Number(heading.tagName.substring(1)),
    }));
    setHeadings(newHeadings);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );
    headingElements.forEach(heading => observer.observe(heading));
    return () => {
      headingElements.forEach(heading => observer.unobserve(heading));
    };
  }, []);
  if (headings.length === 0) {
    return null;
  }
  return (
    <aside className="sticky top-24 w-64 hidden xl:block">
      <h3 className="text-sm font-semibold mb-4 text-foreground">On this page</h3>
      <ul className="space-y-2">
        {headings.map(heading => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`text-sm transition-colors hover:text-primary ${
                heading.level === 3 ? 'pl-4' : ''
              } ${
                activeId === heading.id
                  ? 'font-medium text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
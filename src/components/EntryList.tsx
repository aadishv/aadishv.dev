import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

// @ts-ignore
import Fuse from "fuse.js";

type Entry = {
  slug: string;
  title: string;
  date: string;
  description: string;
  categories: string[];
  rawContent: string;
};

type EntryListProps = {
  entries: Entry[];
};

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function EntryList({ entries }: EntryListProps) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Entry[]>(entries);

  useEffect(() => {
    // Parse is: filters from the search query
    let query = search.trim();
    const isRegex = /\bis:([a-zA-Z0-9_-]+)\b/g;
    let match;
    const filters: string[] = [];
    let queryWithoutIs = query;

    // Extract all is: filters
    while ((match = isRegex.exec(query)) !== null) {
      filters.push(match[1].toLowerCase());
    }
    // Remove all is:... tokens from the query string
    queryWithoutIs = query.replace(/\bis:[a-zA-Z0-9_-]+\b/g, "").trim();

    // Apply filters
    let filteredEntries = entries;
    filters.forEach((filter) => {
      if (filter === "blog") {
        filteredEntries = filteredEntries.filter(
          (e) => !e.categories.includes("project"),
        );
      } else if (filter === "project") {
        filteredEntries = filteredEntries.filter((e) =>
          e.categories.includes("project"),
        );
      } else {
        // Generic is:category filter
        filteredEntries = filteredEntries.filter((e) =>
          e.categories.map((c) => c.toLowerCase()).includes(filter),
        );
      }
    });

    // Place entries with date '<top>' at the top
    const topEntries = filteredEntries.filter((e) => e.date === "<top>");
    const restEntries = filteredEntries.filter((e) => e.date !== "<top>");

    let finalEntries: Entry[];

    if (queryWithoutIs === "") {
      finalEntries = [...topEntries, ...restEntries];
      setFiltered(finalEntries);
    } else {
      // Use Fuse on filtered subset
      const fuseSubset = new Fuse(filteredEntries, {
        keys: ["title", "description", "rawContent", "categories"],
        includeScore: true,
        threshold: 0.35,
        ignoreLocation: true,
      });
      const results = fuseSubset.search(queryWithoutIs);
      // Place <top> entries at the top of search results as well
      const searchTop = results.map((r) => r.item).filter((e) => e.date === "<top>");
      const searchRest = results.map((r) => r.item).filter((e) => e.date !== "<top>");
      finalEntries = [...searchTop, ...searchRest];
      setFiltered(finalEntries);
    }
  }, [search, entries]);

  // Get unique categories (case-insensitive, but display original)
  const uniqueCategories = Array.from(
    entries
      .reduce((acc, entry) => {
        entry.categories.forEach((cat) => acc.set(cat.toLowerCase(), cat));
        return acc;
      }, new Map<string, string>())
      .values()
  );

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        {uniqueCategories.map((cat) => {
          const filterValue = `is:${cat.toLowerCase()}`;
          const isActive = search.trim().startsWith(filterValue);
          return (
            <Button
              key={cat}
              id={`filter-${cat.toLowerCase()}-btn`}
              variant="outline"
              className={isActive ? "bg-accent" : ""}
              onClick={() => {
                if (isActive) {
                  setSearch("");
                } else {
                  setSearch(filterValue);
                }
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          );
        })}
      </div>
      <Input
        type="text"
        id="search-bar"
        placeholder="Search entries (e.g., 'periodic' or 'is:project table')"
        className="w-full mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div id="entries-list-container">
        <ul id="entries-list" className="space-y-6">
          {filtered.length === 0 && search.trim() !== "" ? (
            <li>No results found.</li>
          ) : (
            filtered.map((entry) => (
              <div key={entry.slug} className="">
                <a
                  href={"/" + entry.slug}
                  className="text-xl decoration-none aadish-none"
                >
                  <span className="underline hover:decoration-none">
                    {entry.title}
                  </span>
                  {entry.categories.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="ml-2 font-normal"
                    >
                      {c}
                    </Badge>
                  ))}
                </a>
                <div className="">{entry.date == "<top>" ? "the future :D" : formatDate(entry.date)}</div>
                {entry.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {entry.description}
                  </p>
                )}
              </div>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default EntryList;

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import teamsData from './teams.json';

interface Team {
  Team: string;
  'Team Name': string;
  Organization: string;
  Location: string;
}

interface AppProps {
  initialProps?: {
    ranked: string;
    name: string;
  };
}

export function App({ initialProps }: AppProps) {
  const [teams, setTeams] = useState<Team[]>(teamsData);
  const [listName, setListName] = useState('My Fantasy AI Rankings');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    // Use initial props from Astro if available, otherwise check client-side URL params
    const rankedParam = initialProps?.ranked || new URLSearchParams(window.location.search).get('ranked');
    const nameParam = initialProps?.name || (() => {
      const urlName = new URLSearchParams(window.location.search).get('name');
      return urlName ? decodeURIComponent(urlName) : '';
    })();

    if (rankedParam) {
      try {
        const rankedIds = rankedParam.split(',');
        const orderedTeams = rankedIds.map(id => teamsData.find(team => team.Team === id)).filter(Boolean) as Team[];
        const remainingTeams = teamsData.filter(team => !rankedIds.includes(team.Team));
        setTeams([...orderedTeams, ...remainingTeams]);
      } catch (e) {
        console.error('Error parsing URL params:', e);
      }
    }

    if (nameParam) {
      setListName(nameParam);
    }
  }, [initialProps]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    const newTeams = [...teams];
    const draggedTeam = newTeams[draggedIndex];

    newTeams.splice(draggedIndex, 1);
    newTeams.splice(dropIndex, 0, draggedTeam);

    setTeams(newTeams);
    handleDragEnd();
  };

  const generateShareUrl = () => {
    const rankedIds = teams.map(team => team.Team).join(',');
    const params = new URLSearchParams();
    params.set('ranked', rankedIds);
    if (listName !== 'My Fantasy AI Rankings') {
      params.set('name', encodeURIComponent(listName));
    }

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    window.history.replaceState({}, '', url);
    
    // Show feedback that URL was copied
    const button = document.querySelector('[data-share-button]') as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 1000);
    }
  };

  const resetOrder = () => {
    setTeams(teamsData);
    setListName('My Fantasy AI Rankings');
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Fantasy AI Team Rankings</h1>
        <p className="text-muted-foreground mb-4">Drag teams to reorder your rankings!</p>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="listName">List Name</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="My Fantasy AI Rankings"
            />
          </div>
          <Button onClick={generateShareUrl} data-share-button>
            Share Rankings
          </Button>
          <Button variant="outline" onClick={resetOrder}>
            Reset Order
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {teams.map((team, index) => {
          const showDropZone = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;
          const isDragging = draggedIndex === index;

          return (
            <div key={team.Team}>
              {showDropZone && (
                <div className="h-20 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 border-2 border-dashed border-blue-400 rounded-lg mb-2 flex items-center justify-center text-blue-600 font-medium">
                  Drop here
                </div>
              )}
              <Card
                className={`cursor-move select-none ${isDragging ? 'opacity-50' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                        {index + 1}
                      </div>
                      <div className="text-muted-foreground cursor-grab active:cursor-grabbing select-none">
                        ⋮⋮
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg">{team.Team}</span>
                        <span className="font-medium">{team['Team Name']}</span>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {team.Organization} • {team.Location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
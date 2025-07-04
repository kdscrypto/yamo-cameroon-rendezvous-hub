
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MailOpen, Star, Flag, Archive, Users } from 'lucide-react';

interface MessageFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts?: {
    all: number;
    unread: number;
    favorites: number;
    important: number;
    archived: number;
  };
}

const MessageFilters = ({ activeFilter, onFilterChange, counts }: MessageFiltersProps) => {
  const filters = [
    {
      id: 'all',
      label: 'Tous',
      icon: Users,
      count: counts?.all || 0,
    },
    {
      id: 'unread',
      label: 'Non lus',
      icon: Mail,
      count: counts?.unread || 0,
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: Star,
      count: counts?.favorites || 0,
    },
    {
      id: 'important',
      label: 'Important',
      icon: Flag,
      count: counts?.important || 0,
    },
    {
      id: 'archived',
      label: 'Archivés',
      icon: Archive,
      count: counts?.archived || 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtres</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <Button
                key={filter.id}
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-between"
                onClick={() => onFilterChange(filter.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </div>
                {filter.count > 0 && (
                  <Badge variant={isActive ? 'secondary' : 'outline'}>
                    {filter.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageFilters;

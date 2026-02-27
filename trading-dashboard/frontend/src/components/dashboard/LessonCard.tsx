import { Lock, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

type LessonStatus = 'locked' | 'active' | 'complete';
type AccentColor = 'blue' | 'green' | 'purple' | 'orange';

interface LessonCardProps {
  lessonNumber: number;
  title: string;
  description: string;
  status: LessonStatus;
  accentColor?: AccentColor;
}

const ACCENT_STYLES: Record<AccentColor, { border: string; icon: string; glow: string }> = {
  blue: {
    border: 'border-blue-500',
    icon: 'text-blue-400',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.15)]',
  },
  green: {
    border: 'border-emerald-500',
    icon: 'text-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  },
  purple: {
    border: 'border-purple-500',
    icon: 'text-purple-400',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.15)]',
  },
  orange: {
    border: 'border-orange-500',
    icon: 'text-orange-400',
    glow: 'shadow-[0_0_12px_rgba(249,115,22,0.15)]',
  },
};

export default function LessonCard({ lessonNumber, title, description, status, accentColor = 'blue' }: LessonCardProps) {
  const isLocked = status === 'locked';
  const isActive = status === 'active';
  const isComplete = status === 'complete';
  const accent = ACCENT_STYLES[accentColor];

  return (
    <Card
      data-testid={`lesson-card-${lessonNumber}`}
      className={`border transition-all duration-200 bg-bg-secondary ${
        isActive
          ? `${accent.border} ${accent.glow}`
          : isComplete
          ? `${accent.border} opacity-80`
          : 'border-border-subtle opacity-50'
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-text-muted border-border-default text-xs">
            Lesson {lessonNumber}
          </Badge>
          {isLocked && <Lock className="h-4 w-4 text-text-muted" />}
          {isActive && <Play className={`h-4 w-4 ${accent.icon}`} />}
          {isComplete && <CheckCircle className="h-4 w-4 text-accent-bullish" />}
        </div>
        <CardTitle className={`text-base ${isLocked ? 'text-text-muted' : 'text-text-primary'}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-sm ${isLocked ? 'text-text-muted/60' : 'text-text-secondary'}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

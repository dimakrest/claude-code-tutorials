import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import LessonCard from './LessonCard';

type LessonStatus = 'locked' | 'active' | 'complete';
type AccentColor = 'blue' | 'green' | 'purple' | 'orange';
type ProgressData = { lessons: Record<string, LessonStatus> };
type StudentData = { name?: string; color?: AccentColor; ticker?: string };

const LESSON_METADATA = [
  { number: 1, title: 'Your First Chart', description: 'Build a professional candlestick chart with mock data' },
  { number: 2, title: 'Add Indicators', description: 'Add MA20 and CCI indicators with toggle controls' },
  { number: 3, title: 'Real Data', description: 'Connect to a database and fetch live stock prices' },
  { number: 4, title: 'Something Breaks', description: 'Debug a real bug using the Claude Code workflow' },
  { number: 5, title: 'The Screener', description: 'Build a mean-reversion stock screener with scored results' },
  { number: 6, title: 'Make It Yours', description: 'Customize and extend the app on your own' },
];

export default function ProgressDashboard() {
  const [progress, setProgress] = useState<ProgressData>({ lessons: {} });
  const [student, setStudent] = useState<StudentData>({});

  useEffect(() => {
    fetch('/progress.json')
      .then((r) => r.json())
      .then(setProgress)
      .catch(() => {});

    fetch('/student.json')
      .then((r) => r.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) setStudent(data);
      })
      .catch(() => {});
  }, []);

  const completedCount = Object.values(progress.lessons).filter((s) => s === 'complete').length;
  const totalLessons = LESSON_METADATA.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);
  const accentColor = student.color ?? 'blue';
  const displayName = student.name ?? 'Student';
  const allComplete = completedCount === totalLessons;

  return (
    <div data-testid="progress-dashboard" className="p-6 max-w-4xl mx-auto">
      <Card className="bg-bg-secondary border-border-subtle mb-6">
        <CardHeader>
          <CardTitle className="text-text-primary text-2xl font-display">
            {allComplete ? `Well done, ${displayName}.` : `${displayName}'s Trading Analyst Course`}
          </CardTitle>
          <p className="text-text-secondary text-sm">
            {allComplete
              ? 'All lessons complete. You built a stock analysis app with Claude Code.'
              : 'Build a professional stock analysis tool with Claude Code'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-text-muted text-sm font-mono whitespace-nowrap">
              {completedCount} / {totalLessons}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LESSON_METADATA.map((lesson) => (
          <LessonCard
            key={lesson.number}
            lessonNumber={lesson.number}
            title={lesson.title}
            description={lesson.description}
            status={progress.lessons[String(lesson.number)] ?? 'locked'}
            accentColor={accentColor}
          />
        ))}
      </div>
    </div>
  );
}

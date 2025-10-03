import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, BarChart3, Trophy, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Ruler } from 'lucide-react';

const mainNavItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const moreNavItems = [
  { to: '/social', icon: Users, label: 'Social' },
  { to: '/templates', icon: BookOpen, label: 'Templates' },
  { to: '/body-tracker', icon: Ruler, label: 'Body Tracker' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export const BottomNavigation = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border backdrop-blur-md z-50">
        <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
          {mainNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover-lift',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover-lift text-muted-foreground hover:text-primary hover:bg-primary/5">
                <Menu className="h-5 w-5" />
                <span className="text-xs font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="glass-card">
              <div className="py-4">
                <h2 className="text-xl font-bold mb-4 glow-text">More Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {moreNavItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover-lift gym-card',
                          isActive && 'border-primary shadow-glow'
                        )
                      }
                    >
                      <Icon className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium">{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
};
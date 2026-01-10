import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import anime from "animejs/lib/anime.es.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, Shield, LogOut, ArrowRight, LayoutDashboard } from "lucide-react";

export function Header() {
  const { user, logout, toggleDevMode } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group cursor-pointer" onMouseEnter={() => anime({ targets: '#logo-k-header', rotate: '1turn' })}>
        <img id="logo-k-header" src="/icon.png" alt="Kurikura" className="w-8 h-8 object-contain" />
        <span className="font-display font-bold tracking-tighter text-xl text-foreground">KURIKURA</span>
      </Link>

      {/* Navigation */}
      <div className="flex items-center gap-4 md:gap-8 text-sm font-medium tracking-wide">
        {user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-foreground/70 hover:text-primary transition-colors">
                  <UserIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border-border">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {user.email === import.meta.env.VITE_ADMIN_EMAIL && (
                  <DropdownMenuItem onClick={toggleDevMode}>
                    <Shield className="w-4 h-4 mr-2" />
                    {user.role === 'dev' ? 'Exit Dev Mode' : 'Enter Dev Mode'}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link to="/my-courses">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My Courses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link to="/login" className="text-foreground/70 hover:text-primary transition-colors">
            PORTAL
          </Link>
        )}

        {/* CTA Button */}
        {location.pathname !== "/make-course" && (
          <Link to="/make-course">
            <Button className="rounded-full px-6 bg-foreground text-background hover:bg-primary hover:text-white border-none font-bold tracking-tighter transition-all">
              GENERATE
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
